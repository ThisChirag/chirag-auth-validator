import { NextFunction, Request, Response } from 'express';
import validator from 'validator';

export const validateEmail = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const email = req.body;

  if (!email || !validator.isEmail(email)) {
    res.status(400).json({
      msg: 'Invalid Email Format',
    });
    return;
  }

  next();
};
