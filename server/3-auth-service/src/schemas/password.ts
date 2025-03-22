import Joi, { ObjectSchema } from 'joi';

const emailSchema: ObjectSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.base': 'Email must be a string',
    'string.empty': 'Email is required',
    'string.email': 'Email must be a valid email address'
  })
});

const resetPasswordSchema: ObjectSchema = Joi.object({
  password: Joi.string().min(4).max(20).required().messages({
    'string.base': 'Password must be a string',
    'string.empty': 'Password is required',
    'string.min': 'Password must be at least 4 characters long',
    'string.max': 'Password must be less than 20 characters long'
  }),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
    'any.only': 'Passwords do not match'
  })
});

const changePasswordSchema: ObjectSchema = Joi.object({
  currentPassword: Joi.string().min(4).max(20).required().messages({
    'string.base': 'Password must be a string',
    'string.empty': 'Password is required',
    'string.min': 'Password must be at least 4 characters long',
    'string.max': 'Password must be less than 20 characters long'
  }),
  newPassword: Joi.string().min(4).max(20).required().messages({
    'string.base': 'Password must be a string',
    'string.empty': 'Password is required',
    'string.min': 'Password must be at least 4 characters long',
    'string.max': 'Password must be less than 20 characters long'
  })
});

export { emailSchema, resetPasswordSchema, changePasswordSchema };
