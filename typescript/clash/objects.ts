import {TAU} from "../lib/math.js"
import {Contact} from "./contact.js"
import {FixedCircleFormat, FixedLineFormat, FixedPointFormat, MovingCircleFormat, SceneObjectFormat} from "./format.js"
import {SceneObject} from "./scene.js"
import {Vector} from "./vector.js"

export const decode = (format: SceneObjectFormat): SceneObject => {
    switch (format.class) {
        case 'moving-circle':
            return new MovingCircle(format.mass, format.px, format.py, format.radius).setVelocity(format.vx, format.vy)
        case 'fixed-point':
            return new FixedPoint(new Vector(format.x, format.y))
        case 'fixed-circle':
            return new FixedCircle(new Vector(format.x, format.y), format.radius, format.outline, new CircleSegment(format.segment[0], format.segment[1]))
        case 'fixed-line':
            return new FixedLine(new Vector(format.x0, format.y0), new Vector(format.x1, format.y1), format.gate)
    }
    throw new Error(`Unknown format: ${format}`)
}

export abstract class MovingObject extends SceneObject {
    readonly inverseMass: number = this.mass === Number.POSITIVE_INFINITY ? 0.0 : 1.0 / this.mass
    readonly position: Vector // center of mass
    readonly velocity: Vector
    readonly force: Vector

    protected constructor(readonly mass: number, x: number = 0.0, y: number = 0.0) {
        super()

        this.position = new Vector(x, y)
        this.velocity = new Vector(0.0, 0.0)
        this.force = new Vector(0.0, 0.0)
    }

    setVelocity(x: number, y: number): this {
        this.velocity.x = x
        this.velocity.y = y
        return this
    }

    applyForces(): void {
        const gravity = 0.0//1

        this.force.zero()
        if (this.mass !== Number.POSITIVE_INFINITY) {
            this.force.y += gravity * this.mass
        }
    }

    integrate(time: number): void {
        this.position.addScaled(this.velocity, time)
        this.velocity.addScaled(this.force, time * this.inverseMass)
        // this.velocity.scale(Math.pow(0.995, time))
    }

    abstract wireframe(context: CanvasRenderingContext2D): void

    abstract proximateMovingCircle(nearest: Contact, other: MovingCircle): NonNullable<Contact>

    abstract repelMovingCircle(circle: MovingCircle): void
}

export class MovingCircle extends MovingObject {
    constructor(mass: number, x: number, y: number, readonly radius: number) {
        super(mass, x, y)
    }

    wireframe(context: CanvasRenderingContext2D): void {
        context.moveTo(this.position.x + this.radius, this.position.y)
        context.arc(this.position.x, this.position.y, this.radius, 0.0, TAU)
    }

    proximateMovingCircle(nearest: Contact, other: MovingCircle): NonNullable<Contact> {
        const vx = other.velocity.x - this.velocity.x
        const vy = other.velocity.y - this.velocity.y
        const vs = vx * vx + vy * vy
        const ex = this.position.x - other.position.x
        const ey = this.position.y - other.position.y
        const ev = ex * vy - ey * vx
        const rr = this.radius + other.radius
        const sq = vs * rr * rr - ev * ev
        if (sq < 0.0) return nearest
        const when = -(Math.sqrt(sq) - ey * vy - ex * vx) / vs
        return Contact.compare(nearest, when, this, other)
    }

    repelMovingCircle(other: MovingCircle): void {
        const distance = this.radius + other.radius
        const nx = (this.position.x - other.position.x) / distance
        const ny = (this.position.y - other.position.y) / distance
        const e = 2.0 * ((this.velocity.x - other.velocity.x) * nx + (this.velocity.y - other.velocity.y) * ny)
            / (this.inverseMass + other.inverseMass)
        const ex = nx * e
        const ey = ny * e
        this.velocity.x -= ex * this.inverseMass
        this.velocity.y -= ey * this.inverseMass
        other.velocity.x += ex * other.inverseMass
        other.velocity.y += ey * other.inverseMass
    }

    serialize(): MovingCircleFormat {
        return {
            class: "moving-circle",
            mass: this.mass,
            px: this.position.x,
            py: this.position.y,
            vx: this.velocity.x,
            vy: this.velocity.y,
            radius: this.radius
        }
    }
}

export class FixedPoint extends SceneObject {
    constructor(readonly point: Readonly<Vector>) {
        super()
    }

    wireframe(context: CanvasRenderingContext2D): void {
        const radius: number = 3.0
        context.moveTo(this.point.x - radius, this.point.y - radius)
        context.lineTo(this.point.x + radius, this.point.y + radius)
        context.moveTo(this.point.x + radius, this.point.y - radius)
        context.lineTo(this.point.x - radius, this.point.y + radius)
    }

    proximateMovingCircle(nearest: Contact, circle: MovingCircle): NonNullable<Contact> {
        const dx = this.point.x - circle.position.x
        const dy = this.point.y - circle.position.y
        const vx = circle.velocity.x
        const vy = circle.velocity.y
        const vs = vx * vx + vy * vy
        const ev = dx * vy - dy * vx
        const sq = vs * circle.radius * circle.radius - ev * ev
        if (sq < 0.0) return nearest
        return Contact.compare(nearest, -(Math.sqrt(sq) - dy * vy - dx * vx) / vs, circle, this)
    }

    repelMovingCircle(circle: MovingCircle): void {
        const nx = (circle.position.x - this.point.x) / circle.radius
        const ny = (circle.position.y - this.point.y) / circle.radius
        const e = 2.0 * (nx * circle.velocity.x + ny * circle.velocity.y)
        circle.velocity.x -= nx * e
        circle.velocity.y -= ny * e
    }

    serialize(): FixedPointFormat {
        return {
            class: "fixed-point",
            x: this.point.x,
            y: this.point.y
        }
    }
}

export enum Outline {
    Both = 'both', Positive = 'positive', Negative = 'negative'
}

export class CircleSegment {
    static Full = new CircleSegment(0.0, TAU)

    constructor(readonly angleMin: number, readonly angleRange: number) {
        console.assert(0.0 <= angleMin && angleMin < TAU && 0.0 < angleRange && angleRange <= TAU)
    }
}

export class FixedCircle extends SceneObject {
    constructor(readonly point: Readonly<Vector>,
                readonly radius: number,
                readonly outline = Outline.Both,
                readonly segment: CircleSegment = CircleSegment.Full) {
        super()
    }

    wireframe(context: CanvasRenderingContext2D): void {
        if (this.segment === CircleSegment.Full) {
            context.moveTo(this.point.x + this.radius, this.point.y)
            context.arc(this.point.x, this.point.y, this.radius, 0.0, TAU)
        } else {
            context.moveTo(this.point.x + Math.cos(this.segment.angleMin) * this.radius, this.point.y + Math.sin(this.segment.angleMin) * this.radius)
            context.arc(this.point.x, this.point.y, this.radius, this.segment.angleMin, this.segment.angleMin + this.segment.angleRange)
        }
    }

    proximateMovingCircle(nearest: Contact, circle: MovingCircle): NonNullable<Contact> {
        switch (this.outline) {
            case Outline.Both:
                return Contact.proximate(
                    this.proximateMovingCircleSigned(nearest, circle, 1),
                    this.proximateMovingCircleSigned(nearest, circle, -1))
            case Outline.Positive:
                return this.proximateMovingCircleSigned(nearest, circle, 1)
            case Outline.Negative:
                return this.proximateMovingCircleSigned(nearest, circle, -1)
            default:
                throw new Error('unknown type')
        }
    }

    proximateMovingCircleSigned(nearest: Contact, circle: MovingCircle, sign: number): NonNullable<Contact> {
        const dx = this.point.x - circle.position.x
        const dy = this.point.y - circle.position.y
        const rr = circle.radius + this.radius * sign
        const vx = circle.velocity.x
        const vy = circle.velocity.y
        const vs = vx * vx + vy * vy
        const ev = dx * vy - dy * vx
        const sq = vs * rr * rr - ev * ev
        if (sq < 0.0) return nearest
        const when = (-Math.sqrt(sq) * sign + dy * vy + dx * vx) / vs
        if (this.segment === CircleSegment.Full) {
            return Contact.compare(nearest, when, circle, this)
        }
        const px = circle.position.x + circle.velocity.x * when - this.point.x
        const py = circle.position.y + circle.velocity.y * when - this.point.y
        let angle = Math.atan2(py, px) - this.segment.angleMin
        while (angle < 0.0) angle += TAU
        if (angle >= this.segment.angleRange) {
            return nearest
        }
        return Contact.compare(nearest, when, circle, this)
    }

    repelMovingCircle(circle: MovingCircle): void {
        const dx = circle.position.x - this.point.x
        const dy = circle.position.y - this.point.y
        const dd = Math.sqrt(dx * dx + dy * dy)
        const nx = dx / dd
        const ny = dy / dd
        const e = 2.0 * (nx * circle.velocity.x + ny * circle.velocity.y)
        circle.velocity.x -= nx * e
        circle.velocity.y -= ny * e
    }

    serialize(): FixedCircleFormat {
        return {
            class: "fixed-circle",
            x: this.point.x,
            y: this.point.y,
            radius: this.radius,
            outline: this.outline,
            segment: [this.segment.angleMin, this.segment.angleRange]
        }
    }
}

export class FixedLine extends SceneObject {
    constructor(readonly p0: Readonly<Vector>,
                readonly p1: Readonly<Vector>,
                readonly gate: boolean = false) {
        super()
    }

    wireframe(context: CanvasRenderingContext2D): void {
        context.moveTo(this.p0.x, this.p0.y)
        context.lineTo(this.p1.x, this.p1.y)
        if (this.gate) {
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

    proximateMovingCircle(nearest: Contact, circle: MovingCircle): NonNullable<Contact> {
        const dx = this.p1.x - this.p0.x
        const dy = this.p1.y - this.p0.y
        const ud = circle.velocity.y * dx - circle.velocity.x * dy
        if (this.gate && ud <= 0) return nearest
        const dd = Math.sqrt(dx * dx + dy * dy) * Math.sign(ud)
        const px = (circle.position.x - this.p0.x) - dy / dd * circle.radius
        const py = (circle.position.y - this.p0.y) + dx / dd * circle.radius
        const ua = (circle.velocity.y * px - circle.velocity.x * py) / ud
        if (ua < 0.0 || ua > 1.0) return nearest
        return Contact.compare(nearest, (dy * px - dx * py) / ud, circle, this)
    }

    repelMovingCircle(circle: MovingCircle): void {
        const dx = this.p1.x - this.p0.x
        const dy = this.p1.y - this.p0.y
        const dd = Math.sqrt(dx * dx + dy * dy)
        const nx = dy / dd
        const ny = -dx / dd
        const e = 2.0 * (nx * circle.velocity.x + ny * circle.velocity.y)
        circle.velocity.x -= nx * e
        circle.velocity.y -= ny * e
    }

    serialize(): FixedLineFormat {
        return {
            class: "fixed-line",
            x0: this.p0.x,
            y0: this.p0.y,
            x1: this.p1.x,
            y1: this.p1.y,
            gate: this.gate
        }
    }
}