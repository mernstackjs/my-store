import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/users.js';
import { sendPasswordReset } from '../utils/sendMail.js';

const signToken = (id) =>
  jwt.sign({ id }, process.env.JSON_SECRET, { expiresIn: '30d' });

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const user = await User.create({ name, email, password });

    res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token: signToken(user._id),
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token: signToken(user._id),
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res) => {
  res.json({ user: req.user });
};

export const updateMe = async (req, res, next) => {
  try {
    const { name, phone, address } = req.body;

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (phone !== undefined) updates.phone = phone;

    if (address) {
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (address.isDefault) {
        user.addresses.forEach((a) => { a.isDefault = false; });
      }

      const existingIdx = user.addresses.findIndex(
        (a) => a.street === address.street && a.city === address.city
      );

      if (existingIdx > -1) {
        user.addresses[existingIdx] = { ...user.addresses[existingIdx].toObject(), ...address };
      } else {
        user.addresses.push(address);
      }

      if (name !== undefined) user.name = name;
      await user.save();

      return res.json({ user });
    }

    if (Object.keys(updates).length > 0) {
      const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
      return res.json({ user });
    }

    res.json({ user: req.user });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res
        .status(200)
        .json({ message: 'If that email exists, a reset link has been sent' });
    }

    const resetToken = user.generatePasswordResetToken();
    await user.save({ validateBeforeSave: false });

    await sendPasswordReset({ to: user.email, token: resetToken });

    res.json({ message: 'If that email exists, a reset link has been sent' });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.body.token || req.query.token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: 'Token is invalid or has expired' });
    }

    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token: signToken(user._id),
    });
  } catch (error) {
    next(error);
  }
};
