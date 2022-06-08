import { Contact } from "./contact.js";
import { FixedCircleFormat, FixedLineFormat, FixedPointFormat, MovingCircleFormat } from "./format.js";
import { SceneObject } from "./scene.js";
import { Vector } from "./vector.js";
export declare abstract class MovingObject extends SceneObject {
    readonly mass: number;
    readonly inverseMass: number;
    readonly position: Vector;
    readonly velocity: Vector;
    readonly force: Vector;
    protected constructor(mass: number, x?: number, y?: number);
    applyForces(): void;
    integrate(time: number): void;
    abstract wireframe(context: CanvasRenderingContext2D): void;
    abstract proximateMovingCircle(nearest: Contact, other: MovingCircle): NonNullable<Contact>;
    abstract repelMovingCircle(circle: MovingCircle): void;
}
export declare class MovingCircle extends MovingObject {
    readonly radius: number;
    constructor(mass: number, x: number, y: number, radius: number);
    wireframe(context: CanvasRenderingContext2D): void;
    proximateMovingCircle(nearest: Contact, other: MovingCircle): NonNullable<Contact>;
    repelMovingCircle(other: MovingCircle): void;
    serialize(): MovingCircleFormat;
}
export declare class FixedPoint extends SceneObject {
    readonly point: Readonly<Vector>;
    constructor(point: Readonly<Vector>);
    wireframe(context: CanvasRenderingContext2D): void;
    proximateMovingCircle(nearest: Contact, circle: MovingCircle): NonNullable<Contact>;
    repelMovingCircle(circle: MovingCircle): void;
    serialize(): FixedPointFormat;
}
export declare enum Outline {
    Both = "both",
    Positive = "positive",
    Negative = "negative"
}
export declare class CircleSegment {
    readonly angleMin: number;
    readonly angleRange: number;
    static Full: CircleSegment;
    constructor(angleMin: number, angleRange: number);
}
export declare class FixedCircle extends SceneObject {
    readonly point: Readonly<Vector>;
    readonly radius: number;
    readonly outline: Outline;
    readonly segment: CircleSegment;
    constructor(point: Readonly<Vector>, radius: number, outline?: Outline, segment?: CircleSegment);
    wireframe(context: CanvasRenderingContext2D): void;
    proximateMovingCircle(nearest: Contact, circle: MovingCircle): NonNullable<Contact>;
    proximateMovingCircleSigned(nearest: Contact, circle: MovingCircle, sign: number): NonNullable<Contact>;
    repelMovingCircle(circle: MovingCircle): void;
    serialize(): FixedCircleFormat;
}
export declare class FixedLine extends SceneObject {
    readonly p0: Readonly<Vector>;
    readonly p1: Readonly<Vector>;
    readonly gate: boolean;
    constructor(p0: Readonly<Vector>, p1: Readonly<Vector>, gate?: boolean);
    wireframe(context: CanvasRenderingContext2D): void;
    proximateMovingCircle(nearest: Contact, circle: MovingCircle): NonNullable<Contact>;
    repelMovingCircle(circle: MovingCircle): void;
    serialize(): FixedLineFormat;
}
