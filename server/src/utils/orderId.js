import crypto from 'crypto';

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const LENGTH = 8;

export const generateOrderId = () => {
  const bytes = crypto.randomBytes(LENGTH);
  let result = '';
  for (let i = 0; i < LENGTH; i++) {
    result += CHARS[bytes[i] % CHARS.length];
  }
  return result;
};
