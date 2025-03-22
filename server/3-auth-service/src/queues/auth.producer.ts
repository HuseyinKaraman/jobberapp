import { config } from "@auth/config";
import { createConnection } from "@auth/config/rabbitmqConnection";
import { winstonLogger } from "@huseyinkaraman/jobber-shared";
import { Channel } from "amqplib";
import { Logger } from "winston";

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'AuthServiceProducer', 'debug');

export const publishDirectMessage = async (
  channel: Channel,
  exchangeName: string,
  routingKey: string,
  message: string,
  logMessage: string
): Promise<void> => {
  try {
    if (!channel) {
      channel = await createConnection() as Channel;
    }
    await channel.assertExchange(exchangeName, 'direct', { durable: true, autoDelete: false });
    channel.publish(exchangeName, routingKey, Buffer.from(message));
    log.info(logMessage);
  } catch (error) {
    log.log('error', `AuthService publishDirectMessage() method error: `, error);
  }
}