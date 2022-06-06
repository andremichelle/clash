import {Contact} from "./contact.js"
import {SceneObject} from "./scene.js"
import {Vector} from "./vector.js"

export abstract class MovingObject {
    readonly inverseMass: number = this.mass === Number.POSITIVE_INFINITY ? 0.0 : 1.0 / this.mass
    readonly position: Vector // center of mass
    readonly velocity: Vector
    readonly acceleration: Vector
    readonly forces: Vector = new Vector(0.0, 0.0)

    touched: boolean = true

    protected constructor(readonly mass: number, x: number = 0.0, y: number = 0.0) {
        this.position = new Vector(x, y)
        this.velocity = new Vector()
        this.acceleration = new Vector()
    }

    move(time: number): void {
        this.velocity.addScaled(this.forces, time * this.inverseMass)
        this.position.addScaled(this.velocity, time)
        this.touched = false
    }

    applyForces(time: number): void {
    }

    abstract wireframe(context: CanvasRenderingContext2D): void

    abstract predict(other: SceneObject): Contact

    abstract repel(other: SceneObject): void
}