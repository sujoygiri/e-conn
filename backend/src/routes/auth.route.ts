import { Router } from "express";
import { body, header } from "express-validator";

import { authenticationHandler, signinHandler, signupHandler } from "../controller/auth.controller";

const authRouter = Router();

const emailValidationChain = () => body('email').trim().notEmpty().withMessage("Email is required").escape().isEmail().withMessage("Not a valid email address");

const usernameValidationChain = () => body('username').trim().notEmpty().withMessage("Username is required").escape().custom(value => {
    const regex = /^(?=.*[a-zA-Z])[a-zA-Z\s]*$/;
    if (!regex.test(value)) {
        throw new Error('Username must contain only letters or whitespace');
    }
    return true;
});
const passwordValidationChain = () => body('password').trim().notEmpty().withMessage("Password is required").escape().isStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1
}).withMessage("Password must be minimum of 8 character long with minimum 1 lowercase, 1 uppercase letter, 1 number and 1 special character");

const cookieValidationChain = () => header("cookie").trim().notEmpty().withMessage("Cookie not found").escape().isString();

authRouter.get("/", (req, res, next) => {
    res.json({ msg: "working" });
});

authRouter.post("/signup", usernameValidationChain(), emailValidationChain(), passwordValidationChain(), signupHandler);

authRouter.post("/signin", emailValidationChain(), passwordValidationChain(), signinHandler);

authRouter.get("/verify", cookieValidationChain(), authenticationHandler);



export default authRouter;