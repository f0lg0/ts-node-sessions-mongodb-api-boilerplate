import { Request, Response, NextFunction } from "express";
import { User } from "./userModel";

export default async function requiresLogin(req: Request, res: Response, next: NextFunction) {
    if (req.session.userId == null) {
        res.status(401);
        res.json({
            success: false,
            error: "Unauthorized",
            message: "Authentication failed, please login.",
        });
        return;
    }

    const user = await User.findOne({ _id: req.session.userId });

    // something went really wrong
    if (user === null) {
        req.session.destroy((err) => console.error(err));
        res.status(500);
        res.json({
            success: false,
            error: "Internal error",
            message: "Cannot find user based on user session.",
        });

        return;
    }

    // we can attach the user object to the request so we can use it whenever we need it
    // for now, im only attaching the username
    req.user = user.username;
    next();
}
