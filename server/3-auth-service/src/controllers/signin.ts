import { SigninSchema } from "@auth/schemas/signin";
import { getUserByEmail, getUserByUsername } from "@auth/services/auth.service";
import { bcryptService } from "@auth/services/bcrypt.service";
import { BadRequestError, IAuthDocument, isEmail} from "@huseyinkaraman/jobber-shared";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { jwtService } from "@auth/services/jwt.service";
import { omit } from "lodash";

export const read = async (req: Request, res: Response): Promise<void>  => {
  const { error } = await Promise.resolve(SigninSchema.validate(req.body));
  if(error?.details){
    throw new BadRequestError(error.details[0].message, 'SignIn read() method error');
  }

  const { identifier, password } = req.body;
  const isValidEmail = isEmail(identifier);
  const existingUser: IAuthDocument = isValidEmail ? await getUserByEmail(identifier) : await getUserByUsername(identifier);
  if(!existingUser){
    throw new BadRequestError('Invalid credentials', 'SignIn read() method error');
  }

  const passwordsMatch: boolean = await bcryptService.compare(password, `${existingUser.password}`);
  if(!passwordsMatch){
    throw new BadRequestError('Invalid credentials', 'SignIn read() method error');
  }

  const userJWT: string = await jwtService.generate({
    id: existingUser.id,
    email: existingUser.email,
    username: existingUser.username
  });
  const userData: IAuthDocument = omit(existingUser, ['password']);

  res.status(StatusCodes.OK).json({
    message: 'User logged in successfully',
    user: userData,
    token: userJWT
  });
};

