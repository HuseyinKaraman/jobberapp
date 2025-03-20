import express, { Express } from 'express';
import { start } from '@auth/server';
import { databaseConnection } from './config/database';

class Application {
  public initialize(): void {
    const app: Express = express();
    databaseConnection();
    start(app);
  }
}

const application: Application = new Application();
application.initialize();
