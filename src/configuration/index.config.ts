import { config } from "dotenv";

config();

const GeneralConfig = {
    PORT: Number(process.env.PORT) || 3000,
    ORIGINS: process.env.ORIGINS?.split(",") || [],
    RATE_LIMIT_WINDOW: Number(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000,
    RATE_LIMIT_MAX: Number(process.env.RATE_LIMIT_MAX) || 100,
    NODE_ENV: process.env.NODE_ENV || "production",
    FRONTEND_URL: process.env.FRONTEND_URL || ""
}

export const IndexConfig = {
    general: GeneralConfig
}