import {Contact} from "./contact.js"
import {FixedLine, MovingCircle, MovingObject} from "./objects.js"
import {Vector} from "./vector.js"

export abstract class SceneObject {
    predictMovingObject(object: MovingObject): NonNullable<Contact> {
        if (object instanceof MovingCircle) {
            return this.predictMovingCircle(object)
        }
        throw new Error(`Unknown MovingObject(${object.constructor.name})`)
    }

    repelMovingObject(object: MovingObject): void {
        if (object instanceof MovingCircle) {
            this.repelMovingCircle(object)
        } else {
            throw new Error(`Unknown MovingObject(${object.constructor.name})`)
        }
    }

    abstract wireframe(context: CanvasRenderingContext2D): void

    abstract predictMovingCircle(circle: MovingCircle): NonNullable<Contact>

    abstract repelMovingCircle(circle: MovingCircle): void
}

export class Scene {
    private static readonly REMAINING_THRESHOLD = 1e-7
    private static readonly MAX_ITERATIONS = 10000

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
        this.add(new FixedLine(corners[1], corners[0], true))
        this.add(new FixedLine(corners[2], corners[1], true))
        this.add(new FixedLine(corners[3], corners[2], true))
        this.add(new FixedLine(corners[0], corners[3], true))
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

    addComposite(composite: { objects: SceneObject[] }): void {
        composite.objects.forEach(object => this.add(object))
    }

    step(remaining: number): void {
        if (this.needsCompile) {
            this.compile()
        }
        this.applyForces()
        let steps = 0
        while (remaining > Scene.REMAINING_THRESHOLD) {
            const contact: Contact = this.nextContact()
            if (contact.when >= remaining) {
                this.integrate(remaining)
                break
            }
            this.integrate(contact.when)
            contact.repel()
            remaining -= contact.when
            if (++steps > Scene.MAX_ITERATIONS) {
                console.log(steps, contact)
                throw new Error('Solving took too long')
            }
        }
    }

    compile(): void {
        this.testPairs.splice(0, this.testPairs.length, ...this.movingObjects
            .reduce((pairs: [MovingObject, SceneObject][], movingObject: MovingObject, index: number) => pairs
                .concat(this.movingObjects.slice(index + 1).map(other => [movingObject, other])), this.movingObjects
                .reduce((pairs: [MovingObject, SceneObject][], movingObject: MovingObject) => pairs
                    .concat(this.fixedObjects.map(other => [movingObject, other])), [])))
        this.needsCompile = false
    }

    nextContact(): Contact {
        return this.testPairs.reduce((nearest: Contact, pair: [MovingObject, SceneObject]) =>
            Contact.proximate(nearest, pair[1].predictMovingObject(pair[0])), Contact.Never)
    }

    applyForces() {
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

    kineticEnergy = (): number => this.movingObjects.reduce((energy: number, object: MovingObject) => {
        const squared = object.velocity.dot()
        return squared === 0.0 || object.inverseMass === 0.0 ? energy : energy + squared * object.mass
    }, 0.0) * 0.5
}