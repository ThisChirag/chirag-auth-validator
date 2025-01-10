import prisma from '../utils/prisma';
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
    res.status(500).json({
      msg: 'An unexpected error occurred.',
      error: err,
    });
    return;
  }
};
