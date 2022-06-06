import {Contact} from "./contact.js"
import {SceneObject} from "./scene.js"
import {Vector} from "./vector.js"

export class MovingObject<SHAPE extends Shape> {
    readonly position: Vector // center of mass
    readonly velocity: Vector
    readonly acceleration: Vector
    readonly forces: Vector = new Vector(0.0, 0.0)

    constructor(readonly shape: SHAPE, x: number = 0.0, y: number = 0.0) {
        this.position = new Vector(x, y)
        this.velocity = new Vector()
        this.acceleration = new Vector()
    }

    move(time: number): void {
        this.velocity.addScaled(this.forces, time * this.shape.inverseMass)
        this.position.addScaled(this.velocity, time)
    }

    applyForces(time: number): void {
    }

    wireframe(context: CanvasRenderingContext2D): void {
        this.shape.wireframe(this, context)
    }

    predict(other: SceneObject): Contact {
        return this.shape.predict(this, other)
    }

    repel(other: SceneObject): void {
        this.shape.repel(this, other)
    }
}

export abstract class Shape {
    readonly inverseMass: number = this.mass === Number.POSITIVE_INFINITY ? 0.0 : 1.0 / this.mass

    protected constructor(readonly mass: number) {
    }

    abstract wireframe(object: MovingObject<Shape>, context: CanvasRenderingContext2D): void

    abstract predict(object: MovingObject<Shape>, other: SceneObject): Contact

    abstract repel(object: MovingObject<Shape>, other: SceneObject): void
}