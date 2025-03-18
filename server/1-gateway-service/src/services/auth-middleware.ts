import { config } from '@gateway/config';
import { BadRequestError, IAuthPayload, NotAuthorizedError } from '@huseyinkaraman/jobber-shared';
import { NextFunction, Request, Response } from 'express';
import { verify } from 'jsonwebtoken';

class AuthMiddleware {
  public verifyToken(req: Request, res: Response, next: NextFunction): void {
    if (!req.session?.jwt) {
      throw new NotAuthorizedError('Token is not available. Please login again.', 'GatewayService verifyToken() method error');
    }

    try {
      const payload: IAuthPayload = verify(req.session.jwt, `${config.JWT_TOKEN}`) as IAuthPayload;
      req.currentUser = payload;
    } catch (error) {
      throw new NotAuthorizedError(
        'Token is not available. Please login again.',
        'GatewayService verifyToken() method invalid session error'
      );
    }
    next();
  }

  public checkAuthentication(req: Request, res: Response, next: NextFunction): void {
    if (!req.currentUser) {
      throw new BadRequestError('Authentication is required to access this route.', 'GatewayService checkAuthentication() method error');
    }
    next();
  }
}

export const authMiddleware = new AuthMiddleware();
