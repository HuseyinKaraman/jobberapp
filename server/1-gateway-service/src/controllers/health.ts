import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

export class Health {
  public healthCheck(req: Request, res: Response): void {
    res.status(StatusCodes.OK).send("API Gateway Service is healthy and OK");
  }
}