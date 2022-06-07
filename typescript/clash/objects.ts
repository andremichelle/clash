import {TAU} from "../lib/math.js"
import {Contact} from "./contact.js"
import {SceneObject} from "./scene.js"
import {Vector} from "./vector.js"

export abstract class MovingObject {
    readonly inverseMass: number = this.mass === Number.POSITIVE_INFINITY ? 0.0 : 1.0 / this.mass
    readonly position: Vector // center of mass
    readonly velocity: Vector
    readonly force: Vector

    protected constructor(readonly mass: number, x: number = 0.0, y: number = 0.0) {
        this.position = new Vector(x, y)
        this.velocity = new Vector(0.0, 0.0)
        this.force = new Vector(0.0, 0.0)
    }

    applyForces(): void {
        const gravity = 0.002

        this.force.zero()
        if (this.mass !== Number.POSITIVE_INFINITY) {
            this.force.y += gravity * this.mass
        }
    }

    integrate(time: number): void {
        this.position.addScaled(this.velocity, time)
        this.velocity.addScaled(this.force, time * this.inverseMass)
        this.velocity.scale(Math.pow(0.997, time))
    }

    abstract wireframe(context: CanvasRenderingContext2D): void

    abstract predict(other: SceneObject): NonNullable<Contact>

    abstract repel(other: SceneObject): void
}

export class MovingCircle extends MovingObject {
    constructor(mass: number, x: number, y: number, readonly radius: number) {
        super(mass, x, y)
    }

    wireframe(context: CanvasRenderingContext2D): void {
        context.moveTo(this.position.x + this.radius, this.position.y)
        context.arc(this.position.x, this.position.y, this.radius, 0.0, TAU)
    }

    predict(other: SceneObject): NonNullable<Contact> {
        if (other instanceof MovingCircle) {
            return this.predictMovingCircle(other)
        } else if (other instanceof FixedPoint) {
            return this.predictFixedPoint(other)
        } else if (other instanceof FixedGate) {
            return this.predictFixedGate(other)
        }
        throw new Error(`No strategy for predicting ${other.constructor.name}`)
    }

    predictMovingCircle(other: MovingCircle): NonNullable<Contact> {
        const vx = other.velocity.x - this.velocity.x
        const vy = other.velocity.y - this.velocity.y
        const vs = vx * vx + vy * vy
        if (vs == 0.0) return Contact.Never
        const ex = this.position.x - other.position.x
        const ey = this.position.y - other.position.y
        const ev = ex * vy - ey * vx
        const rr = this.radius + other.radius
        const sq = vs * rr * rr - ev * ev
        if (sq < 0.0) return Contact.Never
        const when = -(Math.sqrt(sq) - ey * vy - ex * vx) / vs
        return Contact.create(when, this, other)
    }

    predictFixedPoint(other: FixedPoint): NonNullable<Contact> {
        const dx = other.point.x - this.position.x
        const dy = other.point.y - this.position.y
        const vx = this.velocity.x
        const vy = this.velocity.y
        const vs = vx * vx + vy * vy
        const ev = dx * vy - dy * vx
        const sq = vs * this.radius * this.radius - ev * ev
        if (sq < 0.0) return Contact.Never
        const when = -(Math.sqrt(sq) - dy * vy - dx * vx) / vs
        return Contact.create(when, this, other)
    }

    predictFixedGate(other: FixedGate): NonNullable<Contact> {
        const dx = other.p1.x - other.p0.x
        const dy = other.p1.y - other.p0.y
        const ud = this.velocity.y * dx - this.velocity.x * dy
        if (ud <= 0) return Contact.Never // only one direction
        const dd = Math.sqrt(dx * dx + dy * dy)
        const px = (this.position.x - other.p0.x) - dy / dd * this.radius
        const py = (this.position.y - other.p0.y) + dx / dd * this.radius
        const ua = (this.velocity.y * px - this.velocity.x * py)
        if (ua < 0.0 || ua > ud) return Contact.Never
        const when = (dy * px - dx * py) / ud
        return Contact.create(when, this, other)
    }

    repel(other: SceneObject): void {
        if (other instanceof MovingCircle) {
            this.repelMovingCircle(other)
        } else if (other instanceof FixedPoint) {
            this.repelFixedPoint(other)
        } else if (other instanceof FixedGate) {
            this.repelFixedGate(other)
        } else {
            throw new Error(`No strategy for repelling ${other.constructor.name}`)
        }
    }

    repelMovingCircle(other: MovingCircle): void {
        const distance = this.radius + other.radius
        const nx = (this.position.x - other.position.x) / distance
        const ny = (this.position.y - other.position.y) / distance
        const e = 2.0 * ((this.velocity.x - other.velocity.x) * nx + (this.velocity.y - other.velocity.y) * ny) / (this.inverseMass + other.inverseMass)
        const ex = nx * e
        const ey = ny * e
        this.velocity.x -= ex * this.inverseMass
        this.velocity.y -= ey * this.inverseMass
        other.velocity.x += ex * other.inverseMass
        other.velocity.y += ey * other.inverseMass
    }

    repelFixedPoint(other: FixedPoint): void {
        const nx = (this.position.x - other.point.x) / this.radius
        const ny = (this.position.y - other.point.y) / this.radius
        const e = 2.0 * (nx * this.velocity.x + ny * this.velocity.y)
        this.velocity.x -= nx * e
        this.velocity.y -= ny * e
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

export class FixedPoint implements SceneObject {
    constructor(readonly point: Readonly<Vector>) {
    }

    wireframe(context: CanvasRenderingContext2D): void {
        const radius: number = 3.0
        context.moveTo(this.point.x - radius, this.point.y - radius)
        context.lineTo(this.point.x + radius, this.point.y + radius)
        context.moveTo(this.point.x + radius, this.point.y - radius)
        context.lineTo(this.point.x - radius, this.point.y + radius)
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