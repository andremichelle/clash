import { Vector } from "./vector.js";
export class Spring {
    constructor(other, k, l) {
        this.other = other;
        this.k = k;
        this.l = l;
    }
    applyForces(object, time) {
        const force = Vector.create(object.position, this.other.position);
        let magnitude = force.length();
        magnitude = (magnitude - this.l);
        magnitude *= this.k;
        const acc = force.normalize();
        acc.scale(magnitude);
        object.forceAccum.add(acc);
    }
}
//# sourceMappingURL=forces.js.map