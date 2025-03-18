import { winstonLogger } from "@huseyinkaraman/jobber-shared";
import { Logger } from "winston";
import { config } from "@gateway/config";
import { Client } from "@elastic/elasticsearch";
import { ClusterHealthResponse } from "@elastic/elasticsearch/lib/api/types";

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'apiGatewayElasticConnection', 'debug');

class ElasticSearch {
  private elasticSearchClient: Client;

  constructor() {
    this.elasticSearchClient = new Client({
      node: `${config.ELASTIC_SEARCH_URL}`
    });
  }

  public async checkConnection(): Promise<void> {
    let isConnected: boolean = false;
    while (!isConnected) {
      try {
        log.info('GatewayService Connecting to ElasticSearch');
        const health: ClusterHealthResponse = await this.elasticSearchClient.cluster.health({});
        log.info(`GatewayService ElasticSearch health status: ${health.status}`);
        isConnected = true;
      } catch (error) {
        log.error('Connection to ElasticSearch failed, Retrying...');
        log.log('error', `ElasticSearch checkConnection() method error: `, error);
      }
    }
  }
}

export const elasticSearch = new ElasticSearch();