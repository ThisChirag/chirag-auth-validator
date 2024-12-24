import { Response } from 'express';
import { generateToken } from '../utils /JWTGeneratorLogic';
import { AuthenticatedRequest } from '../middlewares/authenticateToken';
import { verifyingPassword } from '../utils /hashPassword';
import prisma from '../utils /prisma';
import { setNewToken, connectReddis } from '../redisCache';


connectReddis();

const saltRounds = parseInt(process.env.SALT_ROUNDS ?? '10');
const jwt_expiration = (parseInt(process.env.JWT_ACCESS_TOKEN_EXPIRATION!))/3600;


export const home = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, email, id } = req.user!;
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

export const login = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { email_or_username, password } = req.body;

    if(!email_or_username){
      res.status(400).json({
        msg: "email or username field cannot be empty",
      })
      return;
    }

    if(!password){
      res.status(400).json({
        msg: "password cannot be empty",
      })
      return;
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email_or_username },
          { username: email_or_username },
        ],
      },
    });

    if (!user) {
       res.status(404).json({ msg: 'User not found' });
       return;
    }
    const passwordIsValid = await verifyingPassword(password, user.password);
    if (!passwordIsValid) {
       res.status(401).json({ msg: 'Wrong email/username or password' });
       return;
    }

    const userId = user.id;
    const newToken = generateToken(userId);

    await setNewToken(userId, newToken, 3600);

    res.status(200).json({
      msg: `Login Successful, token is valid for ${jwt_expiration} hour(s)`,
      newToken,
    });
    return;
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ msg: 'Internal server error' });
    return;
  }
};