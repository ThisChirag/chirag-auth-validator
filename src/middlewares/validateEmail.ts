import validator from 'validator';

export const validateEmail = (email: string): boolean => {
  const isValid = validator.isEmail(email);
  if (!email || !isValid) {
    return false;
  } else return true;
};
