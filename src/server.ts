import "reflect-metadata";
import dotenv from "dotenv";
import express, { Express, RequestHandler, ErrorRequestHandler } from "express";

class Server {
    private app: Express;
    private HOST: string;
    private PORT: number;

    constructor() {
        dotenv.config();
        this.app = express();

        this.HOST = process.env.HOST!;
        this.PORT = parseInt(process.env.PORT!);
    }

    start() {
        const home: RequestHandler = (_, res) => {
            res.json({
                message: "Homepage",
            });
        };

        const not_found_handler: RequestHandler = (_, res) => {
            res.status(404);
            res.json({
                error: 404,
                message: "Not found",
            });
        };

        const error_handler: ErrorRequestHandler = (err, req, res, next) => {
            res.status(res.statusCode);
            res.json({
                message: err.message,
                stack: err.stack,
            });
        };

        this.app.get("/", home);
        this.app.use(not_found_handler);
        this.app.use(error_handler);

        this.app.listen(this.PORT, this.HOST, () => {
            console.log(`[*] Server running on ${this.HOST}:${this.PORT}`);
        });
    }
}

const server = new Server();
server.start();
