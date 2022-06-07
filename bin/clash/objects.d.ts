import { Contact } from "./contact.js";
import { SceneObject } from "./scene.js";
import { Vector } from "./vector.js";
export declare abstract class MovingObject {
    readonly mass: number;
    readonly inverseMass: number;
    readonly position: Vector;
    readonly velocity: Vector;
    readonly force: Vector;
    protected constructor(mass: number, x?: number, y?: number);
    applyForces(): void;
    integrate(time: number): void;
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
    predictFixedCircle(other: FixedCircle): NonNullable<Contact>;
    predictFixedGate(other: FixedLine): NonNullable<Contact>;
    repel(other: SceneObject): void;
    repelMovingCircle(other: MovingCircle): void;
    repelFixedPoint(other: FixedPoint): void;
    repelFixedCircle(other: FixedCircle): void;
    repelFixedGate(other: FixedLine): void;
}
export declare class FixedPoint implements SceneObject {
    readonly point: Readonly<Vector>;
    constructor(point: Readonly<Vector>);
    wireframe(context: CanvasRenderingContext2D): void;
}
export declare class FixedCircle implements SceneObject {
    readonly center: Readonly<Vector>;
    readonly radius: number;
    constructor(center: Readonly<Vector>, radius: number);
    wireframe(context: CanvasRenderingContext2D): void;
}
export declare class FixedLine implements SceneObject {
    readonly p0: Readonly<Vector>;
    readonly p1: Readonly<Vector>;
    readonly gate: boolean;
    constructor(p0: Readonly<Vector>, p1: Readonly<Vector>, gate?: boolean);
    wireframe(context: CanvasRenderingContext2D): void;
}
