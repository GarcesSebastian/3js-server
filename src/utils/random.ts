export class Random {
    public static range(min: number, max: number): number {
        return Math.random() * (max - min) + min;
    }

    public static rangeInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    public static choice<T>(array: T[]): T | undefined {
        return array[Math.floor(Math.random() * array.length)];
    }
}