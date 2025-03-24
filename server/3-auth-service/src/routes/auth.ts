import { read } from '@auth/controllers/signin';
import { create } from '@auth/controllers/signup';
import { update } from '@auth/controllers/verify-email';
import express, { Router } from 'express';

const router : Router = express.Router();

export const authRoutes = (): Router => {
  router.post('/signup', create);
  router.post('/signin', read);
  router.put('/verify-email', update);

  return router;
}
