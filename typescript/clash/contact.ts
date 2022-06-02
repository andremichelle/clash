import {MovingObject, SceneObject} from "./scene.js"

export class Contact {
    static None = new Contact(Number.MAX_VALUE, null, null)

    static proximate(current: Contact, other: Contact): Contact {
        return other === Contact.None
            ? current : current === Contact.None
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