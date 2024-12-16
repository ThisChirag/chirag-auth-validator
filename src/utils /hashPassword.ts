import bycrypt from 'bcrypt';

const saltRounds = parseInt(process.env.SALT_ROUNDS ?? '10');

export const hashingPassword = async (password: string): Promise<string> => {
  const hashedPassword = await bycrypt.hash(password, saltRounds);
  return hashedPassword;
};

export const verifyingPassword = async (
  password: string,
  hashedPassword: string,
): Promise<boolean> => {
  if (!hashedPassword) {
    return false;
  }
  const isSamePassword = await bycrypt.compare(password, hashedPassword);
  return isSamePassword;
};

