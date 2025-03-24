import { SignupSchema } from "@auth/schemas/signup";
import { getUserByUsernameOrEmail, createAuthUser } from "@auth/services/auth.service";
import { bcryptService } from "@auth/services/bcrypt.service";
import { BadRequestError, firstLetterUppercase, IAuthDocument, IEmailMessageDetails, lowerCase, uploads } from "@huseyinkaraman/jobber-shared";
import { UploadApiResponse } from "cloudinary";
import { Request, Response } from "express";
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { config } from "@auth/config";
import { authChannel } from "@auth/server";
import { publishDirectMessage } from "@auth/queues/auth.producer";
import { StatusCodes } from "http-status-codes";
import { jwtService } from "@auth/services/jwt.service";

export const create = async (req: Request, res: Response): Promise<void>  => {
  const { error } = await Promise.resolve(SignupSchema.validate(req.body));
  if(error?.details){
    throw new BadRequestError(error.details[0].message, 'Signup create() method error');
  }

  const { username, email, country, password, profilePicture } = req.body;
  const checkIfUserExists = await getUserByUsernameOrEmail(username, email);
  if(checkIfUserExists){
    throw new BadRequestError('Invalid credentials. Email or username already exists', 'Signup create() method error');
  }

  const profilePublicId = uuidv4();
  const uploadResult: UploadApiResponse = await uploads(profilePicture, `${profilePublicId}`, true, true) as UploadApiResponse;
  if(!uploadResult?.public_id){
    throw new BadRequestError('Failed to upload profile picture. Please try again later.', 'Signup create() method error');
  }

  const hashedPassword = await bcryptService.hash(password);
  const randomBytes : Buffer = await Promise.resolve(crypto.randomBytes(20));
  const randomCharacters: string = randomBytes.toString('hex');
  
  const authData : IAuthDocument = {
    username: firstLetterUppercase(username),
    email: lowerCase(email),
    profilePublicId,
    password: hashedPassword,
    country,
    profilePicture: uploadResult.secure_url,
    emailVerificationToken: randomCharacters,
  } as IAuthDocument;

  const result: IAuthDocument = await createAuthUser(authData);
  const verificationLink: string = `${config.CLIENT_URL}/verify-email?v_token=${authData.emailVerificationToken}`;

  const messageDetails: IEmailMessageDetails = {
    receiverEmail: authData.email,
    username: authData.username,
    verifyLink: verificationLink,
    template: 'verifyEmail'
  }
  
  await publishDirectMessage(
    authChannel,
    'jobber-email-notification',
    'auth-email',
    JSON.stringify(messageDetails),
    'Verify email message has been sent to notification service'  
  );

  const userJWT: string = await jwtService.generate({
    id: result.id,
    email: result.email,
    username: result.username
  });

  res.status(StatusCodes.CREATED).json({
    message: 'User created successfully. Please verify your email to continue.',
    user: result,
    token: userJWT
  });
};

