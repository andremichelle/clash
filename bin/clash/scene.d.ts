import { Contact } from "./contact.js";
import { SceneFormat, SceneObjectFormat } from "./format.js";
import { MovingCircle, MovingObject } from "./objects.js";
import { Vector } from "./vector.js";
export declare abstract class SceneObject {
    proximate(nearest: Contact, object: MovingObject): NonNullable<Contact>;
    repelMovingObject(object: MovingObject): void;
    abstract serialize(): SceneObjectFormat;
    abstract wireframe(context: CanvasRenderingContext2D): void;
    abstract proximateMovingCircle(nearest: Contact, circle: MovingCircle): NonNullable<Contact>;
    abstract repelMovingCircle(circle: MovingCircle): void;
}
export declare class Scene {
    private static readonly REMAINING_THRESHOLD;
    private static readonly MAX_ITERATIONS;
    private readonly fixedObjects;
    private readonly movingObjects;
    private readonly testPairs;
    private needsCompile;
    private maxIterations;
    running: boolean;
    frame(xMin: number, yMin: number, xMax: number, yMax: number): Vector[];
    add(...objects: SceneObject[]): void;
    addComposite(composite: {
        objects: SceneObject[];
    }): void;
    step(remaining: number): void;
    compile(): void;
    nextContact(contact: Contact): Contact;
    applyForces(): void;
    integrate(time: number): void;
    wireframe(context: CanvasRenderingContext2D): void;
    serialize(): SceneFormat;
    numTests: () => number;
    numObjects: () => number;
    getResetMaxIterations: () => number;
    kineticEnergy: () => number;
}
