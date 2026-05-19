import nodemailer from 'nodemailer';

let _transporter;

const getTransporter = () => {
  if (!_transporter) {
    _transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_NODEMAILER,
        pass: process.env.PASS_NODEMAILER,
      },
    });
  }
  return _transporter;
};

export const sendMail = async ({ to, subject, html }) => {
  const from = `My Store <${process.env.EMAIL_NODEMAILER}>`;
  await getTransporter().sendMail({ from, to, subject, html });
};

export const sendOrderConfirmation = async ({ to, orderId, total, items }) => {
  const itemsHtml = items
    .map(
      (item) =>
        `<tr>
          <td style="padding: 16px 8px; border-bottom: 1px solid #f3f4f6; color: #4b5563;">
            <strong style="color: #111827;">${item.name}</strong> 
            <span style="color: #9ca3af; font-size: 14px; margin-left: 8px;">x${item.quantity}</span>
          </td>
          <td style="padding: 16px 8px; border-bottom: 1px solid #f3f4f6; text-align: right; color: #4b5563; font-weight: 500;">
            $${item.price.toFixed(2)}
          </td>
        </tr>`,
    )
    .join('');

  const html = `
    <div style="background-color: #f9fafb; padding: 40px 20px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
        
        <div style="background-color: #111827; padding: 32px 24px; text-align: center;">
          <h2 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600; letter-spacing: 0.5px;">Order Confirmed</h2>
          <p style="margin: 8px 0 0 0; color: #9ca3af; font-size: 14px;">Order #${orderId}</p>
        </div>

        <div style="padding: 32px 24px;">
          <p style="margin-top: 0; color: #374151; font-size: 16px; line-height: 1.5;">Thanks for shopping with us! Here is a summary of your recent purchase:</p>
          
          <table style="width: 100%; border-collapse: collapse; margin-top: 24px; margin-bottom: 24px;">
            ${itemsHtml}
            <tr>
              <td style="padding: 24px 8px 8px 8px; font-weight: bold; color: #111827; font-size: 16px;">Total</td>
              <td style="padding: 24px 8px 8px 8px; text-align: right; font-weight: bold; color: #2563eb; font-size: 18px;">$${total.toFixed(2)}</td>
            </tr>
          </table>

          <div style="text-align: center; margin-top: 40px;">
            <p style="color: #6b7280; font-size: 14px; margin: 0;">We'll send you another email as soon as your order ships.</p>
          </div>
        </div>

      </div>
    </div>
  `;

  await sendMail({ to, subject: `Order Confirmed — ${orderId}`, html });
};

export const sendPasswordReset = async ({ to, token }) => {
  const url = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  const html = `
    <div style="background-color: #f9fafb; padding: 40px 20px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; padding: 40px 24px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); text-align: center;">
        
        <h2 style="margin-top: 0; color: #111827; font-size: 24px; font-weight: 600;">Password Reset Request</h2>
        
        <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 24px 0 32px 0;">
          We received a request to reset your password. Click the button below to choose a new one. <strong>This link is valid for 10 minutes.</strong>
        </p>
        
        <a href="${url}" style="display: inline-block; padding: 14px 32px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
          Reset My Password
        </a>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 40px 0 24px 0;" />
        
        <p style="color: #9ca3af; font-size: 13px; line-height: 1.5; margin: 0;">
          If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
        </p>

      </div>
    </div>
  `;

  await sendMail({ to, subject: 'Password Reset Request', html });
};
