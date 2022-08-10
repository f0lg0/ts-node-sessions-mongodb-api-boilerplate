import dotenv from "dotenv";
import express, { Express, RequestHandler } from "express";
import cors from "cors";
import mongoose from "mongoose";

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
        this.app.use(notFoundHandler);
    }

    start() {
        this.dbConnect();
        this.useMiddleware();
        this.registerRoutes();

        this.app.listen(this.port, this.host, () => {
            console.log(`[*] Server running on ${this.host}:${this.port}`);
        });
    }
}

dotenv.config();
const server = new Server(process.env.HOST!, parseInt(process.env.PORT!), process.env.MONGOURI!);
server.start();
