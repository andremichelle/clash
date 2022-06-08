export declare class Vector {
    x: number;
    y: number;
    static subtract(a: Vector, b: Vector): Vector;
    static normalized(v: Vector): Vector;
    constructor(x: number, y: number);
    zero(): void;
    add(other: Vector): void;
    addScaled(other: Vector, scale: number): void;
    scale(value: number): void;
    clone(): Vector;
    dot(): number;
    length(): number;
    toString(): string;
}
