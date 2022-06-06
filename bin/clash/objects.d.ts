import { Contact } from "./contact.js";
import { SceneObject } from "./scene.js";
import { Vector } from "./vector.js";
export declare abstract class MovingObject {
    readonly mass: number;
    readonly inverseMass: number;
    readonly position: Vector;
    readonly velocity: Vector;
    readonly acceleration: Vector;
    readonly forces: Vector;
    touched: boolean;
    protected constructor(mass: number, x?: number, y?: number);
    move(time: number): void;
    applyForces(time: number): void;
    abstract wireframe(context: CanvasRenderingContext2D): void;
    abstract predict(other: SceneObject): Contact;
    abstract repel(other: SceneObject): void;
}
