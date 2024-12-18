import { NextFunction, Request, Response } from 'express';

const syntaxError = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (err instanceof SyntaxError) {
    res.status(400).json({
      message: 'Invalid JSON syntax',
      error: err.message,
    });
  } else {
    next(err);
  }
};

export default syntaxError;
