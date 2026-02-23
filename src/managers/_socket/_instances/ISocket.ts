import type { Socket as SocketInstance } from "socket.io";
import type { Room } from "./Room.js";

export interface UserSocket {
    id?: string;
    username?: string;
    health?: number;
    maxHealth?: number;
    position?: { x: number, y: number, z: number } | undefined;
    rotation?: { x: number, y: number, z: number } | undefined;
}

export class ISocket {
    public id: string;
    public rooms: Map<string, Room> = new Map<string, Room>();
    public user: UserSocket;
    private socket: SocketInstance;

    constructor(socket: SocketInstance, user: UserSocket) {
        this.id = socket.id;
        this.user = user;
        this.socket = socket;
    }

    public emit<T>(event: string, data: T): void {
        this.socket.emit(event, data);
    }

    public join(room: Room): void {
        room.join(this);
    }

    public leave(room: Room): void {
        room.leave(this);
    }

    public updateUser(user: Partial<UserSocket>): void {
        this.user = { ...this.user, ...user };
    }

    public disconnection(): void {
        this.rooms.forEach((room) => {
            room.leave(this);
        });
    }

    public getSocket(): SocketInstance {
        return this.socket;
    }
}