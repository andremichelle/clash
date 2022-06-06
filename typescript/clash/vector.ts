export class Vector {
    static create(a: Vector, b: Vector): Vector {
        return new Vector(b.x - a.x, b.y - a.y)
    }

    constructor(public x: number = 0.0, public y: number = 0.0) {
    }

    add(other: Vector): void {
        this.x += other.x
        this.y += other.y
    }

    addScaled(other: Vector, scale: number): void {
        this.x += other.x * scale
        this.y += other.y * scale
    }

    normalize(): Vector {
        const length = this.length()
        console.assert(length !== 0.0)
        return new Vector(this.x / length, this.y / length)
    }

    normal(): Vector {
        const length = this.length()
        console.assert(length !== 0.0)
        return new Vector(this.y / length, -this.x / length)
    }

    dot() {
        return this.x * this.x + this.y * this.y
    }

    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y)
    }
}