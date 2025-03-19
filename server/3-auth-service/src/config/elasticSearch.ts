import { winstonLogger } from '@huseyinkaraman/jobber-shared';
import { Logger } from 'winston';
import { config } from '@auth/config';
import { Client } from '@elastic/elasticsearch';
import { ClusterHealthResponse } from '@elastic/elasticsearch/lib/api/types';

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'authElasticConnection', 'debug');

export const elasticSearchClient = new Client({
  node: `${config.ELASTIC_SEARCH_URL}`
});

export const checkConnection = async (): Promise<void> => {
  let isConnected: boolean = false;
  while (!isConnected) {
    log.info('AuthService Connecting to ElasticSearch ...');
    try {
      const health: ClusterHealthResponse = await elasticSearchClient.cluster.health({});
      log.info(`AuthService ElasticSearch health status: ${health.status}`);
      isConnected = true;
    } catch (error) {
      log.error('Connection to ElasticSearch failed, Retrying...');
      log.log('error', `AuthService ElasticSearch checkConnection() method error: `, error);
    }
  }
};
