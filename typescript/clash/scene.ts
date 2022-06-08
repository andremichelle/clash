import {ArrayUtils} from "../lib/common.js"
import {Contact} from "./contact.js"
import {SceneFormat, SceneObjectFormat} from "./format.js"
import {decode, FixedLine, MovingCircle, MovingObject} from "./objects.js"
import {Vector} from "./vector.js"

export abstract class SceneObject {
    proximate(nearest: Contact, object: MovingObject): NonNullable<Contact> {
        if (object instanceof MovingCircle) {
            return this.proximateMovingCircle(nearest, object)
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

    abstract serialize(): SceneObjectFormat

    abstract wireframe(context: CanvasRenderingContext2D): void

    abstract proximateMovingCircle(nearest: Contact, circle: MovingCircle): NonNullable<Contact>

    abstract repelMovingCircle(circle: MovingCircle): void
}

export class Scene {
    private static readonly REMAINING_THRESHOLD = 1e-7
    private static readonly MAX_ITERATIONS = 10000

    private readonly fixedObjects: SceneObject[] = []
    private readonly movingObjects: MovingObject[] = []
    private readonly testPairs: [MovingObject, SceneObject][] = []

    private needsCompile: boolean = false
    private maxIterations: number = 0

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
            const contact: Contact = this.nextContact(new Contact(remaining, null, null))
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
            this.maxIterations = Math.max(this.maxIterations, steps)
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

    nextContact(contact: Contact): Contact {
        return this.testPairs.reduce((nearest: Contact, pair: [MovingObject, SceneObject]) =>
            pair[1].proximate(nearest, pair[0]), contact)
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

    deserialize(format: SceneFormat): void {
        ArrayUtils.clear(this.movingObjects)
        ArrayUtils.clear(this.fixedObjects)
        this.addComposite({objects: format.objects.map(f => decode(f))})
    }

    serialize(): SceneFormat {
        return {
            objects: [...this.movingObjects, ...this.fixedObjects].map(o => o.serialize())
        }
    }

    numTests = (): number => this.testPairs.length

    numObjects = (): number => this.movingObjects.length + this.fixedObjects.length

    getResetMaxIterations = (): number => {
        const maxIterations = this.maxIterations
        this.maxIterations = 0
        return maxIterations
    }

    kineticEnergy = (): number => this.movingObjects.reduce((energy: number, object: MovingObject) => {
        const squared = object.velocity.dot()
        return squared === 0.0 || object.inverseMass === 0.0 ? energy : energy + squared * object.mass
    }, 0.0) * 0.5
}