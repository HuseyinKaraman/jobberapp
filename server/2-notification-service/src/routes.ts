import express, { Router,Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

const router: Router = express.Router();

router.get('/notification-health', (req: Request, res: Response) => {
    res.status(StatusCodes.OK).json({
        status: 'OK',
        message: 'Notification Service is running'
    });
});

export default router;