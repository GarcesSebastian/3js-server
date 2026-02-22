import { type Socket, Server as SocketServer } from "socket.io";
import { IncomingMessage, ServerResponse, Server as HttpServer } from "http";
import { Logs } from "./_instances/Logs.js";
import { Room } from "./_instances/Room.js";
import { ISocket, type UserSocket } from "./_instances/ISocket.js";
import chalk from "chalk";
import { IndexConfig } from "../../configuration/index.config.js";

export class SocketService {
    public static instance: SocketService | null = null;
    private socket: SocketServer;
    private ISockets: Map<string, ISocket> = new Map<string, ISocket>();

    public room_lobby: Room; // Room to all users
    public room_game: Room;

    // Protección por IP
    private connectionsByIP: Map<string, Set<string>> = new Map();
    private eventCounts: Map<string, Map<string, number[]>> = new Map();

    private constructor(socket: SocketServer) {
        this.socket = socket;
        this.room_lobby = new Room("lobby");
        this.room_game = new Room("game");
        this.start();
    }

    public static init(httpServer?: HttpServer<typeof IncomingMessage, typeof ServerResponse>): SocketService | null {
        if (!this.instance && httpServer) {
            const socket = new SocketServer(httpServer, {
                cors: {
                    origin: IndexConfig.general.ORIGINS,
                    methods: ["GET", "POST", "PUT", "DELETE"],
                    allowedHeaders: ["Content-Type", "Authorization"]
                },
                allowEIO3: true,
                serveClient: false,
                pingTimeout: 20000,
                pingInterval: 10000,
                cookie: false,
                transports: ["websocket"],
                maxHttpBufferSize: 1e6,
                perMessageDeflate: {
                    threshold: 1024
                },
                connectTimeout: 10000
            });

            this.instance = new SocketService(socket);
        }

        return this.instance;
    }

    private start(): void {
        Logs.init();

        this.socket.use((socket, next) => {
            socket.use(async (packet, nextPacket) => {
                const eventName = packet[0];

                if (eventName === 'disconnect' || eventName === 'error') {
                    return nextPacket();
                }

                const payloadStr = JSON.stringify(packet);
                if (payloadStr.length > 50000) {
                    const clientIp = this.getClientIP(socket);
                    console.error(chalk.red(`Payload excedido (${payloadStr.length} bytes) de IP ${clientIp}`));
                    socket.disconnect(true);
                    return nextPacket(new Error('Payload too large'));
                }

                nextPacket();
            });

            next();
        });

        this.socket.on("connection", async (socket) => {
            const clientIp = this.getClientIP(socket);

            if (!this.connectionsByIP.has(clientIp)) {
                this.connectionsByIP.set(clientIp, new Set());
            }
            this.connectionsByIP.get(clientIp)!.add(socket.id);

            const new_socket = this.createSocket(socket, {});
            new_socket.join(this.room_lobby);

            const current_players = [...this.room_game.getSockets().values()].map((s) => s.user);
            socket.emit('socket:connected:client', { id: socket.id, players: current_players })

            socket.on("player:join", (data: { id: string, username: string }) => {
                const socket_instance = this.ISockets.get(socket.id);
                if (!socket_instance) {
                    return;
                }

                socket_instance.updateUser({ id: data.id, username: data.username });
                socket_instance.join(this.room_game);
                Logs.logged(socket_instance);

                this.ISockets.forEach((s) => {
                    if (s.id !== socket.id) {
                        s.emit("player:joined", {
                            id: socket_instance.user.id,
                            username: socket_instance.user.username
                        });
                    }
                })
            })

            socket.on("disconnect", async () => {
                const socket_instance = this.ISockets.get(socket.id);
                if (!socket_instance) {
                    return;
                }

                if (socket_instance.rooms.has(this.room_game.getRoomId())) {
                    this.room_game.sendEvent({
                        event: "player:left",
                        data: {
                            id: socket_instance.user.id,
                            username: socket_instance.user.username
                        },
                        ignoreList: [socket_instance]
                    });
                }

                const ipConnections = this.connectionsByIP.get(clientIp);
                if (ipConnections) {
                    ipConnections.delete(socket.id);
                    if (ipConnections.size === 0) {
                        this.connectionsByIP.delete(clientIp);
                    }
                }

                this.eventCounts.delete(socket.id);

                socket_instance.disconnection();
                this.ISockets.delete(socket_instance.id);
            })
        })

        this.socket.on("error", (error) => {
            Logs.error(error);
        })
    }

    private getClientIP(socket: Socket): string {
        const headerIp = socket.handshake.headers['x-forwarded-for'];
        const ip = Array.isArray(headerIp) ? headerIp[0] : headerIp?.split(',')[0];
        return ip?.trim() || socket.handshake.address || "0.0.0.0";
    }

    private createSocket(socket: Socket, user: UserSocket): ISocket {
        const socket_instance = new ISocket(socket, user);
        this.ISockets.set(socket_instance.id, socket_instance);
        return socket_instance;
    }
}