import {MovingObject} from "./objects.js"
import {SceneObject} from "./scene.js"

export class Contact {
    static readonly MIN_TIME_THRESHOLD = -.015625 // fixing tiny overshoots

    static Never = new Contact(Number.POSITIVE_INFINITY, null, null)

    static create(when: number, object: MovingObject, other: SceneObject) {
        return when >= Contact.MIN_TIME_THRESHOLD ? new Contact(when, object, other) : Contact.Never
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
        this!.other.repelMovingObject(this!.moving)
    }
}