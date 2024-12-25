import prisma from '../utils /prisma';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

export const checkUsernameExistence = async (
  username: string,
  res: Response,
): Promise<boolean | void> => {
  try {
    const usernameExist = await prisma.user.findUnique({
      where: { username },
    });
    if (usernameExist) return true;
    return false;
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      res.status(500).json({
        msg: 'Database error while checking username existence.',
        error: err.message,
      });
    } else {
      res.status(500).json({
        msg: 'An unexpected error occurred.',
        error: err,
      });
    }
  }
};
