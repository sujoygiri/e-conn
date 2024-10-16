import { Request, Response, NextFunction } from "express";

export const resetCookieExpiry = (req: Request, res: Response, next: NextFunction) => {
    console.log(req.session.cookie.maxAge);
    req.session.cookie.expires = new Date(Date.now() + 60 * 1000);
    req.session.cookie.maxAge = 60 * 1000;
    next();
};