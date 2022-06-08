import { ArrayUtils, ObservableValueImpl } from "../lib/common.js";
import { Contact } from "./contact.js";
import { decodeSceneObject } from "./format.js";
import { FixedLine, MovingCircle, MovingObject } from "./objects.js";
import { Vector } from "./vector.js";
export class SceneObject {
    proximate(nearest, object) {
        if (object instanceof MovingCircle) {
            return this.proximateMovingCircle(nearest, object);
        }
        throw new Error(`Unknown MovingObject(${object.constructor.name})`);
    }
    repelMovingObject(object) {
        if (object instanceof MovingCircle) {
            this.repelMovingCircle(object);
        }
        else {
            throw new Error(`Unknown MovingObject(${object.constructor.name})`);
        }
    }
}
export class Scene {
    constructor() {
        this.fixedObjects = [];
        this.movingObjects = [];
        this.testPairs = [];
        this.gravity = new ObservableValueImpl(0.0);
        this.damping = new ObservableValueImpl(0.0);
        this.needsCompile = false;
        this.maxIterations = 0;
        this.running = true;
        this.numTests = () => this.testPairs.length;
        this.numObjects = () => this.movingObjects.length + this.fixedObjects.length;
        this.getResetMaxSteps = () => {
            const maxIterations = this.maxIterations;
            this.maxIterations = 0;
            return maxIterations;
        };
        this.kineticEnergy = () => this.movingObjects.reduce((energy, object) => {
            const squared = object.velocity.dot();
            return squared === 0.0 || object.inverseMass === 0.0 ? energy : energy + squared * object.mass;
        }, 0.0) * 0.5;
    }
    frame(xMin, yMin, xMax, yMax) {
        const corners = [
            new Vector(xMin, yMin),
            new Vector(xMax, yMin),
            new Vector(xMax, yMax),
            new Vector(xMin, yMax)
        ];
        this.add(new FixedLine(corners[1], corners[0], true));
        this.add(new FixedLine(corners[2], corners[1], true));
        this.add(new FixedLine(corners[3], corners[2], true));
        this.add(new FixedLine(corners[0], corners[3], true));
        return corners;
    }
    add(...objects) {
        for (const object of objects) {
            if (object instanceof MovingObject) {
                this.movingObjects.push(object);
            }
            else {
                this.fixedObjects.push(object);
            }
        }
        this.needsCompile = true;
    }
    addComposite(composite) {
        composite.objects.forEach(object => this.add(object));
    }
    step(remaining) {
        if (this.needsCompile) {
            this.compile();
        }
        this.computeForces();
        let steps = 0;
        while (remaining > Scene.REMAINING_THRESHOLD) {
            const contact = this.nextContact(new Contact(remaining, null, null));
            if (contact.when >= remaining) {
                this.integrate(remaining);
                break;
            }
            this.integrate(contact.when);
            contact.repel();
            remaining -= contact.when;
            if (++steps > Scene.MAX_STEPS) {
                console.log(steps, contact);
                throw new Error('Solving took too long');
            }
            this.maxIterations = Math.max(this.maxIterations, steps);
        }
    }
    compile() {
        this.testPairs.splice(0, this.testPairs.length, ...this.movingObjects
            .reduce((pairs, movingObject, index) => pairs
            .concat(this.movingObjects.slice(index + 1).map(other => [movingObject, other])), this.movingObjects
            .reduce((pairs, movingObject) => pairs
            .concat(this.fixedObjects.map(other => [movingObject, other])), [])));
        this.needsCompile = false;
    }
    computeForces() {
        this.movingObjects.forEach(object => object.force.zero());
    }
    nextContact(contact) {
        return this.testPairs.reduce((nearest, pair) => pair[1].proximate(nearest, pair[0]), contact);
    }
    integrate(time) {
        const gravity = this.gravity.get();
        const dampingScale = Math.pow(1.0 - this.damping.get(), time);
        this.movingObjects.forEach(object => {
            object.position.addScaled(object.velocity, time);
            object.velocity.addScaled(object.force, time * object.inverseMass);
            object.velocity.y += gravity * time;
            object.velocity.scale(dampingScale);
        });
    }
    wireframe(context) {
        context.beginPath();
        this.movingObjects.forEach(object => object.wireframe(context));
        context.strokeStyle = null;
        context.fillStyle = '#BDC2AD';
        context.stroke();
        context.fill();
        context.beginPath();
        this.fixedObjects.forEach(object => object.wireframe(context));
        context.strokeStyle = '#F9D253';
        context.stroke();
    }
    deserialize(format) {
        ArrayUtils.clear(this.movingObjects);
        ArrayUtils.clear(this.fixedObjects);
        this.addComposite({ objects: format.objects.map(f => decodeSceneObject(f)) });
        this.gravity.set(format.gravity);
        this.damping.set(format.damping);
    }
    serialize() {
        return {
            gravity: this.gravity.get(),
            damping: this.damping.get(),
            objects: [...this.movingObjects, ...this.fixedObjects].map(o => o.serialize())
        };
    }
}
Scene.REMAINING_THRESHOLD = 1e-7;
Scene.MAX_STEPS = 10000;
//# sourceMappingURL=scene.js.map