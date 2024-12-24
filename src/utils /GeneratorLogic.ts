import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();
const secretKey = process.env.SECRET_KEY || 'just_testing';
const jwt_expiration = parseInt(process.env.JWT_ACCESS_TOKEN_EXPIRATION!);


export interface TokenPayload {
  user_Id: string;
  name: string;
  email: string;
}

export const generateToken = (
  name: string,
  email: string,
  user_Id: string,
): string => {
  const payload: TokenPayload = {
    user_Id,
    name,
    email
  }; // consider avoiding passwords in the payload ,

  const token = jwt.sign(payload, secretKey, { expiresIn: jwt_expiration });

  return token;
};
