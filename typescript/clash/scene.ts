import {Contact} from "./contact.js"
import {MovingObject} from "./objects.js"
import {FixedGate} from "./shapes.js"
import {Vector} from "./vector.js"

export interface SceneObject {
    wireframe(context: CanvasRenderingContext2D): void
}

export class Scene {
    readonly fixedObjects: SceneObject[] = []
    readonly movingObjects: MovingObject<any>[] = []
    readonly testPairs: [MovingObject<any>, SceneObject][] = []

    running: boolean = true

    compile(): void {
        // Call after every change to the scene
        this.testPairs.splice(0, this.testPairs.length, ...this.movingObjects
            .reduce((pairs: [MovingObject<any>, SceneObject][], movingObject: MovingObject<any>, index: number, movingObjects: MovingObject<any>[]) => pairs
                .concat(movingObjects.slice(index + 1).map(other => [movingObject, other as SceneObject])), this.movingObjects
                .reduce((pairs: [MovingObject<any>, SceneObject][], movingObject: MovingObject<any>) => pairs
                    .concat(this.fixedObjects.map(other => [movingObject, other])), [])))
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
        this.forces(remaining)
        let steps = 0
        while (remaining > 1e-3) {
            const contact: Contact = this.predictContact()
            if (contact.when >= remaining) {
                this.advance(remaining)
                break
            } else {
                this.advance(contact.when)
                contact.repel()
                remaining -= contact.when
            }
            if (++steps > 10000) {
                throw new Error('Solving took too long')
            }
        }
    }

    predictContact(): Contact {
        return this.testPairs.reduce((nearest: Contact, pair: [MovingObject<any>, SceneObject]) =>
            Contact.proximate(nearest, pair[0].predict(pair[1])), Contact.None)
    }

    advance(time: number): void {
        this.movingObjects.forEach(moving => moving.move(time))
    }

    forces(time: number): void {
        this.movingObjects.forEach(moving => moving.applyForces(time))
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