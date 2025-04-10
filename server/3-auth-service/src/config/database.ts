import {Sequelize} from 'sequelize';
import { Logger } from 'winston';
import { winstonLogger } from '@huseyinkaraman/jobber-shared';
import { config } from '@auth/config';

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'authDatabaseServer', 'debug');

export const sequelize: Sequelize = new Sequelize(`${config.MYSQL_DB}`,{
  dialect: "mysql",
  logging: false,
  dialectOptions: {
    multipleStatements: true,
  }
});

export const databaseConnection = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    log.info('AuthService MySQL database connection has been established successfully.');
  } catch (error) {
    log.error('Auth Service - Unable to connect to the database');
    log.log('error', 'AuthService databaseConnection() method error:', error);
  }
}

