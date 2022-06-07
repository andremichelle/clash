import { SceneObject } from "./scene.js";
import { Vector } from "./vector.js";
export declare class FixedPolygonBuilder {
    private readonly points;
    private closed;
    constructor();
    addVector(v: Vector): this;
    addCoordinate(x: number, y: number): this;
    close(): this;
    build(): FixedPolygon;
}
export declare class FixedPolygon {
    readonly objects: SceneObject[];
    constructor(objects: SceneObject[]);
}
