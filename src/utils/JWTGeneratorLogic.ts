import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const secretKey = process.env.JWT_SECRET!;
const jwtTTL = parseInt(process.env.JWT_TTL || '3600');
const issuer = process.env.JWT_ISSUER!;
const audience = process.env.JWT_AUDIENCE!;

interface GenerateTokenOptions {
  secret?: string;
  ttl?: number;
  issuer?: string;
  audience?: string;
}

export interface TokenPayload {
  sub: string;
  iat: number;
  exp: number;
  iss: string;
  aud: string;
}

export const generateToken = (
  userId: string,
  options: GenerateTokenOptions = {},
): string => {
  const {
    secret = secretKey,
    ttl = jwtTTL,
    issuer: tokenIssuer = issuer,
    audience: tokenAudience = audience,
  } = options;

  const now = Math.floor(Date.now() / 1000);
  const payload: TokenPayload = {
    sub: userId,
    iat: now,
    exp: now + ttl,
    iss: tokenIssuer,
    aud: tokenAudience,
  };

  const token = jwt.sign(payload, secret, { algorithm: 'HS256' });

  return token;
};
