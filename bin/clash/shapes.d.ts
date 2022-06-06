import { Contact } from "./contact.js";
import { MovingObject } from "./objects.js";
import { SceneObject } from "./scene.js";
import { Vector } from "./vector.js";
export declare class MovingCircle extends MovingObject {
    readonly radius: number;
    constructor(mass: number, x: number, y: number, radius: number);
    wireframe(context: CanvasRenderingContext2D): void;
    predict(other: SceneObject): Contact;
    predictMovingCircle(other: MovingCircle): Contact;
    predictFixedGate(other: FixedGate): Contact;
    repel(other: SceneObject): void;
    repelMovingCircle(other: MovingCircle): void;
    repelFixedGate(other: FixedGate): void;
}
export declare class FixedGate implements SceneObject {
    readonly p0: Readonly<Vector>;
    readonly p1: Readonly<Vector>;
    constructor(p0: Readonly<Vector>, p1: Readonly<Vector>);
    wireframe(context: CanvasRenderingContext2D): void;
}
