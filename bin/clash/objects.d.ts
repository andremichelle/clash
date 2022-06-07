import { Contact } from "./contact.js";
import { SceneObject } from "./scene.js";
import { Vector } from "./vector.js";
export declare abstract class MovingObject {
    readonly mass: number;
    readonly inverseMass: number;
    readonly position: Vector;
    readonly velocity: Vector;
    readonly forceAccum: Vector;
    protected constructor(mass: number, x?: number, y?: number);
    move(time: number): void;
    abstract wireframe(context: CanvasRenderingContext2D): void;
    abstract predict(other: SceneObject): NonNullable<Contact>;
    abstract repel(other: SceneObject): void;
}
export declare class MovingCircle extends MovingObject {
    readonly radius: number;
    constructor(mass: number, x: number, y: number, radius: number);
    wireframe(context: CanvasRenderingContext2D): void;
    predict(other: SceneObject): NonNullable<Contact>;
    predictMovingCircle(other: MovingCircle): NonNullable<Contact>;
    predictFixedPoint(other: FixedPoint): NonNullable<Contact>;
    predictFixedGate(other: FixedGate): NonNullable<Contact>;
    repel(other: SceneObject): void;
    repelMovingCircle(other: MovingCircle): void;
    repelFixedPoint(other: FixedPoint): void;
    repelFixedGate(other: FixedGate): void;
}
export declare class FixedPoint implements SceneObject {
    readonly point: Readonly<Vector>;
    constructor(point: Readonly<Vector>);
    wireframe(context: CanvasRenderingContext2D): void;
}
export declare class FixedGate implements SceneObject {
    readonly p0: Readonly<Vector>;
    readonly p1: Readonly<Vector>;
    constructor(p0: Readonly<Vector>, p1: Readonly<Vector>);
    wireframe(context: CanvasRenderingContext2D): void;
}
