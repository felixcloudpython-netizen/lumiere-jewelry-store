import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@lumiere-jewelry.com';

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  try {
    const result = await resend.emails.send({
      from: `Lumière Jewelry <${FROM_EMAIL}>`,
      to,
      subject,
      html,
    });
    return result;
  } catch (error) {
    console.error('Email send failed:', error);
    throw error;
  }
}
