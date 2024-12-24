import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { TokenPayload } from '../utils /GeneratorLogic';
import prisma from '../utils /prisma';
import { getTokenFromUser_Id } from '../redisCache';

dotenv.config();

const secretKey = process.env.SECRET_KEY;


export interface AuthReq extends Request {
  user? : TokenPayload;

}

const verifyPromise = (token: any, secretKey: any): Promise<TokenPayload> => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secretKey, (err: any, decode: any) => {
      if (!decode) {
        reject(err);
      }
      resolve(decode as TokenPayload);
    });
  });
};

export const authenticateToken = async (
  req: AuthReq,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const authToken = req.headers.authorization;

  if (!authToken) {
    res.status(401).json({
      msg: 'Unauthorized, Token not provided.. Please Create Account or login',
    });
    return;
  }
  const token = authToken && authToken.split(' ')[1];

  try {
    const user = await verifyPromise(token, secretKey);
    const activeToken = await getTokenFromUser_Id(user.user_Id);
    const isPresent = await prisma.user.findUnique({
      where: { id: user.user_Id },
    });

    if (!isPresent) {
      res.status(404).json({
        msg: 'user not found',
      });
      return;
    }
    if (!activeToken || activeToken !== token) {
      res.status(401).json({
        msg: 'Token expired, please login again',
      });
      return;
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      msg: "Token is invalid, please login"
    });
    return;
  }
};
