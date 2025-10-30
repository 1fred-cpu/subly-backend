import { TemplateData } from '../types/email.type';

export const welcomeTemplate = (data: TemplateData) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to SignalDeck</title>
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
      <td align="center" style="padding:40px 0;">
        <table class="container" width="600" style="background-color:#ffffff; border-radius:10px; padding:40px; box-shadow:0 4px 10px rgba(0,0,0,0.05);">

          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom: 25px;">
              <img src="https://signaldeck.io/logo.png" alt="SignalDeck Logo" width="64" height="64" style="display:block;" />
            </td>
          </tr>

          <!-- Header -->
          <tr>
            <td align="center" style="font-size:26px; font-weight:bold; color:#111827; padding-bottom:10px;">
              Welcome to SignalDeck 🚀
            </td>
          </tr>

          <!-- Intro Message -->
          <tr>
            <td style="font-size:16px; line-height:1.6; color:#374151; padding-bottom:20px;">
              Hi ${data.name || 'there'},
              <br /><br />
              Welcome aboard! You’ve officially joined <strong>SignalDeck</strong> — your all-in-one platform for building realtime, event-driven applications without managing complex infrastructure.
              <br /><br />
              Whether you’re streaming millions of messages or powering live dashboards, SignalDeck gives you the tools to build, scale, and monitor with ease.
              <br /><br />
              Here’s what you can do right away:
              <ul style="margin:0; padding-left:20px; color:#374151;">
                <li><strong>⚡ Realtime Messaging:</strong> Publish and subscribe to events across your apps in milliseconds using REST or WebSocket APIs.</li>
                <li><strong>🔁 Event Replay:</strong> Rewind and inspect past events for debugging or data sync — no setup required.</li>
                <li><strong>📊 Live Analytics Dashboard:</strong> Monitor message flow, delivery success, and subscriber activity in realtime.</li>
                <li><strong>🔐 Secure API Keys:</strong> Protect every project with per-client authentication and rate limits.</li>
                <li><strong>☁️ Serverless Architecture:</strong> Focus on your code while SignalDeck scales your infrastructure automatically.</li>
              </ul>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td align="center" style="padding:30px 0;">
              <a href="${data.url || 'https://signaldeck.io/dashboard'}" class="button"
                 style="display:inline-block; background-color:#0E76FD; color:#ffffff; padding:14px 28px; font-size:16px; font-weight:bold; border-radius:6px; text-decoration:none;">
                 Go to Your Dashboard
              </a>
            </td>
          </tr>

          <!-- Additional Info -->
          <tr>
            <td style="font-size:15px; line-height:1.6; color:#6b7280; text-align:center; padding-bottom:25px;">
              Your workspace is ready — start by creating your first channel, connect your app, and start streaming events in minutes.
              <br /><br />
              Check out our <a href="https://docs.signaldeck.io" style="color:#0E76FD; text-decoration:none;">developer docs</a> and SDKs to get started fast.
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="font-size:14px; line-height:1.5; color:#9ca3af; border-top:1px solid #e5e7eb; padding-top:20px; text-align:center;">
              Need help? <a href="mailto:support@signaldeck.io" style="color:#0E76FD; text-decoration:none;">Contact support</a>.<br />
              Explore our API reference at <a href="https://docs.signaldeck.io" style="color:#0E76FD; text-decoration:none;">docs.signaldeck.io</a>
              <br /><br />
              &copy; ${new Date().getFullYear()} SignalDeck. All rights reserved.
            </td>
          </tr>
        </table>

        <!-- Fallback URL -->
        <p style="font-size:13px; color:#9ca3af; margin-top:25px; text-align:center;">
          If the button above doesn’t work, copy and paste this link into your browser:<br />
          <a href="${data.url || 'https://signaldeck.io/dashboard'}" style="color:#0E76FD; word-break:break-all;">
            ${data.url || 'https://signaldeck.io/dashboard'}
          </a>
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
`;
