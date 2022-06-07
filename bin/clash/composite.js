import { FixedLine, FixedPoint } from "./objects.js";
import { Vector } from "./vector.js";
export class FixedPolygonBuilder {
    constructor() {
        this.points = [];
        this.closed = false;
    }
    addVector(v) {
        this.points.push(v);
        return this;
    }
    addCoordinate(x, y) {
        this.points.push(new Vector(x, y));
        return this;
    }
    close() {
        this.closed = true;
        return this;
    }
    build() {
        console.assert(this.points.length > 1);
        const objects = [];
        for (let i = 0; i < this.points.length; i++) {
            objects.push(new FixedPoint(this.points[i]));
        }
        for (let i = 1; i < this.points.length; i++) {
            objects.push(new FixedLine(this.points[i - 1], this.points[i]));
        }
        if (this.closed) {
            objects.push(new FixedLine(this.points[this.points.length - 1], this.points[0]));
        }
        return new FixedPolygon(objects);
    }
}
export class FixedPolygon {
    constructor(objects) {
        this.objects = objects;
    }
}
//# sourceMappingURL=composite.js.map