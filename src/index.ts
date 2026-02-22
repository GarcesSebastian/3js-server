import express from "express";
import { createServer } from "http";
import { config } from "dotenv";
import { SocketService } from "./managers/_socket/index.js";
import type { Request, Response } from "express";

config();

const app = express();
const server = createServer(app);

const PORT = process.env.PORT || 4000;

app.get("/", (req: Request, res: Response) => {
    res.status(200).json({
        message: "Server is running"
    })
})

server.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);

    SocketService.init(server);
});