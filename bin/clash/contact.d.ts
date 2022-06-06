import { SceneObject } from "./scene.js";
import { MovingObject } from "./objects.js";
export declare class Contact {
    readonly when: number;
    readonly moving: MovingObject;
    readonly other: SceneObject;
    static readonly MIN_TIME_THRESHOLD = -0.015625;
    static Never: Contact;
    static threshold(when: number, object: MovingObject, other: SceneObject): Contact;
    static proximate(current: Contact, other: Contact): Contact;
    constructor(when: number, moving: MovingObject, other: SceneObject);
    repel(): void;
}
