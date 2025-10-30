import { TemplateData } from '../types/email.type';

export const customTemplate = (data: TemplateData & { html?: string }) => `
  <div style="font-family: Arial, sans-serif; color: #333;">
    ${
      data.html ||
      `
      <h2>Hello ${data.name || 'User'}!</h2>
      <p>This is a custom email from Zentra.</p>
    `
    }
  </div>
`;
