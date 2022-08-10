import dotenv from "dotenv";
import express, { Express, RequestHandler } from "express";
import cors from "cors";
import mongoose from "mongoose";
import session, { SessionOptions } from "express-session";
import MongoStore from "connect-mongo";

import userRoutes from "./user/userRoutes";

class Server {
    private app: Express;
    private host: string;
    private port: number;
    private mongoURI: string;

    constructor(host: string, port: number, mongoURI: string) {
        this.host = host;
        this.port = port;
        this.mongoURI = mongoURI;

        this.app = express();
    }

    private dbConnect() {
        mongoose.connect(this.mongoURI);
        mongoose.connection.on("error", (error) => console.error(error));
        mongoose.connection.on("open", () => console.log(`db: connected to database at URI -> ${this.mongoURI}`));
    }

    private useMiddleware() {
        this.app.use(express.json());

        // cors
        const allowedOrigins: string[] = ["http://localhost"];
        const corsOptions: cors.CorsOptions = {
            origin: function (origin: string | undefined, callback: (err: Error | null, origin?: string | boolean) => void) {
                if (process.env.ENV === "prod") {
                    if (origin && allowedOrigins.indexOf(origin) !== -1) {
                        callback(null, true);
                    } else {
                        console.log(`[!] A unallowed origin has tried to connect --> ${origin} [!]`);
                        callback(new Error("Not allowed by CORS"));
                    }
                } else {
                    callback(null, true);
                }
            },
            optionsSuccessStatus: 200,
            credentials: true,
        };
        this.app.use(cors(corsOptions));
    }

    private registerRoutes() {
        const notFoundHandler: RequestHandler = (_, res) => {
            res.status(404);
            res.json({
                error: 404,
                message: "Not found",
            });
        };

        const home: RequestHandler = (req, res) => {
            console.log(req);
            res.json({
                message: "Homepage",
            });
        };

        this.app.get("/", home);
        this.app.use("/user", userRoutes);
        this.app.use(notFoundHandler);
    }

    private initSessions() {
        // 1 hour exp date
        const cookieExpDate = 1000 * 60 * 60;

        const sess: SessionOptions = {
            // secret used to sign cookies
            secret: process.env.SESSION_SECRET!,
            // if resave=true express-session will always save the session data after every request (can cause race conditions)
            resave: false,
            // saving a session to db only if it's used for something
            saveUninitialized: false,
            // we use MongoDB to store sessions, tables are handled automatically by this package
            store: MongoStore.create({
                mongoUrl: this.mongoURI,
            }),
            // cookie contents, this config is for testing
            cookie: {
                path: "/",
                // no js access
                httpOnly: true,
                // true only with https
                secure: false,
                // exp date
                maxAge: cookieExpDate,
                // https://portswigger.net/web-security/csrf/samesite-cookies
                sameSite: "lax",
            },
        };
        // production configuration, need to come back to this before deploying
        if (process.env.ENV === "prod") {
            this.app.set("trust proxy", 1);
            sess.cookie!.secure = true;
        }

        this.app.use(session(sess));
    }

    start() {
        this.dbConnect();
        this.useMiddleware();
        this.initSessions();
        this.registerRoutes();

        this.app.listen(this.port, this.host, () => {
            console.log(`[*] Server running on ${this.host}:${this.port}`);
        });
    }
}

dotenv.config();
const server = new Server(process.env.HOST!, parseInt(process.env.PORT!), process.env.MONGOURI!);
server.start();
