import {Contact} from "./contact.js"
import {FixedGate, MovingObject} from "./objects.js"
import {SceneObject} from "./scene.js"

export interface Shape {
    predict(other: SceneObject): Contact
}

export class Circle implements Shape {
    constructor(readonly object: MovingObject) {
    }

    predict(other: SceneObject): Contact {
        if (other instanceof MovingObject) {
            if (other.shape instanceof Circle) {
                return this.predictMovingCircle(other)
            }
        }
        if (other instanceof FixedGate) {
            return this.predictFixedGate(other)
        }
        throw new Error(`No strategy for predicting ${other.constructor.name}`)
    }

    predictMovingCircle(other: MovingObject): Contact {
        const vx = other.velocity.x - this.object.velocity.x
        const vy = other.velocity.y - this.object.velocity.y
        const vs = vx * vx + vy * vy
        if (vs == 0.0) return Contact.None
        const ex = this.object.position.x - other.position.x
        const ey = this.object.position.y - other.position.y
        const ev = ex * vy - ey * vx
        const rr = this.object.radius + other.radius
        const sq = vs * rr * rr - ev * ev
        if (sq < 0.0) return Contact.None
        const when = -(Math.sqrt(sq) - ey * vy - ex * vx) / vs
        return this.object.toContact(when, other)
    }

    predictFixedGate(other: FixedGate): Contact {
        const vx = this.object.velocity.x
        const vy = this.object.velocity.y
        const dx = other.p1.x - other.p0.x
        const dy = other.p1.y - other.p0.y
        const dd = Math.sqrt(dx * dx + dy * dy)
        const ud = vy * dx - vx * dy
        if (ud <= 0) return Contact.None // only one collision direction
        const px = (this.object.position.x - other.p0.x) - dy / dd * this.object.radius
        const py = (this.object.position.y - other.p0.y) + dx / dd * this.object.radius
        const ua = (vy * px - vx * py) / ud
        if (ua < 0.0 || ua > 1.0) return Contact.None
        const when = (dy * px - dx * py) / ud
        return this.object.toContact(when, other)
    }
}