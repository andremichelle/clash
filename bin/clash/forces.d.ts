import { MovingObject } from "./objects.js";
export interface ForceGenerator {
    applyForces(object: MovingObject, time: number): void;
}
export declare class Spring implements ForceGenerator {
    readonly other: MovingObject;
    readonly k: number;
    readonly l: number;
    constructor(other: MovingObject, k: number, l: number);
    applyForces(object: MovingObject, time: number): void;
}
