import 'express-async-errors';
import http from 'http';
import { Channel } from 'amqplib';
import { Logger } from 'winston';
import { Application } from 'express';

import healthRoutes from '@notifications/routes';
import { checkConnection } from '@notifications/elasticsearch';
import { IEmailMessageDetails, winstonLogger } from '@huseyinkaraman/jobber-shared';
import { config } from '@notifications/config';
import { createConnection } from '@notifications/queues/connection';
import { consumeAuthEmailMessages, consumeOrderEmailMessages } from '@notifications/queues/email.consumer';

const SERVER_PORT = 4001;
const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'notificationServer', 'debug');

export function start(app: Application): void {
  startServer(app);
  app.use('', healthRoutes);
  startQueues();
  startElasticSearch();
}

async function startQueues(): Promise<void> {
  const emailChannel = await createConnection() as Channel;
  await consumeAuthEmailMessages(emailChannel);
  await consumeOrderEmailMessages(emailChannel);
  // publishTest(emailChannel);
}

async function startElasticSearch(): Promise<void> {
  checkConnection();
}

async function startServer(app: Application): Promise<void> {
  try {
    const httpServer: http.Server = new http.Server(app);
    log.info(`Worker with process id of ${process.pid} on notification server has started`);
    httpServer.listen(SERVER_PORT,  () => {
      log.info(`Notificatio server is running on port: ${SERVER_PORT}`);
    });
  } catch (error) {
    log.log('error', 'NotificationService startServer() method:', error);
  }
}


const publishTest = async (channel: Channel): Promise<void> => {
  try {
    const verificationLink = `${config.CLIENT_URL}/confirm-email/v_token=123456789`;
    const messageDetails: IEmailMessageDetails ={
      receiverEmail: `${config.SENDER_EMAIL}`,
      username: 'huseyinkaraman',
      verifyLink: verificationLink,
      template: 'verifyEmail'
    }
  
    const message = JSON.stringify(messageDetails);
    await channel.assertExchange('jobber-email-notification', 'direct', { durable: true });
    channel.publish('jobber-email-notification', 'auth-email', Buffer.from(message), { persistent: true });
  
    const verificationLink1 = `${config.CLIENT_URL}/confirm-email/v_token=123456789`;
    const messageDetails1: IEmailMessageDetails ={
      receiverEmail: `${config.SENDER_EMAIL}`,
      username: 'huseyinkaraman',
      resetLink: verificationLink1,
      template: 'forgotPassword'
    }
    const message1 = JSON.stringify(messageDetails1);
    await channel.assertExchange('jobber-email-notification', 'direct', { durable: true });
    channel.publish('jobber-email-notification', 'auth-email', Buffer.from(message1), { persistent: true });
    
    // const message1 = JSON.stringify({email: 'huseyinkaraman@gmail.com',service: 'order notification service'});
    // await channel.assertExchange('jobber-order-notification', 'direct', { durable: true });
    // channel.publish('jobber-order-notification', 'order-email', Buffer.from(message1), { persistent: true });
  } catch (error) {
    log.log('error', 'NotificationService publicshTest() method error:', error);
  }  
}