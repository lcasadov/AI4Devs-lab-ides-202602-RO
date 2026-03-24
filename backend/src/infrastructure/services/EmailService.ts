import nodemailer from 'nodemailer';
import { IEmailService, SendEmailDto } from '../../domain/services/IEmailService';

let emailServiceInstance: EmailService | null = null;

export class EmailService implements IEmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT ?? 587),
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: process.env.NODE_ENV === 'production',
      },
    });
  }

  async send(dto: SendEmailDto): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: dto.to,
        subject: dto.subject,
        html: dto.html,
      });
    } catch (error: unknown) {
      console.error('Failed to send email:', error);
      // Do not propagate — email failure must not break the main operation
    }
  }
}

export function getEmailService(): EmailService {
  if (!emailServiceInstance) {
    emailServiceInstance = new EmailService();
  }
  return emailServiceInstance;
}
