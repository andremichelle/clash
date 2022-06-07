import { Contact } from "./contact.js";
import { Vector } from "./vector.js";
export interface SceneObject {
    wireframe(context: CanvasRenderingContext2D): void;
}
export declare class Scene {
    private readonly fixedObjects;
    private readonly movingObjects;
    private readonly testPairs;
    private needsCompile;
    running: boolean;
    frame(xMin: number, yMin: number, xMax: number, yMax: number): Vector[];
    add(...objects: SceneObject[]): void;
    solve(remaining: number): void;
    compile(): void;
    nextContact(): Contact;
    advance(time: number): void;
    wireframe(context: CanvasRenderingContext2D): void;
    numTests: () => number;
    numObjects: () => number;
    totalEnergy: () => number;
}
