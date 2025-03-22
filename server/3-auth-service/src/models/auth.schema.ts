import { sequelize } from '@auth/config/database';
import { IAuthDocument } from '@huseyinkaraman/jobber-shared';
import { DataTypes, ModelDefined, Optional } from 'sequelize';

type AuthUserCreationAttributes = Optional<IAuthDocument, 'id' | 'createdAt' | 'updatedAt' | 'passwordResetToken' | 'passwordResetExpires'>;

const AuthModel: ModelDefined<IAuthDocument, AuthUserCreationAttributes> = sequelize.define('auths', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    country: {
      type: DataTypes.STRING,
      allowNull: false
    },
    profilePublicId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    profilePicture: {
      type: DataTypes.STRING,
      allowNull: false
    },
    emailVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    },
    emailVerificationToken: {
      type: DataTypes.STRING,
      allowNull: true
    },
    passwordResetToken: {
      type: DataTypes.STRING,
      allowNull: true
    },
    passwordResetExpires: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: new Date()
    }
  },
  { 
    indexes: [{
      unique: true,
      fields: ['email']
    }, {
      unique: true,
      fields: ['username']
    }],
    tableName: 'auth',
    timestamps: false
  }
);

// for development force: true
AuthModel.sync({});
export default AuthModel;
