import { config } from '@auth/config';
import { winstonLogger } from '@huseyinkaraman/jobber-shared';
import { Logger } from 'winston';
import client, { Channel, ChannelModel } from 'amqplib';

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'AuthQueueConnection', 'debug');

export const createConnection = async (): Promise<Channel | undefined> => {
  try {
    const connection: ChannelModel = await client.connect(`${config.RABBITMQ_ENDPOINT}`);
    const channel: Channel = await connection.createChannel();
    closeConnection(channel, connection);
    log.info('Auth server connected to queue successfully');
    return channel;
  } catch (error) {
    log.log('error', 'AuthService error createConnection() method:', error);
    return undefined;
  }
};

export const closeConnection = async (channel: Channel, connection: ChannelModel): Promise<void> => {
  process.once('SIGINT', async () => {
    await channel.close();
    await connection.close();
  });
};
