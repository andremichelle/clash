import {Contact} from "./contact.js"
import {FixedGate, MovingObject} from "./objects.js"
import {Vector} from "./vector.js"

export interface SceneObject {
    wireframe(context: CanvasRenderingContext2D): void
}

export class Scene {
    private readonly fixedObjects: SceneObject[] = []
    private readonly movingObjects: MovingObject[] = []
    private readonly testPairs: [MovingObject, SceneObject][] = []

    private needsCompile: boolean = false

    running: boolean = true

    frame(xMin: number, yMin: number, xMax: number, yMax: number): Vector[] {
        const corners: Vector[] = [
            new Vector(xMin, yMin),
            new Vector(xMax, yMin),
            new Vector(xMax, yMax),
            new Vector(xMin, yMax)
        ]
        this.add(new FixedGate(corners[1], corners[0]))
        this.add(new FixedGate(corners[2], corners[1]))
        this.add(new FixedGate(corners[3], corners[2]))
        this.add(new FixedGate(corners[0], corners[3]))
        return corners
    }

    add(...objects: SceneObject[]): void {
        for (const object of objects) {
            if (object instanceof MovingObject) {
                this.movingObjects.push(object)
            } else {
                this.fixedObjects.push(object)
            }
        }
        this.needsCompile = true
    }

    step(remaining: number): void {
        if (this.needsCompile) {
            this.compile()
            this.needsCompile = false
        }
        this.applyForces(remaining)
        let steps = 0
        while (remaining > 0.0) {
            const contact: Contact = this.nextContact()
            if (contact.when >= remaining) {
                this.integrate(remaining)
                break
            }
            this.integrate(contact.when)
            contact.repel()
            remaining -= contact.when
            if (++steps > 10000) {
                console.log(steps, contact)
                throw new Error('Solving took too long')
            }
        }
    }

    compile(): void {
        this.testPairs.splice(0, this.testPairs.length, ...this.movingObjects
            .reduce((pairs: [MovingObject, SceneObject][], movingObject: MovingObject, index: number) => pairs
                .concat(this.movingObjects.slice(index + 1).map(other => [movingObject, other as SceneObject])), this.movingObjects
                .reduce((pairs: [MovingObject, SceneObject][], movingObject: MovingObject) => pairs
                    .concat(this.fixedObjects.map(other => [movingObject, other])), [])))
    }

    nextContact(): Contact {
        return this.testPairs.reduce((nearest: Contact, pair: [MovingObject, SceneObject]) =>
            Contact.proximate(nearest, pair[0].predict(pair[1])), Contact.Never)
    }

    applyForces(time: number) {
        this.movingObjects.forEach(moving => moving.applyForces())
    }

    integrate(time: number): void {
        this.movingObjects.forEach(moving => moving.integrate(time))
    }

    wireframe(context: CanvasRenderingContext2D): void {
        context.beginPath()
        this.movingObjects.forEach(object => object.wireframe(context))
        context.strokeStyle = 'rgb(255, 200, 60)'
        context.fillStyle = 'black'
        context.stroke()
        context.fill()
        context.beginPath()
        this.fixedObjects.forEach(object => object.wireframe(context))
        context.strokeStyle = 'grey'
        context.stroke()
    }

    numTests = (): number => this.testPairs.length

    numObjects = (): number => this.movingObjects.length + this.fixedObjects.length

    totalEnergy = (): number => this.movingObjects.reduce((energy: number, object: MovingObject) => {
        const squared = object.velocity.dot()
        return squared === 0.0 ? energy : energy + squared * object.mass
    }, 0.0) * 0.5
}