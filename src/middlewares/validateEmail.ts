import validator from 'validator';

export const validateEmail = async(email:string): Promise<boolean> =>{

  const isValid = validator.isEmail(email)
  if(!email || !isValid){
    return false;
  }
  else return true;

  console.log(isValid);
}