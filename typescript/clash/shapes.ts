import {TAU} from "../lib/math.js"
import {Contact} from "./contact.js"
import {MovingObject, Shape} from "./objects.js"
import {SceneObject} from "./scene.js"
import {Vector} from "./vector.js"

export class Circle extends Shape {
    constructor(mass: number, readonly radius: number) {
        super(mass)
    }

    wireframe(object: MovingObject<Circle>, context: CanvasRenderingContext2D): void {
        context.moveTo(object.position.x + this.radius, object.position.y)
        context.arc(object.position.x, object.position.y, this.radius, 0.0, TAU)
    }

    predict(object: MovingObject<Circle>, other: SceneObject): Contact {
        if (other instanceof MovingObject) {
            if (other.shape instanceof Circle) {
                return this.predictMovingCircle(object, other)
            }
        }
        if (other instanceof FixedGate) {
            return this.predictFixedGate(object, other)
        }
        throw new Error(`No strategy for predicting ${other.constructor.name}`)
    }

    predictMovingCircle(object: MovingObject<Circle>, other: MovingObject<Circle>): Contact {
        const vx = other.velocity.x - object.velocity.x
        const vy = other.velocity.y - object.velocity.y
        const vs = vx * vx + vy * vy
        if (vs == 0.0) return Contact.None
        const ex = object.position.x - other.position.x
        const ey = object.position.y - other.position.y
        const ev = ex * vy - ey * vx
        const rr = this.radius + other.shape.radius
        const sq = vs * rr * rr - ev * ev
        if (sq < 0.0) return Contact.None
        const when = -(Math.sqrt(sq) - ey * vy - ex * vx) / vs
        return Contact.threshold(when, object, other)
    }

    predictFixedGate(object: MovingObject<Circle>, other: FixedGate): Contact {
        const dx = other.p1.x - other.p0.x
        const dy = other.p1.y - other.p0.y
        const ud = object.velocity.y * dx - object.velocity.x * dy
        if (ud <= 0) return Contact.None // only one direction
        const dd = Math.sqrt(dx * dx + dy * dy)
        const px = (object.position.x - other.p0.x) - dy / dd * this.radius
        const py = (object.position.y - other.p0.y) + dx / dd * this.radius
        const ua = (object.velocity.y * px - object.velocity.x * py)
        if (ua < 0.0 || ua > ud) return Contact.None
        const when = (dy * px - dx * py) / ud
        return Contact.threshold(when, object, other)
    }

    repel(object: MovingObject<Circle>, other: SceneObject): void {
        if (other instanceof MovingObject) {
            this.repelMovingCircle(object, other)
        } else if (other instanceof FixedGate) {
            this.repelFixedGate(object, other)
        } else {
            throw new Error(`No strategy for repelling ${other.constructor.name}`)
        }
    }

    repelMovingCircle(object: MovingObject<Circle>, other: MovingObject<Circle>): void {
        const distance = this.radius + other.shape.radius
        const nx = (object.position.x - other.position.x) / distance
        const ny = (object.position.y - other.position.y) / distance
        const e = -2.0 * ((other.velocity.x - object.velocity.x) * nx + (other.velocity.y - object.velocity.y) * ny) / (this.inverseMass + other.shape.inverseMass)
        object.velocity.x -= e * nx * this.inverseMass
        object.velocity.y -= e * ny * this.inverseMass
        other.velocity.x += e * nx * other.shape.inverseMass
        other.velocity.y += e * ny * other.shape.inverseMass
    }

    repelFixedGate(object: MovingObject<Circle>, other: FixedGate): void {
        const dx = other.p1.x - other.p0.x
        const dy = other.p1.y - other.p0.y
        const dd = Math.sqrt(dx * dx + dy * dy)
        const nx = dy / dd
        const ny = -dx / dd
        const e = 2.0 * (nx * object.velocity.x + ny * object.velocity.y)
        object.velocity.x -= nx * e
        object.velocity.y -= ny * e
    }
}

export class FixedGate implements SceneObject {
    constructor(readonly p0: Readonly<Vector>, readonly p1: Readonly<Vector>) {
    }

    wireframe(context: CanvasRenderingContext2D): void {
        context.moveTo(this.p0.x, this.p0.y)
        context.lineTo(this.p1.x, this.p1.y)
        const dx = this.p1.x - this.p0.x
        const dy = this.p1.y - this.p0.y
        const dd = Math.sqrt(dx * dx + dy * dy)
        const cx = this.p0.x + dx * 0.5
        const cy = this.p0.y + dy * 0.5
        const nx = dy / dd
        const ny = -dx / dd
        const tn = 8
        context.moveTo(cx - ny * tn, cy + nx * tn)
        context.lineTo(cx + nx * tn, cy + ny * tn)
        context.lineTo(cx + ny * tn, cy - nx * tn)
    }
}