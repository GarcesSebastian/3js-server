import express from "express";
import { createServer } from "http";
import { config } from "dotenv";
import { SocketService } from "./managers/_socket/index.js";

config();

const app = express();
const server = createServer(app);

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);

    SocketService.init(server);
});