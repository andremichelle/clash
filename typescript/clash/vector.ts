export class Vector {
    constructor(public x: number = 0.0, public y: number = 0.0) {
    }

    add(other: Vector): void {
        this.x += other.x
        this.y += other.y
    }

    addPartly(other: Vector, scale: number): void {
        this.x += other.x * scale
        this.y += other.y * scale
    }
}