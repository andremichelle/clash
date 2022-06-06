export class Vector {
    constructor(x = 0.0, y = 0.0) {
        this.x = x;
        this.y = y;
    }
    static create(a, b) {
        return new Vector(b.x - a.x, b.y - a.y);
    }
    add(other) {
        this.x += other.x;
        this.y += other.y;
    }
    addScaled(other, scale) {
        this.x += other.x * scale;
        this.y += other.y * scale;
    }
    normalize() {
        const length = this.length();
        console.assert(length !== 0.0);
        return new Vector(this.x / length, this.y / length);
    }
    normal() {
        const length = this.length();
        console.assert(length !== 0.0);
        return new Vector(this.y / length, -this.x / length);
    }
    dot() {
        return this.x * this.x + this.y * this.y;
    }
    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
}
//# sourceMappingURL=vector.js.map