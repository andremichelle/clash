import {MovingObject, SceneObject} from "./scene.js"

export class Touch {
    static closer(current: Touch, other: Touch): Touch | null {
        return other === null ? current : current === null ? other : other.when < current.when ? other : current
    }

    constructor(readonly when: number,
                readonly moving: MovingObject,
                readonly other: SceneObject) {
    }

    repel() {
        this.moving.repel(this.other)
    }
}