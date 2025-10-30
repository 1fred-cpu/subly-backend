import { TemplateData } from '../types/email.type';

export const passwordResetTemplate = (data: TemplateData) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Password Reset Request</title>
  <style>
    @media (max-width: 600px) {
      .container {
        width: 100% !important;
        padding: 20px !important;
      }
      .button {
        width: 100% !important;
      }
    }
  </style>
</head>
<body style="margin:0; padding:0; background-color:#f9fafb; font-family:Arial, sans-serif; color:#111827;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table class="container" width="600" style="background-color:#ffffff; border-radius:10px; padding:40px; box-shadow:0 4px 10px rgba(0,0,0,0.05);">
          
          <!-- Header Icon -->
          <tr>
            <td align="center" style="padding-bottom: 20px;">
              <img src="https://cdn-icons-png.flaticon.com/512/6195/6195699.png" alt="Reset Password" width="64" height="64" style="display:block;" />
            </td>
          </tr>

          <!-- Title -->
          <tr>
            <td align="center" style="font-size:24px; font-weight:bold; color:#111827; padding-bottom:10px;">
              Reset Your Password
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="font-size:16px; line-height:1.6; color:#374151; padding-bottom:20px;">
              Hi ${data.name || 'there'},
              <br /><br />
              We received a request to reset your password for your <strong>NotifyStack</strong> account.  
              Click the button below to create a new password:
            </td>
          </tr>

          <!-- Reset Button -->
          <tr>
            <td align="center" style="padding-bottom:30px;">
              <a href="${data.url}" class="button"
                 style="display:inline-block; background-color:#ef4444; color:#ffffff; padding:14px 28px; font-size:16px; font-weight:bold; border-radius:6px; text-decoration:none;">
                 Reset Password
              </a>
            </td>
          </tr>

          <!-- Info Text -->
          <tr>
            <td style="font-size:14px; line-height:1.6; color:#6b7280; text-align:center; padding-bottom:30px;">
              This link will expire in <strong>60 minutes</strong> for your security.
              <br /><br />
              If you didn’t request a password reset, please ignore this email — your account is safe.
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="font-size:14px; line-height:1.5; color:#9ca3af; border-top:1px solid #e5e7eb; padding-top:20px; text-align:center;">
              Need help? <a href="mailto:support@notifystack.com" style="color:#ef4444; text-decoration:none;">Contact support</a>.
              <br /><br />
              &copy; ${new Date().getFullYear()} NotifyStack. All rights reserved.
            </td>
          </tr>
        </table>

        <!-- Fallback text -->
        <p style="font-size:13px; color:#9ca3af; margin-top:25px; text-align:center;">
          If the button above doesn't work, copy and paste the following link into your browser:<br />
          <a href="${data.url}" style="color:#ef4444; word-break:break-all;">${data.url}</a>
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
`;
