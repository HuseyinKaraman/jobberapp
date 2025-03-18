import express, { Express } from 'express';
import { AuthServer } from '@auth/server';

class Application {
  public initialize(): void {
    const app: Express = express();
    const server: AuthServer = new AuthServer(app);
    server.start();
  }
}

const application: Application = new Application();
application.initialize();
