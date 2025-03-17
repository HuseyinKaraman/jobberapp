import path from 'path';

import { IEmailLocals, winstonLogger } from '@huseyinkaraman/jobber-shared';
import { Logger } from 'winston';
import { config } from '@notifications/config';
import nodemailer, { Transporter } from 'nodemailer';
import Email from 'email-templates';

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'mailTransportHelper', 'debug');

const emailTemplates = async (template: string, receiver: string, locals: IEmailLocals) => {
  try {
    const smtpTransporter: Transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: config.SENDER_EMAIL,
        pass: config.SENDER_EMAIL_PASSWORD
      }
    });

    const email = new Email({
      message: {
        from: `Jobber App <${config.SENDER_EMAIL}>`
      },
      send: true,
      preview: false,
      transport: smtpTransporter,
      views: {
        options: {
          extension: 'ejs'
        }
      },
      juice: true,
      juiceResources: {
        preserveImportant: true,
        webResources: {
          relativeTo: path.join(__dirname, '../build')
        }
      }
    });

    await email.send({
      template: path.join(__dirname, '..', 'src/emails', template),
      message: { to: receiver },
      locals
    });
  } catch (error) {
    log.error(error);
  }
};

export { emailTemplates };