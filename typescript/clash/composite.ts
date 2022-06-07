import {FixedLine, FixedPoint} from "./objects.js"
import {SceneObject} from "./scene.js"
import {Vector} from "./vector.js"

export class FixedPolygonBuilder {
    private readonly points: Vector[] = []
    private closed: boolean = false

    constructor() {
    }

    addVector(v: Vector): this {
        this.points.push(v)
        return this
    }

    addCoordinate(x: number, y: number): this {
        this.points.push(new Vector(x, y))
        return this
    }

    close(): this {
        this.closed = true
        return this
    }

    build(): FixedPolygon {
        console.assert(this.points.length > 1)
        const objects: SceneObject[] = []
        for (let i = 0; i < this.points.length; i++) {
            objects.push(new FixedPoint(this.points[i]))
        }
        for (let i = 1; i < this.points.length; i++) {
            objects.push(new FixedLine(this.points[i - 1], this.points[i]))
        }
        if (this.closed) {
            objects.push(new FixedLine(this.points[this.points.length - 1], this.points[0]))
        }
        return new FixedPolygon(objects)
    }
}

export class FixedPolygon {
    constructor(readonly objects: SceneObject[]) {
    }
}