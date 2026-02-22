import type { Socket } from "socket.io";
import type { ISocket } from "./ISocket.js";
import chalk from "chalk";

export class Logs {
    public static init() {
        console.log(chalk.green("Socket service initialized"));
    }

    public static logged(socket: ISocket) {
        console.log(chalk.green("Client logged with id"), chalk.yellow(socket.user.id));
    }

    public static connection(socket: Socket) {
        console.log(chalk.green("Client connected with id"), chalk.yellow(socket.id));
    }

    public static disconnection(socket: Socket) {
        console.log(chalk.red("Client disconnected with id"), chalk.yellow(socket.id));
    }

    public static error(error: Error) {
        console.log(chalk.red("Error"), error);
    }
}