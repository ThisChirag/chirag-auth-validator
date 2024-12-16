import validator from 'validator';

const email = "er.chiragsharma.atemail@gmail.com@";

const isValid  = validator.isEmail(email);

console.log(isValid);