import { TAU } from "../lib/math.js";
import { Contact } from "./contact.js";
import { Vector } from "./vector.js";
export class MovingObject {
    constructor(mass, x = 0.0, y = 0.0) {
        this.mass = mass;
        this.inverseMass = this.mass === Number.POSITIVE_INFINITY ? 0.0 : 1.0 / this.mass;
        this.forces = new Vector(0.0, 0.0);
        this.position = new Vector(x, y);
        this.velocity = new Vector();
        this.acceleration = new Vector();
    }
    move(time) {
        this.velocity.addScaled(this.forces, time * this.inverseMass);
        this.position.addScaled(this.velocity, time);
    }
    applyForces(time) {
    }
}
export class MovingCircle extends MovingObject {
    constructor(mass, x, y, radius) {
        super(mass, x, y);
        this.radius = radius;
    }
    wireframe(context) {
        context.moveTo(this.position.x + this.radius, this.position.y);
        context.arc(this.position.x, this.position.y, this.radius, 0.0, TAU);
    }
    predict(other) {
        if (other instanceof MovingObject) {
            if (other instanceof MovingCircle) {
                return this.predictMovingCircle(other);
            }
        }
        if (other instanceof FixedPoint) {
            return this.predictFixedPoint(other);
        }
        else if (other instanceof FixedGate) {
            return this.predictFixedGate(other);
        }
        throw new Error(`No strategy for predicting ${other.constructor.name}`);
    }
    predictMovingCircle(other) {
        const vx = other.velocity.x - this.velocity.x;
        const vy = other.velocity.y - this.velocity.y;
        const vs = vx * vx + vy * vy;
        if (vs == 0.0)
            return Contact.Never;
        const ex = this.position.x - other.position.x;
        const ey = this.position.y - other.position.y;
        const ev = ex * vy - ey * vx;
        const rr = this.radius + other.radius;
        const sq = vs * rr * rr - ev * ev;
        if (sq < 0.0)
            return Contact.Never;
        const when = -(Math.sqrt(sq) - ey * vy - ex * vx) / vs;
        return Contact.threshold(when, this, other);
    }
    predictFixedPoint(other) {
        const ex = other.point.x - this.position.x;
        const ey = other.point.y - this.position.y;
        const vx = this.velocity.x;
        const vy = this.velocity.y;
        const vs = vx * vx + vy * vy;
        const ev = ex * vy - ey * vx;
        const sq = vs * this.radius * this.radius - ev * ev;
        if (sq < 0.0)
            return Contact.Never;
        const when = -(Math.sqrt(sq) - ey * vy - ex * vx) / vs;
        return Contact.threshold(when, this, other);
    }
    predictFixedGate(other) {
        const dx = other.p1.x - other.p0.x;
        const dy = other.p1.y - other.p0.y;
        const ud = this.velocity.y * dx - this.velocity.x * dy;
        if (ud <= 0)
            return Contact.Never;
        const dd = Math.sqrt(dx * dx + dy * dy);
        const px = (this.position.x - other.p0.x) - dy / dd * this.radius;
        const py = (this.position.y - other.p0.y) + dx / dd * this.radius;
        const ua = (this.velocity.y * px - this.velocity.x * py);
        if (ua < 0.0 || ua > ud)
            return Contact.Never;
        const when = (dy * px - dx * py) / ud;
        return Contact.threshold(when, this, other);
    }
    repel(other) {
        if (other instanceof MovingCircle) {
            this.repelMovingCircle(other);
        }
        else if (other instanceof FixedPoint) {
            this.repelFixedPoint(other);
        }
        else if (other instanceof FixedGate) {
            this.repelFixedGate(other);
        }
        else {
            throw new Error(`No strategy for repelling ${other.constructor.name}`);
        }
    }
    repelMovingCircle(other) {
        const distance = this.radius + other.radius;
        const nx = (this.position.x - other.position.x) / distance;
        const ny = (this.position.y - other.position.y) / distance;
        const e = -2.0 * ((other.velocity.x - this.velocity.x) * nx + (other.velocity.y - this.velocity.y) * ny) / (this.inverseMass + other.inverseMass);
        this.velocity.x -= e * nx * this.inverseMass;
        this.velocity.y -= e * ny * this.inverseMass;
        other.velocity.x += e * nx * other.inverseMass;
        other.velocity.y += e * ny * other.inverseMass;
    }
    repelFixedPoint(other) {
        const nx = (this.position.x - other.point.x) / this.radius;
        const ny = (this.position.y - other.point.y) / this.radius;
        const e = 2.0 * (nx * this.velocity.x + ny * this.velocity.y);
        this.velocity.x -= nx * e;
        this.velocity.y -= ny * e;
    }
    repelFixedGate(other) {
        const dx = other.p1.x - other.p0.x;
        const dy = other.p1.y - other.p0.y;
        const dd = Math.sqrt(dx * dx + dy * dy);
        const nx = dy / dd;
        const ny = -dx / dd;
        const e = 2.0 * (nx * this.velocity.x + ny * this.velocity.y);
        this.velocity.x -= nx * e;
        this.velocity.y -= ny * e;
    }
}
export class FixedPoint {
    constructor(point) {
        this.point = point;
    }
    wireframe(context) {
        const radius = 3.0;
        context.moveTo(this.point.x - radius, this.point.y - radius);
        context.lineTo(this.point.x + radius, this.point.y + radius);
        context.moveTo(this.point.x + radius, this.point.y - radius);
        context.lineTo(this.point.x - radius, this.point.y + radius);
    }
}
export class FixedGate {
    constructor(p0, p1) {
        this.p0 = p0;
        this.p1 = p1;
    }
    wireframe(context) {
        context.moveTo(this.p0.x, this.p0.y);
        context.lineTo(this.p1.x, this.p1.y);
        const dx = this.p1.x - this.p0.x;
        const dy = this.p1.y - this.p0.y;
        const dd = Math.sqrt(dx * dx + dy * dy);
        const cx = this.p0.x + dx * 0.5;
        const cy = this.p0.y + dy * 0.5;
        const nx = dy / dd;
        const ny = -dx / dd;
        const tn = 8;
        context.moveTo(cx - ny * tn, cy + nx * tn);
        context.lineTo(cx + nx * tn, cy + ny * tn);
        context.lineTo(cx + ny * tn, cy - nx * tn);
    }
}
//# sourceMappingURL=objects.js.map