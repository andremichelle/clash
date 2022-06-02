import {Touch} from "./touch.js"
import {Vector} from "./vector.js"

export interface FixedObject {
}

export interface MovingObject {
    readonly position: Vector
    readonly velocity: Vector

    move(time: number): void

    predictTouch(scene: Scene): Touch | null

    repel(other: SceneObject): void

    wireframe(context: CanvasRenderingContext2D): void
}

export type SceneObject = FixedObject | MovingObject

export class Scene {
    readonly fixedObjects: FixedObject[] = []
    readonly movingObjects: MovingObject[] = []

    running: boolean = true

    solve(time: number): void {
        const touch: Touch | null = this.movingObjects.reduce((prev: Touch | null, object: MovingObject) =>
            Touch.closer(prev, object.predictTouch(this)), null)
        if (touch !== null && touch.when < time) {
            this.advance(touch.when)
            touch.repel()
        } else {
            this.advance(time)
        }
    }

    advance(time: number): void {
        this.movingObjects.forEach(moving => moving.move(time))
    }

    wireframe(context: CanvasRenderingContext2D): void {
        context.strokeStyle = 'orange'
        this.movingObjects.forEach(object => object.wireframe(context))
    }

    getTouchables(): ReadonlyArray<SceneObject> {
        return [...this.fixedObjects, ...this.movingObjects]
    }
}