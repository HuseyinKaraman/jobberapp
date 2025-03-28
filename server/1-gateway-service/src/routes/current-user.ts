import { CurrentUser } from "@gateway/controllers/auth/current-user";
import express, { Router } from "express";


class CurrentUserRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.get('/auth/currentuser', CurrentUser.prototype.read);
    this.router.post('/auth/resend-email', CurrentUser.prototype.resendEmail);
    return this.router;
  }
}

export const currentUserRoutes: CurrentUserRoutes = new CurrentUserRoutes();
