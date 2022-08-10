import express, { Request, Response } from "express";
const router = express.Router();

import bcrypt from "bcrypt";
import validateCreds from "./validateCreds";
import { User, IUser } from "./userModel";
import requiresLogin from "./requiresLogin.js";

router.post("/login", async (req: Request, res: Response) => {
    // already logged in
    if (req.session.userId) {
        res.status(201);
        res.json({
            success: true,
            message: "Already logged in.",
        });
        return;
    }

    try {
        const user = await User.findOne({ username: req.body.username });
        if (user === null) {
            res.status(401);
            res.json({
                success: false,
                error: "Invalid user",
                message: `Cannot find user '${req.body.username}'`,
            });

            return;
        }

        if (await bcrypt.compare(req.body.password, user.password)) {
            req.session.userId = user._id.toString();

            res.status(201);
            res.json({
                success: true,
                message: `Successfully logged in. Welcome ${user.username}`,
            });
        } else {
            res.status(401);
            res.json({
                success: false,
                error: "Login failed",
                message: `Credentials are not valid.`,
            });
        }
    } catch (err: unknown) {
        if (!(err instanceof Error)) throw err;

        res.status(500);
        res.json({
            success: false,
            error: "Internal error",
            message: err.message,
        });
    }
});

router.post("/signup", async (req: Request, res: Response) => {
    if (!validateCreds(req.body.username, req.body.password)) {
        // bad request
        res.status(400);
        res.json({
            succes: false,
            error: "Invalid credentials",
            message: "Some credentials don't respect the rules.",
        });

        return;
    }

    try {
        const salt = await bcrypt.genSalt();
        const hashedpass = await bcrypt.hash(req.body.password, salt);

        const newTruckOwner = new User({
            username: req.body.username,
            password: hashedpass,
        });

        await newTruckOwner.save();

        res.status(201);
        res.json({
            success: true,
            message: "Successfully signed up. Please login.",
        });
    } catch (err: unknown) {
        if (!(err instanceof Error)) throw err;

        res.status(500);
        res.json({
            success: false,
            error: "Internal error",
            message: err.message,
        });
    }
});

router.get("/logout", requiresLogin, async (req: Request, res: Response) => {
    req.session.destroy((err) => console.error(err));

    res.status(200);
    res.json({
        success: true,
        message: "Successfully logged out.",
    });
});

router.get("/auth", async (req: Request, res: Response) => {
    res.json({
        loggedIn: !!req.session.userId,
    });
});

export default router;
