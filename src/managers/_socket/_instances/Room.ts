import type { ISocket } from "./ISocket.js";
import { v4 as uuidv4 } from "uuid";
import chalk from "chalk";
import { Logs } from "./Logs.js";

export interface OptionsEvent {
    event: string;
    data: any;
    ignoreList?: ISocket[];
    onlyList?: ISocket[];
}

export class Room {
    private room_id: string;
    private room_name: string;
    private room_sockets: Map<string, ISocket> = new Map<string, ISocket>();

    constructor(room_name: string) {
        this.room_id = uuidv4();
        this.room_name = room_name;
    }

    public getSockets() {
        return this.room_sockets;
    }

    public getSocketById(id: string) {
        return this.room_sockets.get(id);
    }

    public getSocketByUserId(id: string) {
        return Array.from(this.room_sockets.values()).filter((socket) => socket.user.id === id);
    }

    public getRoomId() {
        return this.room_id;
    }

    public getRoomName() {
        return this.room_name;
    }

    public join(socket: ISocket) {
        const existingSocket = Array.from(this.room_sockets.values()).find((s) => s.user.id === socket.user.id);
        if (existingSocket) {
            this.leave(existingSocket);
        }

        this.room_sockets.set(socket.id, socket);
        socket.rooms.set(this.getRoomId(), this);
    }

    public leave(socket: ISocket) {
        this.room_sockets.delete(socket.id);
        socket.rooms.delete(this.getRoomId());
    }

    public leaveByUserId(id: string) {
        this.room_sockets.forEach((socket) => {
            if (socket.user.id === id) {
                this.leave(socket);
            }
        });
    }

    public sendEvent(options: OptionsEvent) {
        this.room_sockets.forEach((socket) => {
            if (options.ignoreList?.includes(socket)) {
                return;
            }

            if (options.onlyList && !options.onlyList.includes(socket)) {
                return;
            }

            socket.emit(options.event, options.data);
        });
    }
}