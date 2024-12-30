import Joi from "joi";

export const emailValidation = Joi.string().email().required();