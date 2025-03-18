import { Application } from 'express';
import { healthRoutes } from '@auth/routes/health';

export const appRoutes = (app: Application) => {
  app.use('/api/v1/auth', healthRoutes.routes());
};
