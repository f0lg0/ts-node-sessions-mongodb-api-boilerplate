import dotenv from "dotenv";
import express, { Express, RequestHandler } from "express";

class Server {
    private app: Express;
    private host: string;
    private port: number;

    constructor(host: string, port: number) {
        this.host = host;
        this.port = port;

        this.app = express();
    }

    private useMiddleware() {
        this.app.use(express.json());
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
        this.app.use(notFoundHandler);
    }

    start() {
        this.useMiddleware();
        this.registerRoutes();

        this.app.listen(this.port, this.host, () => {
            console.log(`[*] Server running on ${this.host}:${this.port}`);
        });
    }
}

dotenv.config();
const server = new Server(process.env.HOST!, parseInt(process.env.PORT!));
server.start();
