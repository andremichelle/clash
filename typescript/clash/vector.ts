export class Vector {
    static subtract(a: Vector, b: Vector): Vector {
        return new Vector(b.x - a.x, b.y - a.y)
    }

    static normalized(v: Vector): Vector {
        const length = v.length()
        return length > 0.0 ? new Vector(v.x / length, v.y / length) : v.clone()
    }

    constructor(public x: number = 0.0, public y: number = 0.0) {
    }

    zero(): void {
        this.x = 0.0
        this.y = 0.0
    }

    add(other: Vector): void {
        this.x += other.x
        this.y += other.y
    }

    addScaled(other: Vector, scale: number): void {
        this.x += other.x * scale
        this.y += other.y * scale
    }

    scale(value: number): void {
        this.x *= value
        this.y *= value
    }

    clone(): Vector {
        return new Vector(this.x, this.y)
    }

    dot() {
        return this.x * this.x + this.y * this.y
    }

    length() {
        return Math.sqrt(this.dot())
    }

    toString(): string {
        return `(x: ${this.x}, y: ${this.y})`
    }
}