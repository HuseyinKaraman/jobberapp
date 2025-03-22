import { CustomError, IAuthPayload, IErrorResponse, winstonLogger } from '@huseyinkaraman/jobber-shared';
import { Application, json, NextFunction, Request, Response, urlencoded } from 'express';
import helmet from 'helmet';
import hpp from 'hpp';
import cors from 'cors';
import { Logger } from 'winston';
import compression from 'compression';
import { StatusCodes } from 'http-status-codes';
import http from 'http';
import { config } from '@auth/config';
import { checkConnection } from '@auth/config/elasticSearch';
import { appRoutes } from '@auth/routes';
import { verify } from 'jsonwebtoken';
import { Channel } from 'amqplib';
import { createConnection } from '@auth/config/rabbitmqConnection';

const SERVER_PORT = 4002;
const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'AuthServer', 'debug');

export let authChannel: Channel;

export const start = (app: Application): void => {
  securityMiddleware(app);
  standardMiddleware(app);
  routesMiddleware(app);
  startQueues();
  startElasticSearch();
  authErrorHandler(app);
  startServer(app);
}

const securityMiddleware = (app: Application): void => {
  app.set('trust proxy', 1);
  app.use(hpp());
  app.use(helmet());
  app.use(
    cors({
      origin: config.API_GATEWAY_URL,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
    })
  );
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.headers.authorization) {
      const authorization = req.headers.authorization.split(' ')[1];
      const payload: IAuthPayload = verify(authorization, config.JWT_TOKEN!) as IAuthPayload;
      req.currentUser = payload;
    }
    next();
  });
}

const standardMiddleware = (app: Application): void => {
  app.use(compression());
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));
}

const routesMiddleware = (app: Application): void => {
  appRoutes(app);
}

const startQueues = async (): Promise<void> => {
  authChannel = await createConnection() as Channel;
}

const startElasticSearch = (): void => {
  checkConnection();
}

const startServer = async (app: Application): Promise<void> => {
  try {
    const httpServer: http.Server = new http.Server(app);
    startHttpServer(httpServer);
  } catch (error) {
    log.log('error', `AuthService startServer() method error: `, error);
  }
}

const startHttpServer = async (httpServer: http.Server): Promise<void> => {
  try {
    log.info(`Authentication server has started with process id: ${process.pid}`);
    httpServer.listen(SERVER_PORT, () => {
      log.info(`Authentication server is running on port ${SERVER_PORT}`);
    });
  } catch (error) {
    log.log('error', `AuthService startHttpServer() method error: `, error);
  }
}

const authErrorHandler = (app: Application): void => {
  app.use((error: IErrorResponse, req: Request, res: Response, next: NextFunction) => {
    log.log('error', `AuthService ${error.comingFrom}: `, error);
    if (error instanceof CustomError) {
      res.status(error.statusCode).json(error.serializedError());
    }
    next();
  });
}
