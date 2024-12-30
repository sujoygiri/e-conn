import validator from "validator";

export const validateEmail = (email: string) => validator.isEmail(email);