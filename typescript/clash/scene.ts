import {Contact} from "./contact.js"
import {FixedGate} from "./objects.js"
import {Vector} from "./vector.js"

export interface SceneObject {
    wireframe(context: CanvasRenderingContext2D): void
}

export interface FixedObject extends SceneObject {
}

export interface MovingObject extends SceneObject {
    readonly position: Vector
    readonly velocity: Vector

    move(time: number): void

    predictContact(scene: Scene): Contact

    repel(other: SceneObject): void
}

export class Scene {
    readonly fixedObjects: FixedObject[] = []
    readonly movingObjects: MovingObject[] = []
    readonly interactiveObjects: SceneObject[] = []

    running: boolean = true

    freeze(): void {
        // Call after every change to the scene
        this.interactiveObjects.splice(0, this.interactiveObjects.length, ...this.fixedObjects, ...this.movingObjects)
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
        while (remaining > 0.0) {
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
        return this.movingObjects.reduce((nearest: Contact, object: MovingObject) =>
            Contact.proximate(nearest, object.predictContact(this)), Contact.None)
    }

    advance(time: number): void {
        this.movingObjects.forEach(moving => moving.move(time))
    }

    forces(time: number): void {
        this.movingObjects.forEach(moving => {
            moving.velocity.y += 0.0004 * time
        })
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