import {TAU} from "../lib/math.js"

export class Vector {
    constructor(public x: number = 0.0, public y: number = 0.0) {
    }

    add(other: Vector): void {
        this.x += other.x
        this.y += other.y
    }

    addPartly(other: Vector, scale: number): void {
        this.x += other.x * scale
        this.y += other.y * scale
    }
}

export class Scene {
    readonly fixedObjects: FixedObject[] = []
    readonly movingObjects: MovingObject[] = []
    readonly sceneObjects: SceneObject[] = []

    add(object: SceneObject): void {
    }

    solve(time: number): void {
        const touch: Touch | null = this.movingObjects.reduce((prev: Touch | null, object: MovingObject) => {
            const touch = object.predictTouch(this)
            return touch === null ? prev : prev === null ? touch : touch.time < prev.time ? touch : prev
        }, null)
        console.log(`solve(${time}) >`, touch)
    }

    wireframe(context: CanvasRenderingContext2D): void {
        context.strokeStyle = 'orange'
        this.movingObjects.forEach(object => object.wireframe(context))
    }
}

export type SceneObject = FixedObject | MovingObject

export class Touch {
    constructor(readonly time: number,
                readonly moving: MovingObject,
                readonly other: SceneObject) {
    }
}

export interface FixedObject {
}

export interface MovingObject {
    readonly position: Vector
    readonly velocity: Vector

    move(time: number): void

    predictTouch(scene: Scene): Touch | null

    wireframe(context: CanvasRenderingContext2D): void
}

export class MovingCircle implements MovingObject {
    readonly position: Vector
    readonly velocity: Vector

    constructor(readonly radius: number, x: number = 0.0, y: number = 0.0) {
        this.position = new Vector(x, y)
        this.velocity = new Vector()
    }

    move(time: number): void {
        this.position.addPartly(this.velocity, time)
    }

    predictTouch(scene: Scene): Touch | null {
        return [].concat(scene.movingObjects, scene.fixedObjects)
            .reduce<Touch>((prev: Touch | null, other: SceneObject) => {
                if(this === other) return prev
                const touch: Touch | null = this.predict(other)
                return touch === null ? prev : prev === null ? touch : touch.time < prev.time ? touch : prev
            }, null)
    }

    wireframe(context: CanvasRenderingContext2D): void {
        context.beginPath()
        context.arc(this.position.x, this.position.y, this.radius, 0.0, TAU)
        context.stroke()
    }

    predict(other: SceneObject): Touch | null {
        console.log('predict')
        if (other instanceof MovingCircle) {
            return this.predictMovingCircle(other)
        }
        return null
    }

    predictMovingCircle(other: MovingCircle): Touch | null {
        const ex = this.position.x - other.position.x
        const ey = this.position.y - other.position.y
        const rr = this.radius + other.radius
        const vx = other.velocity.x - this.velocity.x
        const vy = other.velocity.y - this.velocity.y
        const vs = vx * vx + vy * vy
        if (vs == 0.0) return null
        const ev = ex * vy - ey * vx
        const sq = vs * rr * rr - ev * ev
        if (sq < 0.0) return null
        return new Touch(-(Math.sqrt(sq) - ey * vy - ex * vx) / vs, this, other)
    }
}