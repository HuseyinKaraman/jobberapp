import Joi, { ObjectSchema } from 'joi';

const SigninSchema: ObjectSchema = Joi.object({
  identifier: Joi.alternatives().conditional(Joi.string().email(),{
      then: Joi.string().email().required().messages({
        'string.base': 'Email must be a string',
        'string.empty': 'Email is required',
        'string.email': 'Email must be a valid email address'
      }),
      otherwise: Joi.string().min(3).max(15).required().messages({
        'string.base': 'Username must be a string',
        'string.empty': 'Username is required',
        'string.min': 'Username must be at least 3 characters long',
        'string.max': 'Username must be less than 15 characters long'
      })
    }
  ),
  password: Joi.string().min(4).max(20).required().messages({
    'string.base': 'Password must be a string',
    'string.empty': 'Password is required',
    'string.min': 'Password must be at least 4 characters long',
    'string.max': 'Password must be less than 20 characters long'
  })
});

export { SigninSchema };