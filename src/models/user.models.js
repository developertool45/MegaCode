import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import {jwt} from 'jsonwebtoken';
const UserSchema = new Schema(
  {
    avatar: {
      type: {
        url: String,
        localpath: String,
      },
      default: {
        url: `https://placehold.co/600x400`,
        localpath: '',
      },
    },
    username: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      trim: true,
    },
    fName: {
      type: String,
      trim: true,
      required: true,
    },
    password: {
      type: String,
      trim: true,
      required: true,
      minLengh: 6,
      maxLength: 20,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    forgotPasswordToken: {
      type: String,
      trim: true,
    },
    forgotPasswordTokenExpiry: {
      type: Date,
    },
    emailVerificationToken: {
      type: String,
      trim: true,
    },
    emailVerificationTokenExpiry: {
      type: Date,
    },
    refreshToken: {
      type: String,
      trim: true,
    }
  },
  { timestamps: true },
);

UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);  
    next();
});
UserSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
}
UserSchema.methods.generateAccessToken = function () {
    return jwt.sign(
      { _id: this._id, email: this.email, username: this.username },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
      },
    );
}
UserSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
      { _Id: this._id },
      process.env.REFRESH_TOKEN_SECRET,
      {expiresIn: process.env.REFRESH_TOKEN_EXPIRY},
    )
}
UserSchema.methods.generateTemporaryToken = function () {
    const unHashedToken = crypto.randomBytes(20).toString('hex');
    const hashedToken = crypto
        .createhash('sha256')
        .update(unHashedToken)
        .digest('hex');
    const tokenExpiry = Date.now() + 20 * 60 * 1000;

    return { unHashedToken,hashedToken, tokenExpiry };
}

export const User = mongoose.model('User', UserSchema);
