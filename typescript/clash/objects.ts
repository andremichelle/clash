import {TAU} from "../lib/math.js"
import {MovingObject, Scene, SceneObject} from "./scene.js"
import {Touch} from "./touch.js"
import {Vector} from "./vector.js"

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

    predictTouch(scene: Scene): Touch | null {
        return scene.getTouchables()
            .reduce<Touch>((prev: Touch | null, other: SceneObject) =>
                this === other ? prev : Touch.closer(prev, this.predict(other)), null)
    }

    wireframe(context: CanvasRenderingContext2D): void {
        context.beginPath()
        context.arc(this.position.x, this.position.y, this.radius, 0.0, TAU)
        context.stroke()
    }

    predict(other: SceneObject): Touch | null {
        if (other instanceof MovingCircle && !this.predicted.has(other) && !other.predicted.has(this)) {
            return this.predictMovingCircle(other)
        }
        return null
    }

    predictMovingCircle(other: MovingCircle): Touch | null {
        const vx = other.velocity.x - this.velocity.x
        const vy = other.velocity.y - this.velocity.y
        const vs = vx * vx + vy * vy
        if (vs == 0.0) return null
        const ex = this.position.x - other.position.x
        const ey = this.position.y - other.position.y
        const ev = ex * vy - ey * vx
        const rr = this.radius + other.radius
        const sq = vs * rr * rr - ev * ev
        if (sq < 0.0) return null
        this.predicted.add(other)
        other.predicted.add(this)
        const when = -(Math.sqrt(sq) - ey * vy - ex * vx) / vs
        return when > 0.0 ? new Touch(when, this, other) : null
    }

    repel(other: SceneObject): void {
        if (other instanceof MovingCircle) {
            this.repelMovingCircle(other)
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
}