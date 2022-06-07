import { Contact } from "./contact.js";
import { Vector } from "./vector.js";
export interface SceneObject {
    wireframe(context: CanvasRenderingContext2D): void;
}
export declare class Scene {
    private static readonly REMAINING_THRESHOLD;
    private static readonly MAX_ITERATIONS;
    private readonly fixedObjects;
    private readonly movingObjects;
    private readonly testPairs;
    private needsCompile;
    running: boolean;
    frame(xMin: number, yMin: number, xMax: number, yMax: number): Vector[];
    add(...objects: SceneObject[]): void;
    addAll(composite: {
        objects: SceneObject[];
    }): void;
    step(remaining: number): void;
    compile(): void;
    nextContact(): Contact;
    applyForces(): void;
    integrate(time: number): void;
    wireframe(context: CanvasRenderingContext2D): void;
    numTests: () => number;
    numObjects: () => number;
    totalEnergy: () => number;
}
