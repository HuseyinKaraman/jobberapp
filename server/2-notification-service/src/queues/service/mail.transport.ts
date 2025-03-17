import { IEmailLocals, winstonLogger } from '@huseyinkaraman/jobber-shared';
import { config } from '@notifications/config';
import { emailTemplates } from '@notifications/helpers';
import { Logger } from 'winston';

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'mailTransport', 'debug');

const sendEmail = async (template: string, receiverEmail: string, locals: IEmailLocals): Promise<void> => {
  try {
    emailTemplates(template, receiverEmail, locals);
    log.info('Email sent successfully');
  } catch (error) {
    log.error('error', 'NotificationService MailTransport sendEmail() method error:', error);
  }
};

export { sendEmail };
