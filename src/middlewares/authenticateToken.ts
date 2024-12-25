import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { TokenPayload } from '../utils /JWTGeneratorLogic';
import prisma from '../utils /prisma';
import { getTokenFromUser_Id } from '../redisCache';

dotenv.config();

const secretKey = process.env.JWT_SECRET!;

export interface AuthenticatedRequest extends Request {
  user?: {
    name: string;
    email: string;
    username: string;
    id: string;
  };
}

const verifyPromise = (
  token: string,
  secret: string,
): Promise<TokenPayload> => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secret, (err, decode) => {
      if (err || !decode) {
        reject(err);
      }
      resolve(decode as TokenPayload);
    });
  });
};

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({
      msg: 'Unauthorized: Token not provided. Please create an account or login.',
    });
    return;
  }
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({
      msg: 'Unauthorized: Token not provided. Please create an account or login.',
    });
    return;
  }
  try {
    const decode_tokenDetails = await verifyPromise(token, secretKey);

    if (!decode_tokenDetails.sub) {
      throw new Error('Token missing subject');
    }
    const activeToken = await getTokenFromUser_Id(decode_tokenDetails.sub);
    if (!activeToken || activeToken !== token) {
      res.status(401).json({
        msg: 'Token expired or invalid. Please login again.',
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: decode_tokenDetails.sub },
    });

    if (!user) {
      res.status(404).json({
        msg: 'User not found.',
      });
      return;
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      msg: 'Invalid or expired token. Please login.',
    });
    return;
  }
};
