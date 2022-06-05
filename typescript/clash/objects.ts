import {TAU} from "../lib/math.js"
import {Contact} from "./contact.js"
import {FixedObject, Scene, SceneObject} from "./scene.js"
import {Circle, Shape} from "./shapes.js"
import {Vector} from "./vector.js"

// https://martinheinz.dev/blog/15
// https://gamedevelopment.tutsplus.com/tutorials/how-to-create-a-custom-2d-physics-engine-the-core-engine--gamedev-7493

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

export class MovingObject {
    static MIN_THRESHOLD = -.015625

    readonly position: Vector // center of mass
    readonly velocity: Vector
    readonly acceleration: Vector
    readonly forces: Vector = new Vector(0.0, 0.0)
    readonly predicted: Set<MovingObject> = new Set<MovingObject>()
    readonly inverseMass: number = this.mass === Number.POSITIVE_INFINITY ? 0.0 : 1.0 / this.mass
    readonly shape: Shape = new Circle(this)

    constructor(readonly mass: number, readonly radius: number, x: number = 0.0, y: number = 0.0) {
        this.position = new Vector(x, y)
        this.velocity = new Vector()
        this.acceleration = new Vector()
    }

    move(time: number): void {
        this.velocity.addScaled(this.forces, time * this.inverseMass)
        this.position.addScaled(this.velocity, time)
        this.predicted.clear()
    }

    applyForces(time: number): void {
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
        if (other instanceof MovingObject) {
            if (other.predicted.has(this)) {
                return Contact.None
            }
            this.predicted.add(other)
        }
        return this.shape.predict(other)
    }

    repel(other: SceneObject): void {
        if (other instanceof MovingObject) {
            this.repelMovingCircle(other)
        } else if (other instanceof FixedGate) {
            this.repelFixedGate(other)
        } else {
            throw new Error(`No strategy for repelling ${other.constructor.name}`)
        }
    }

    repelMovingCircle(other: MovingObject): void {
        const distance = this.radius + other.radius
        const nx = (this.position.x - other.position.x) / distance
        const ny = (this.position.y - other.position.y) / distance
        const e = -2.0 * ((other.velocity.x - this.velocity.x) * nx + (other.velocity.y - this.velocity.y) * ny) / (this.inverseMass + other.inverseMass)
        this.velocity.x -= e * nx * this.inverseMass
        this.velocity.y -= e * ny * this.inverseMass
        other.velocity.x += e * nx * other.inverseMass
        other.velocity.y += e * ny * other.inverseMass
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

    toContact(when: number, other: SceneObject) {
        return when > MovingObject.MIN_THRESHOLD ? new Contact(when, this, other) : Contact.None
    }
}