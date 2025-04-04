import AuthModel from "@auth/models/auth.schema";
import { publishDirectMessage } from "@auth/queues/auth.producer";
import { authChannel } from "@auth/server";
import { firstLetterUppercase, IAuthBuyerMessageDetails, IAuthDocument, lowerCase, ServerError, winstonLogger } from "@huseyinkaraman/jobber-shared";
import { Model, Op } from "sequelize";
import { omit } from "lodash";
import { jwtService } from "@auth/services/jwt.service";
import { config } from "@auth/config";
import { Logger } from "winston";

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'authService', 'debug');

export const createAuthUser = async (data: IAuthDocument): Promise<IAuthDocument> => {
  const result: Model = await AuthModel.create(data);
  const messageDetails : IAuthBuyerMessageDetails = {
    email: result.dataValues.email,
    username: result.dataValues.firstName,
    profilePicture: result.dataValues.profilePicture,
    country: result.dataValues.country,
    createdAt: result.dataValues.createdAt,
    type: "auth"
  };

  await publishDirectMessage(
    authChannel,
    'jobber-buyer-update',
    'user-buyer',
    JSON.stringify(messageDetails),
    'Buyer details sent to buyer service'
  );
    
  const userData: IAuthDocument = omit(result.dataValues, ['password']) as IAuthDocument;
  return userData;
};

export const getAuthUserById = async (authId: number): Promise<IAuthDocument> => {
  const result: Model = await AuthModel.findByPk(authId,{
    attributes: {
      exclude: ['password']
    }
  }) as Model;
  return result?.dataValues as IAuthDocument;
};

export const getUserByUsernameOrEmail = async (username: string, email: string): Promise<IAuthDocument> => {
  const result: Model = await AuthModel.findOne({
    where: {
      [Op.or]: [
        { username: firstLetterUppercase(username) },
        { email: lowerCase(email) }
      ]
    }
  }) as Model;
  return result?.dataValues
};

export const getUserByUsername = async (username: string): Promise<IAuthDocument> => {
  const result: Model = await AuthModel.findOne({
    where: {
      username: firstLetterUppercase(username)
    }
  }) as Model;
  return result?.dataValues;
};

export const getUserByEmail = async (email: string): Promise<IAuthDocument> => {
  const result: Model = await AuthModel.findOne({
    where: {
      email: lowerCase(email)
    }
  }) as Model;
  return result?.dataValues;
};

export const getAuthUserByVerificationToken = async (token: string): Promise<IAuthDocument> => {
  const result: Model = await AuthModel.findOne({
    where: {
      emailVerificationToken: token
    },
    attributes: {
      exclude: ['password']
    }
  }) as Model;
  return result?.dataValues;
};

export const getAuthUserByPasswordToken = async (token: string): Promise<IAuthDocument> => {
  const result: Model = await AuthModel.findOne({
    where: {
      [Op.and]: [
        { passwordResetToken: token },
        { passwordResetExpires: { [Op.gt]: new Date() } }
      ]
    }
  }) as Model;
  return result?.dataValues;
};

export const updateVerifyEmailField = async (authId: number, emailVerified: number, emailVerificationToken?: string): Promise<void> => {
  try {
    await AuthModel.update(
      !emailVerificationToken ? 
      { 
        emailVerified 
      } : { 
        emailVerified, 
        emailVerificationToken
      }, 
      { where: { id: authId } }
    );
  } catch (error) {
    log.error(error);
    throw new ServerError('Error updating verify email field', 'updateVerifyEmailField() method error');
  }
};

export const updatePasswordToken = async (authId: number, token: string, tokenExpiration: Date): Promise<void> => {
  await AuthModel.update(
    { 
      passwordResetToken: token, 
      passwordResetExpires: tokenExpiration
    },
    { where: { id: authId } }
  );
};

export const updatePassword = async (authId: number, password: string): Promise<void> => {
  await AuthModel.update(
    { 
      password, 
      passwordResetToken: '',
      passwordResetExpires: new Date()
    },
    { where: { id: authId } }
  );
};

export const signToken = async (id: number, email: string, username: string): Promise<string> => {
  return await jwtService.generate({ id, email, username });
}