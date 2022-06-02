import {TAU} from "../lib/math.js"
import {Contact} from "./contact.js"
import {FixedObject, MovingObject, Scene, SceneObject} from "./scene.js"
import {Vector} from "./vector.js"

export class FixedGate implements FixedObject {
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

export class MovingCircle implements MovingObject {
    readonly position: Vector
    readonly velocity: Vector
    readonly predicted: Set<MovingObject> = new Set<MovingObject>()

    constructor(readonly radius: number, x: number = 0.0, y: number = 0.0) {
        this.position = new Vector(x, y)
        this.velocity = new Vector()
    }

    move(time: number): void {
        this.position.addPartly(this.velocity, time)
        this.predicted.clear()
    }

    predictContact(scene: Scene): Contact {
        return scene.interactiveObjects
            .reduce<Contact>((nearest: Contact, other: SceneObject) =>
                this === other ? nearest : Contact.proximate(nearest, this.predict(other)), Contact.None)
    }

    wireframe(context: CanvasRenderingContext2D): void {
        context.moveTo(this.position.x + this.radius, this.position.y)
        context.arc(this.position.x, this.position.y, this.radius, 0.0, TAU)
    }

    predict(other: SceneObject): Contact {
        if (other instanceof MovingCircle) {
            return other.predicted.has(this) ? Contact.None : this.predictMovingCircle(other)
        }
        if (other instanceof FixedGate) {
            return this.predictFixedGate(other)
        }
        throw new Error(`No strategy for predicting ${other.constructor.name}`)
    }

    predictMovingCircle(other: MovingCircle): Contact {
        this.predicted.add(other)
        const vx = other.velocity.x - this.velocity.x
        const vy = other.velocity.y - this.velocity.y
        const vs = vx * vx + vy * vy
        if (vs == 0.0) return Contact.None
        const ex = this.position.x - other.position.x
        const ey = this.position.y - other.position.y
        const ev = ex * vy - ey * vx
        const rr = this.radius + other.radius
        const sq = vs * rr * rr - ev * ev
        if (sq < 0.0) return Contact.None
        const when = -(Math.sqrt(sq) - ey * vy - ex * vx) / vs
        return when > 0.0 ? new Contact(when, this, other) : Contact.None
    }

    predictFixedGate(other: FixedGate): Contact {
        const vx = this.velocity.x
        const vy = this.velocity.y
        const dx = other.p1.x - other.p0.x
        const dy = other.p1.y - other.p0.y
        const dd = Math.sqrt(dx * dx + dy * dy)
        const ud = vy * dx - vx * dy
        if (ud <= 0) return Contact.None // only one collision direction
        const px = this.position.x - other.p0.x - dy / dd * this.radius
        const py = this.position.y - other.p0.y + dx / dd * this.radius
        const ua = (vy * px - vx * py) / ud
        if (ua < 0.0 || ua > 1.0) return Contact.None
        const when = (dy * px - dx * py) / ud
        return when > 0.0 ? new Contact(when, this, other) : Contact.None
    }

    repel(other: SceneObject): void {
        if (other instanceof MovingCircle) {
            this.repelMovingCircle(other)
        } else if (other instanceof FixedGate) {
            this.repelFixedGate(other)
        } else {
            throw new Error(`No strategy for repelling ${other.constructor.name}`)
        }
    }

    repelMovingCircle(other: MovingCircle): void {
        const distance = this.radius + other.radius
        const dx = (this.position.x - other.position.x) / distance
        const dy = (this.position.y - other.position.y) / distance
        const e = (other.velocity.x * dx + other.velocity.y * dy - this.velocity.x * dx - this.velocity.y * dy)
        this.velocity.x += dx * e
        this.velocity.y += dy * e
        other.velocity.x -= dx * e
        other.velocity.y -= dy * e
    }

    repelFixedGate(other: FixedGate): void {
        const dx = other.p1.x - other.p0.x
        const dy = other.p1.y - other.p0.y
        const dd = Math.sqrt(dx * dx + dy * dy)
        const nx = dy / dd
        const ny = -dx / dd
        const e = 2.0 * (nx * this.velocity.x + ny * this.velocity.y)
        this.velocity.x -= nx * e
        this.velocity.y -= ny * e
    }
}