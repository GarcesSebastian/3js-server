export interface PayloadJoin {
    id: string;
    username: string;
    position?: { x: number, y: number, z: number };
    rotation?: { x: number, y: number, z: number };
    health: number;
}