import { IEmailLocals, winstonLogger } from '@huseyinkaraman/jobber-shared';
import { config } from '@notifications/config';
import { Channel, ConsumeMessage } from 'amqplib';
import { Logger } from 'winston';
import { createConnection } from '@notifications/queues/connection';
import { sendEmail } from '@notifications/queues/service/mail.transport';

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'emailConsumer', 'debug');

const consumeAuthEmailMessages = async (channel: Channel): Promise<void> => {
  try {
    if (!channel) {
      channel = (await createConnection()) as Channel;
    }
    const exchangeName = 'jobber-email-notification';
    const routingKey = 'auth-email';
    const queueName = 'auth-email-queue';

    await channel.assertExchange(exchangeName, 'direct', { durable: true, autoDelete: false });
    const jobberQueue = await channel.assertQueue(queueName, { durable: true, autoDelete: false });
    await channel.bindQueue(jobberQueue.queue, exchangeName, routingKey);

    await channel.consume(jobberQueue.queue, async (msg: ConsumeMessage | null) => {
      if (msg) {
        const { receiverEmail, username, verifyLink, resetLink, template } = JSON.parse(msg.content.toString());
        const locals: IEmailLocals = { 
          appLink: `${config.CLIENT_URL}`,
          appIcon: 'https://play-lh.googleusercontent.com/zQOI1FFsfx0H1Wf6eyPndLp4jGykZbR7gF70AKRy_61_Mwu_eNIwN7hdWAYh1rg2z_Q',
          username,
          verifyLink,
          resetLink
        };
        sendEmail(template, receiverEmail, locals);
        channel.ack(msg);
      }
    });
  } catch (error) {
    log.log('error', 'NotificationService EmailConsumer consumeAuthEmailMessages() method error:', error);
  }
};

const consumeOrderEmailMessages = async (channel: Channel): Promise<void> => {
  try {
    if (!channel) {
      channel = (await createConnection()) as Channel;
    }
    const exchangeName = 'jobber-order-notification';
    const routingKey = 'order-email';
    const queueName = 'order-email-queue';

    await channel.assertExchange(exchangeName, 'direct', { durable: true, autoDelete: false });
    const jobberQueue = await channel.assertQueue(queueName, { durable: true, autoDelete: false });
    await channel.bindQueue(jobberQueue.queue, exchangeName, routingKey);

    await channel.consume(jobberQueue.queue, async (msg: ConsumeMessage | null) => {
      if (msg) {
        const {
          receiverEmail,
          username,
          template,
          sender,
          offerLink,
          amount,
          buyerUsername,
          sellerUsername,
          title,
          description,
          deliveryDays,
          orderId,
          orderDue,
          requirements,
          orderUrl,
          originalDate,
          newDate,
          reason,
          subject,
          header,
          type,
          message,
          serviceFee,
          total
        } = JSON.parse(msg!.content.toString());
        const locals: IEmailLocals = {
          appLink: `${config.CLIENT_URL}`,
          appIcon: 'https://play-lh.googleusercontent.com/zQOI1FFsfx0H1Wf6eyPndLp4jGykZbR7gF70AKRy_61_Mwu_eNIwN7hdWAYh1rg2z_Q',
          username,
          sender,
          offerLink,
          amount,
          buyerUsername,
          sellerUsername,
          title,
          description,
          deliveryDays,
          orderId,
          orderDue,
          requirements,
          orderUrl,
          originalDate,
          newDate,
          reason,
          subject,
          header,
          type,
          message,
          serviceFee,
          total
        };
        if (template === 'orderPlaced') {
          await sendEmail('orderPlaced', receiverEmail, locals);
          await sendEmail('orderReceipt', receiverEmail, locals);
        } else {
          await sendEmail(template, receiverEmail, locals);
        }
        channel.ack(msg);
      }
    });
  } catch (error) {
    log.log('error', 'NotificationService EmailConsumer consumeOrderEmailMessages() method error:', error);
  }
};

export { consumeAuthEmailMessages, consumeOrderEmailMessages };
