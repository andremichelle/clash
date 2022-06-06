export declare class Vector {
    x: number;
    y: number;
    static create(a: Vector, b: Vector): Vector;
    constructor(x?: number, y?: number);
    add(other: Vector): void;
    addScaled(other: Vector, scale: number): void;
    normalize(): Vector;
    normal(): Vector;
    dot(): number;
    length(): number;
}
