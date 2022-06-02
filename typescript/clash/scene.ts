import {FixedGate} from "./objects.js"
import {Touch} from "./touch.js"
import {Vector} from "./vector.js"

export interface ClashObject {
    wireframe(context: CanvasRenderingContext2D): void
}

export interface FixedObject extends ClashObject {
}

export interface MovingObject extends ClashObject {
    readonly position: Vector
    readonly velocity: Vector

    move(time: number): void

    predictTouch(scene: Scene): Touch | null

    repel(other: SceneObject): void
}

export type SceneObject = FixedObject | MovingObject

export class Scene {
    readonly fixedObjects: FixedObject[] = []
    readonly movingObjects: MovingObject[] = []
    readonly touchableObjects: SceneObject[] = []

    running: boolean = true

    freeze(): void {
        this.touchableObjects.splice(0, this.touchableObjects.length, ...this.fixedObjects, ...this.movingObjects)
    }

    frame(xMin: number, yMin: number, xMax: number, yMax: number): Vector[] {
        const corners: Vector[] = [
            new Vector(xMin, yMin),
            new Vector(xMax, yMin),
            new Vector(xMax, yMax),
            new Vector(xMin, yMax)
        ]
        this.fixedObjects.push(new FixedGate(corners[1], corners[0]))
        this.fixedObjects.push(new FixedGate(corners[2], corners[1]))
        this.fixedObjects.push(new FixedGate(corners[3], corners[2]))
        this.fixedObjects.push(new FixedGate(corners[0], corners[3]))
        return corners
    }

    solve(remaining: number): void {
        while(remaining > 0.0) {
            const touch: Touch | null = this.movingObjects.reduce((prev: Touch | null, object: MovingObject) =>
                Touch.closer(prev, object.predictTouch(this)), null)
            if (touch !== null && touch.when < remaining) {
                this.advance(touch.when)
                touch.repel()
                remaining -= touch.when
            } else {
                this.advance(remaining)
                break
            }
        }
    }

    advance(time: number): void {
        this.movingObjects.forEach(moving => moving.move(time))
    }

    wireframe(context: CanvasRenderingContext2D): void {
        context.beginPath()
        this.movingObjects.forEach(object => object.wireframe(context))
        context.strokeStyle = 'orange'
        context.stroke()
        context.beginPath()
        this.fixedObjects.forEach(object => object.wireframe(context))
        context.strokeStyle = 'grey'
        context.stroke()
    }
}