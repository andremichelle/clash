import { ObservableValue } from "../lib/common.js";
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
    private static readonly MAX_STEPS;
    private readonly fixedObjects;
    private readonly movingObjects;
    private readonly testPairs;
    readonly gravity: ObservableValue<number>;
    readonly damping: ObservableValue<number>;
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
    computeForces(): void;
    nextContact(contact: Contact): Contact;
    integrate(time: number): void;
    wireframe(context: CanvasRenderingContext2D): void;
    deserialize(format: SceneFormat): void;
    serialize(): SceneFormat;
    numTests: () => number;
    numObjects: () => number;
    getResetMaxSteps: () => number;
    kineticEnergy: () => number;
}
