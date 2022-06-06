import { Contact } from "./contact.js";
import { MovingObject } from "./objects.js";
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
    add(object: MovingObject | SceneObject): void;
    solve(remaining: number): void;
    compile(): void;
    predictContact(): Contact;
    advance(time: number): void;
    forces(time: number): void;
    wireframe(context: CanvasRenderingContext2D): void;
}
