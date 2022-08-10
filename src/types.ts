import "express";
import "express-session";

declare module "express-session" {
    interface SessionData {
        userId?: string;
    }
}

declare module "express" {
    interface Request {
        user?: string;
    }
}
