import { Response } from 'express';
import { generateToken } from '../utils /GeneratorLogic';
import { AuthReq } from '../middlewares/authenticateToken';
import { verifyingPassword } from '../utils /hashPassword';
import prisma from '../utils /prisma';
import { setNewToken, connectReddis } from '../redisCache';

connectReddis();

const saltRounds = parseInt(process.env.SALT_ROUNDS ?? '10');

// "/api/home" protected route logic
export const home = async (req: AuthReq, res: Response) => {
  try {
    const { name, email, user_Id } = req.user!;
    res.status(200).json({
      message:
        'You are in /api/home route and have succussfully setup the authentication',
    });
  } catch (error) {
    console.log('An Error Occured: ' + error);
    res.status(500).json({
      msg: 'Internal Server Error',
    });
  }
};

// "/api/login" route logic
export const login = async (req: AuthReq, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({
      msg: 'please provide all the details',
    });
    return;
  }

  const user_present = await prisma.user.findUnique({
    where: { email },
  });
  if (!user_present) {
    res.status(404).json({
      msg: 'user not found',
    });
    return;
  }
  const hashedPassword = user_present?.password;
  const verifyPass = await verifyingPassword(password, hashedPassword);

  if (user_present && verifyPass) {
    const name = user_present.username;
    const user_id = user_present.id;
    const newToken = generateToken(name, email, user_id);
    await setNewToken(user_id, newToken, 3600);

    res.status(200).json({
      msg: 'Login Succussful, token is valid for 1 hour',
      newToken: newToken,
    });
    return;
  } else {
    res.status(401).json({
      msg: 'Wrong email or password',
    });
  }
};
