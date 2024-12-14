import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();
const secretKey = process.env.SECRET_KEY || 'just_testing';

export interface TokenPayload {
  name: string;
  email: string;
  user_Id: string;
}

export const generateToken = (
  name: string,
  email: string,
  user_id: string,
): string => {
  const payload: TokenPayload = {
    name: name,
    email: email,
    user_Id: user_id,
  }; // consider avoiding passwords in the payload ,

  const token = jwt.sign(payload, secretKey, { expiresIn: 3600 });

  return token;
};
