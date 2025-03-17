import { Client } from '@elastic/elasticsearch';
import { config } from './config';
import { Logger } from 'winston';
import { winstonLogger } from '@huseyinkaraman/jobber-shared';
import { ClusterHealthResponse } from '@elastic/elasticsearch/lib/api/types';

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'notificationElasticSearchServer', 'debug');

const elasticSearchClient = new Client({
  node: `${config.ELASTIC_SEARCH_URL}`,
  // auth: {
  //   username: process.env.ELASTICSEARCH_USERNAME || 'elastic',
  //   password: process.env.ELASTICSEARCH_PASSWORD || 'changeme'
  // },
  // tls: {
  //   rejectUnauthorized: false
  // }
});

export const checkConnection = async (): Promise<void> => {
  let isConnected:  boolean = false;
  while (!isConnected) {
    try {
      const health: ClusterHealthResponse = await elasticSearchClient.cluster.health({});
      log.info(`NotificationService ElasticSearch health status: ${health.status}`);
      isConnected = true;
    } catch (error) {
      log.error('Connection to ElasticSearch failed. Retrying...');
      log.log('error', 'NotificationService checkConnection() method:', error);
    }
  }
};
