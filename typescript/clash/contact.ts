import {SceneObject} from "./scene.js"
import {MovingObject} from "./objects.js"

export class Contact {
    static readonly MIN_TIME_THRESHOLD = -.015625 // fixing tiny overshoots

    static Never = new Contact(Number.POSITIVE_INFINITY, null, null)

    static threshold(when: number, object: MovingObject, other: SceneObject) {
        return when > Contact.MIN_TIME_THRESHOLD ? new Contact(when, object, other) : Contact.Never
    }

    static proximate(current: Contact, other: Contact): Contact {
        return other === Contact.Never
            ? current : current === Contact.Never
                ? other : other.when < current.when
                    ? other : current
    }

    constructor(readonly when: number,
                readonly moving: MovingObject,
                readonly other: SceneObject) {
    }

    repel(): void {
        this!.moving.repel(this!.other)
    }
}