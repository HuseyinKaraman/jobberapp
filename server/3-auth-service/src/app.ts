import express, { Express } from 'express';
import { start } from '@auth/server';
import { databaseConnection } from '@auth/config/database';
import { cloudinaryConfig } from '@auth/config/cloudinary';

class Application {
  public initialize(): void {
    const app: Express = express();
    cloudinaryConfig();
    databaseConnection();
    start(app);
  }
}

const application: Application = new Application();
application.initialize();
