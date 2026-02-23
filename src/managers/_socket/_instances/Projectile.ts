import { SocketService } from "../index.js";

export interface ProjectileProps {
    id: string;
    ownerId: string;
    position: { x: number, y: number, z: number };
    rotation: { x: number, y: number, z: number };
    speed: number;
    damage: number;
    radius: number;
    ttl: number;
    createdAt: number;
}

export interface MoveEventData {
    id: string;
    ownerId: string;
    position: { x: number, y: number, z: number };
    rotation: { x: number, y: number, z: number };
}

export interface HitEventData {
    id: string;
    ownerId: string;
    targetId: string;
}

export interface DeathEventData {
    id: string;
    ownerId: string;
}

export class Projectile {
    public id: string;
    public ownerId: string;
    public position: { x: number, y: number, z: number };
    public rotation: { x: number, y: number, z: number };
    public speed: number;
    public damage: number;
    public radius: number;
    public ttl: number;
    public readonly createdAt: number;

    public constructor(payload: ProjectileProps) {
        this.id = payload.id;
        this.ownerId = payload.ownerId;
        this.position = payload.position;
        this.rotation = payload.rotation;
        this.speed = payload.speed;
        this.damage = payload.damage;
        this.radius = payload.radius;
        this.ttl = payload.ttl;
        this.createdAt = payload.createdAt ?? Date.now();
    }

    public updateMove(data: MoveEventData) {
        this.position = data.position;
        this.rotation = data.rotation;
    }

    public updateDeath() {
        this.destroy();
    }

    public getStats(): ProjectileProps {
        return {
            id: this.id,
            ownerId: this.ownerId,
            position: this.position,
            rotation: this.rotation,
            speed: this.speed,
            damage: this.damage,
            radius: this.radius,
            ttl: this.ttl,
            createdAt: this.createdAt
        }
    }

    public destroy() {
        const sockerService = SocketService.init();
        if (!sockerService) throw new Error("SocketService not initialized");
        sockerService.projectiles.delete(this.id);
    }
}