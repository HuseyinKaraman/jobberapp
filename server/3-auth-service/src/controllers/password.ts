import crypto from 'crypto';
import { Request, Response } from 'express';
import { changePasswordSchema, emailSchema, resetPasswordSchema } from '@auth/schemas/password';
import { getAuthUserById, getAuthUserByPasswordToken, getUserByEmail, updatePassword, updatePasswordToken } from '@auth/services/auth.service';
import { BadRequestError, IAuthDocument, IEmailMessageDetails } from '@huseyinkaraman/jobber-shared';
import { config } from '@auth/config';
import { publishDirectMessage } from '@auth/queues/auth.producer';
import { authChannel } from '@auth/server';
import { StatusCodes } from 'http-status-codes';
import { bcryptService } from '@auth/services/bcrypt.service';

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  const { error } = await Promise.resolve(emailSchema.validate(req.body));
  if (error?.details) {
    throw new BadRequestError(error.details[0].message, 'Password forgotPassword() error');
  }

  const { email } = req.body;
  const existingUser: IAuthDocument | undefined = await getUserByEmail(email);
  if (!existingUser) {
    throw new BadRequestError('Invalid credentials', 'Password forgotPassword() error');
  }

  const randomBytes: Buffer = await Promise.resolve(crypto.randomBytes(20));
  const randomCharacters: string = randomBytes.toString('hex');
  const tokenExpiry: Date = new Date();
  tokenExpiry.setHours(tokenExpiry.getHours() + 1);

  await updatePasswordToken(existingUser.id!, randomCharacters, tokenExpiry);
  
  const resetLink: string = `${config.CLIENT_URL}/reset-password?token=${randomCharacters}`;
  const messageDetails: IEmailMessageDetails = {
    receiverEmail: existingUser.email,
    username: existingUser.username,
    resetLink,
    template: 'forgotPassword'
  };

  await publishDirectMessage(
    authChannel,
    'jobber-email-notification',
    'auth-email',
    JSON.stringify(messageDetails),
    'Forgot password message sent to notification service.'
  );

  res.status(StatusCodes.OK).json({ message: 'Password reset email sent.' });
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  const { error } = await Promise.resolve(resetPasswordSchema.validate(req.body));
  if (error?.details) {
    throw new BadRequestError(error.details[0].message, 'Password resetPassword() method error');
  }
  const { password, confirmPassword } = req.body;
  const { token } = req.params;
  if (password !== confirmPassword) {
    throw new BadRequestError('Passwords do not match', 'Password resetPassword() method error');
  }

  const existingUser: IAuthDocument | undefined = await getAuthUserByPasswordToken(token);
  if (!existingUser) {
    throw new BadRequestError('Reset token has expired', 'Password resetPassword() method error');
  }

  const hashedPassword: string = await bcryptService.hash(password);
  await updatePassword(existingUser.id!, hashedPassword);
  
  const messageDetails: IEmailMessageDetails = {
    username: existingUser.username,
    template: 'resetPasswordSuccess'
  };
  await publishDirectMessage(
    authChannel,
    'jobber-email-notification',
    'auth-email',
    JSON.stringify(messageDetails),
    'Reset password success message sent to notification service.'
  );
  res.status(StatusCodes.OK).json({ message: 'Password successfully updated.' });
}

export const changePassword = async (req: Request, res: Response): Promise<void> => {
  const { error } = await Promise.resolve(changePasswordSchema.validate(req.body));
  if (error?.details) {
    throw new BadRequestError(error.details[0].message, 'Password changePassword() method error');
  }

  const { currentPassword, newPassword } = req.body;

  const existingUser: IAuthDocument | undefined = await getAuthUserById(req.currentUser?.id!);
  if (!existingUser) {
    throw new BadRequestError('User not found', 'Password changePassword() method error');
  }

  const isPasswordValid: boolean = await bcryptService.compare(currentPassword, existingUser.password!);
  if (!isPasswordValid) {
    throw new BadRequestError('Invalid current password', 'Password changePassword() method error');
  }

  const hashedPassword: string = await bcryptService.hash(newPassword);
  await updatePassword(existingUser.id!, hashedPassword);

  const messageDetails: IEmailMessageDetails = {
    username: existingUser.username,
    template: 'resetPasswordSuccess'
  };
  await publishDirectMessage(
    authChannel,
    'jobber-email-notification',
    'auth-email',
    JSON.stringify(messageDetails),
    'Password change success message sent to notification service.'
  );
  res.status(StatusCodes.OK).json({ message: 'Password successfully updated.' });
}
