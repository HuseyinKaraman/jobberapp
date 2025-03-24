import { Application } from 'express';
import { healthRoutes } from '@auth/routes/health';
import { authRoutes } from '@auth/routes/auth';
import { verifyGatewayRequest } from '@huseyinkaraman/jobber-shared';

const BASE_PATH = '/api/v1/auth';

export const appRoutes = (app: Application) => {
  app.use(BASE_PATH, healthRoutes.routes());
  app.use(BASE_PATH, verifyGatewayRequest, authRoutes());
};
