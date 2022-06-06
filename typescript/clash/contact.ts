import {MovingObject} from "./objects.js"
import {SceneObject} from "./scene.js"

export class Contact {
    static readonly MIN_TIME_THRESHOLD = -.015625 // fixing tiny overshoots

    static None = new Contact(Number.POSITIVE_INFINITY, null, null)

    static threshold(when: number, object: MovingObject<any>, other: SceneObject) {
        return when > Contact.MIN_TIME_THRESHOLD ? new Contact(when, object, other) : Contact.None
    }

    static proximate(current: Contact, other: Contact): Contact {
        return other === Contact.None
            ? current : current === Contact.None
                ? other : other.when < current.when
                    ? other : current
    }

    constructor(readonly when: number,
                readonly moving: MovingObject<any>,
                readonly other: SceneObject) {
    }

    repel(): void {
        this!.moving.repel(this!.other)
    }
}