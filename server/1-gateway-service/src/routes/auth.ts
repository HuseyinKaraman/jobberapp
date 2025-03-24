import { SignUp } from '@gateway/controllers/auth/signup';
import { SignIn } from '@gateway/controllers/auth/signin';
import express, { Router } from 'express';
import { Signout } from '@gateway/controllers/auth/signout';
import { VerifyEmail } from '@gateway/controllers/auth/verify-email';

class AuthRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes() : Router {
    this.router.post('/auth/signup', SignUp.prototype.create);
    this.router.post('/auth/signin', SignIn.prototype.read);
    this.router.put('/auth/verify-email', VerifyEmail.prototype.update);
    this.router.post('/auth/signout', Signout.prototype.update);
    return this.router;
  }

  getRouter() {
    return this.router;
  }
}

export const authRoutes:AuthRoutes = new AuthRoutes();
