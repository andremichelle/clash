export declare class Vector {
    x: number;
    y: number;
    static create(a: Vector, b: Vector): Vector;
    constructor(x?: number, y?: number);
    zero(): void;
    add(other: Vector): void;
    addScaled(other: Vector, scale: number): void;
    scale(value: number): void;
    normalize(): Vector;
    normal(): Vector;
    clone(): Vector;
    dot(): number;
    length(): number;
    toString(): string;
}
