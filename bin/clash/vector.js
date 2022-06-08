export class Vector {
    constructor(x = 0.0, y = 0.0) {
        this.x = x;
        this.y = y;
    }
    static subtract(a, b) {
        return new Vector(b.x - a.x, b.y - a.y);
    }
    static normalized(v) {
        const length = v.length();
        return length > 0.0 ? new Vector(v.x / length, v.y / length) : v.clone();
    }
    zero() {
        this.x = 0.0;
        this.y = 0.0;
    }
    add(other) {
        this.x += other.x;
        this.y += other.y;
    }
    addScaled(other, scale) {
        this.x += other.x * scale;
        this.y += other.y * scale;
    }
    scale(value) {
        this.x *= value;
        this.y *= value;
    }
    clone() {
        return new Vector(this.x, this.y);
    }
    dot() {
        return this.x * this.x + this.y * this.y;
    }
    length() {
        return Math.sqrt(this.dot());
    }
    toString() {
        return `(x: ${this.x}, y: ${this.y})`;
    }
}
//# sourceMappingURL=vector.js.map