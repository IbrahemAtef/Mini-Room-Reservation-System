import * as argon from 'argon2';

export const createArgonHash = (textValue: string) => {
  return argon.hash(textValue);
};

export const verifyArgonHash = (textValue: string, hashedValue: string) => {
  return argon.verify(hashedValue, textValue);
};
