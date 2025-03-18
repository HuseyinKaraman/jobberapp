import { Health } from '@gateway/controllers/health';
import express, { Router } from 'express';

class HealthRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes() : Router {
    this.router.get('/gateway-health', Health.prototype.healthCheck);
    return this.router;
  }

  getRouter() {
    return this.router;
  }
}

export const healthRoutes:HealthRoutes = new HealthRoutes();
