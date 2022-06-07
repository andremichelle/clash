import { Contact } from "./contact.js";
import { FixedLine, MovingObject } from "./objects.js";
import { Vector } from "./vector.js";
export class Scene {
    constructor() {
        this.fixedObjects = [];
        this.movingObjects = [];
        this.testPairs = [];
        this.needsCompile = false;
        this.running = true;
        this.numTests = () => this.testPairs.length;
        this.numObjects = () => this.movingObjects.length + this.fixedObjects.length;
        this.totalEnergy = () => this.movingObjects.reduce((energy, object) => {
            const squared = object.velocity.dot();
            return squared === 0.0 ? energy : energy + squared * object.mass;
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
        this.applyForces();
        let steps = 0;
        while (remaining > Scene.REMAINING_THRESHOLD) {
            const contact = this.nextContact();
            if (contact.when >= remaining) {
                this.integrate(remaining);
                break;
            }
            this.integrate(contact.when);
            contact.repel();
            remaining -= contact.when;
            if (++steps > Scene.MAX_ITERATIONS) {
                console.log(steps, contact);
                throw new Error('Solving took too long');
            }
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
    nextContact() {
        return this.testPairs.reduce((nearest, pair) => Contact.proximate(nearest, pair[0].predict(pair[1])), Contact.Never);
    }
    applyForces() {
        this.movingObjects.forEach(moving => moving.applyForces());
    }
    integrate(time) {
        this.movingObjects.forEach(moving => moving.integrate(time));
    }
    wireframe(context) {
        context.beginPath();
        this.movingObjects.forEach(object => object.wireframe(context));
        context.strokeStyle = 'rgb(255, 200, 60)';
        context.fillStyle = 'black';
        context.stroke();
        context.fill();
        context.beginPath();
        this.fixedObjects.forEach(object => object.wireframe(context));
        context.strokeStyle = 'grey';
        context.stroke();
    }
}
Scene.REMAINING_THRESHOLD = 1e-7;
Scene.MAX_ITERATIONS = 10000;
//# sourceMappingURL=scene.js.map