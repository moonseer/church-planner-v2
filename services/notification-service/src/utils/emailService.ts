import nodemailer, { Transporter } from 'nodemailer';
import config from '../config';
import logger from './logger';

/**
 * Email attachment interface
 */
interface IEmailAttachment {
  filename: string;
  content?: Buffer | string;
  path?: string;
  contentType?: string;
  encoding?: string;
  cid?: string;
}

/**
 * Email options interface
 */
interface IEmailOptions {
  to: string | string[];
  subject: string;
  text: string;
  html?: string;
  from?: string;
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string;
  attachments?: IEmailAttachment[];
  headers?: Record<string, string>;
}

/**
 * Email service for sending emails
 */
class EmailService {
  private transporter: Transporter;
  private initialized: boolean = false;

  /**
   * Initialize the email transporter
   */
  public async initialize(): Promise<void> {
    try {
      // Create reusable transporter object using SMTP transport
      this.transporter = nodemailer.createTransport({
        host: config.email.host,
        port: config.email.port,
        secure: config.email.secure, // true for 465, false for other ports
        auth: {
          user: config.email.auth.user,
          pass: config.email.auth.pass,
        },
      });

      // Verify connection configuration
      await this.transporter.verify();
      this.initialized = true;
      logger.info('Email service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize email service', { error });
      throw new Error('Failed to initialize email service');
    }
  }

  /**
   * Send an email
   * @param options Email options
   * @returns Message info
   */
  public async sendEmail(options: IEmailOptions): Promise<any> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const mailOptions = {
        from: options.from || config.email.from,
        to: options.to,
        cc: options.cc,
        bcc: options.bcc,
        replyTo: options.replyTo || config.email.replyTo,
        subject: options.subject,
        text: options.text,
        html: options.html,
        attachments: options.attachments,
        headers: options.headers,
      };

      const info = await this.transporter.sendMail(mailOptions);
      
      logger.info('Email sent successfully', {
        messageId: info.messageId,
        to: options.to,
        subject: options.subject,
      });
      
      return info;
    } catch (error) {
      logger.error('Failed to send email', { error, to: options.to, subject: options.subject });
      throw new Error('Failed to send email');
    }
  }

  /**
   * Generate a test account for development
   * @returns Nodemailer test account
   */
  public async createTestAccount(): Promise<any> {
    if (config.environment === 'production') {
      throw new Error('Cannot create test account in production');
    }

    try {
      const testAccount = await nodemailer.createTestAccount();
      logger.info('Created test email account', { testAccount });
      
      // Configure transporter with test account
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      
      this.initialized = true;
      
      return testAccount;
    } catch (error) {
      logger.error('Failed to create test email account', { error });
      throw new Error('Failed to create test email account');
    }
  }
}

// Export a singleton instance
export default new EmailService(); 