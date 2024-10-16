import { Router } from "express";
import { body } from "express-validator";
import { searchHandler } from "../controller/util.controller";


const utilRouter = Router();

const emailValidationChain = () => body('email').trim().notEmpty().escape().matches(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/);

utilRouter.post("/search", emailValidationChain(), searchHandler);



export default utilRouter;
