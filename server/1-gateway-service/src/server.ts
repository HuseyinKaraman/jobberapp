import { CustomError, IErrorResponse, winstonLogger } from '@huseyinkaraman/jobber-shared';
import cookieSession from 'cookie-session';
import { Application, json, NextFunction, Request, Response, urlencoded } from 'express';
import helmet from 'helmet';
import hpp from 'hpp';
import cors from 'cors';
import { Logger } from 'winston';
import compression from 'compression';
import { StatusCodes } from 'http-status-codes';
import http from 'http';
import { config } from '@gateway/config';
import { elasticSearch } from '@gateway/config/elasticSearch';
import { appRoutes } from '@gateway/routes';
import { axiosAuthInstance } from '@gateway/services/api/auth.service';

const SERVER_PORT = 4000;
const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'apiGatewayServer', 'debug');

export class GatewayServer {
  constructor(private app: Application) {}

  start(): void {
    this.securityMiddleware(this.app);
    this.standardMiddleware(this.app);
    this.routesMiddleware(this.app);
    this.startElasticSearch();
    this.globalErrorHandler(this.app);
    this.startServer(this.app);
  }

  private securityMiddleware(app: Application): void {
    app.set('trust proxy', 1);
    app.use(
      cookieSession({
        name: 'session',
        keys: [`${config.SECRET_KEY_ONE}`, `${config.SECRET_KEY_TWO}`],
        maxAge: 24 * 7 * 3600000,
        secure: config.NODE_ENV !== "development" // TODO: update with value from config
        // sameSite: none
      })
    );
    app.use(hpp());
    app.use(helmet());
    app.use(
      cors({
        origin: config.CLIENT_URL,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
      })
    );

    app.use((req: Request, res: Response, next: NextFunction) => {
      if (req.session?.jwt) {
        axiosAuthInstance.defaults.headers.common['Authorization'] = `Bearer ${req.session.jwt}`;
      }
      next();
    });
  }

  private standardMiddleware(app: Application): void {
    app.use(compression());
    app.use(json({ limit: '50mb' }));
    app.use(urlencoded({ extended: true, limit: '50mb' }));
  }

  private routesMiddleware(app: Application): void {
    appRoutes(app);
  }

  private startElasticSearch(): void {
    elasticSearch.checkConnection();
  }

  private globalErrorHandler(app: Application): void {
    app.use('*', (req: Request, res: Response, next: NextFunction) => {
      const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
      log.log('error', `${fullUrl} endpoint does not exist`, '');
      res.status(StatusCodes.NOT_FOUND).json({ message: 'The endpoint called does not exist' });
      next();
    });
    app.use((error: IErrorResponse, req: Request, res: Response, next: NextFunction) => {
      log.log('error', `GatewayService ${error.comingFrom}: `, error);
      if (error instanceof CustomError) {
        res.status(error.statusCode).json(error.serializedError());
      }
      next();
    });
  }

  private async startServer(app: Application): Promise<void> {
    try {
      const httpServer: http.Server = new http.Server(app);
      this.startHttpServer(httpServer);
    } catch (error) {
      log.log('error', `GatewayService startServer() method error: `, error);
    }
  }

  private async startHttpServer(httpServer: http.Server): Promise<void> {
    try {
      log.info(`Gateway server has started with process id: ${process.pid}`);
      httpServer.listen(SERVER_PORT, () => {
        log.info(`Gateway server is running on port ${SERVER_PORT}`);
      });
    } catch (error) {
      log.log('error', `GatewayService startHttpServer() method error: `, error);
    }
  }
}
