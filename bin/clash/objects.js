import { Vector } from "./vector.js";
export class MovingObject {
    constructor(mass, x = 0.0, y = 0.0) {
        this.mass = mass;
        this.inverseMass = this.mass === Number.POSITIVE_INFINITY ? 0.0 : 1.0 / this.mass;
        this.forces = new Vector(0.0, 0.0);
        this.touched = true;
        this.position = new Vector(x, y);
        this.velocity = new Vector();
        this.acceleration = new Vector();
    }
    move(time) {
        this.velocity.addScaled(this.forces, time * this.inverseMass);
        this.position.addScaled(this.velocity, time);
        this.touched = false;
    }
    applyForces(time) {
    }
}
//# sourceMappingURL=objects.js.map