import { TAU } from "../lib/math.js";
import { Contact } from "./contact.js";
import { Vector } from "./vector.js";
export class MovingObject {
    constructor(mass, x = 0.0, y = 0.0) {
        this.mass = mass;
        this.inverseMass = this.mass === Number.POSITIVE_INFINITY ? 0.0 : 1.0 / this.mass;
        this.position = new Vector(x, y);
        this.velocity = new Vector(0.0, 0.0);
        this.force = new Vector(0.0, 0.0);
    }
    applyForces() {
        const gravity = 0.0;
        this.force.zero();
        if (this.mass !== Number.POSITIVE_INFINITY) {
            this.force.y += gravity * this.mass;
        }
    }
    integrate(time) {
        this.position.addScaled(this.velocity, time);
        this.velocity.addScaled(this.force, time * this.inverseMass);
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
        if (other instanceof MovingCircle) {
            return this.predictMovingCircle(other);
        }
        else if (other instanceof FixedPoint) {
            return this.predictFixedPoint(other);
        }
        else if (other instanceof FixedCircle) {
            return this.predictFixedCircle(other);
        }
        else if (other instanceof FixedLine) {
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
        return Contact.create(when, this, other);
    }
    predictFixedPoint(other) {
        const dx = other.point.x - this.position.x;
        const dy = other.point.y - this.position.y;
        const vx = this.velocity.x;
        const vy = this.velocity.y;
        const vs = vx * vx + vy * vy;
        const ev = dx * vy - dy * vx;
        const sq = vs * this.radius * this.radius - ev * ev;
        if (sq < 0.0)
            return Contact.Never;
        const when = -(Math.sqrt(sq) - dy * vy - dx * vx) / vs;
        return Contact.create(when, this, other);
    }
    predictFixedCircle(other) {
        const dx = other.center.x - this.position.x;
        const dy = other.center.y - this.position.y;
        const rr = this.radius + other.radius;
        const vx = this.velocity.x;
        const vy = this.velocity.y;
        const vs = vx * vx + vy * vy;
        const ev = dx * vy - dy * vx;
        const sq = vs * rr * rr - ev * ev;
        if (sq < 0.0)
            return Contact.Never;
        const when = -(Math.sqrt(sq) - dy * vy - dx * vx) / vs;
        return Contact.create(when, this, other);
    }
    predictFixedGate(other) {
        const dx = other.p1.x - other.p0.x;
        const dy = other.p1.y - other.p0.y;
        const ud = this.velocity.y * dx - this.velocity.x * dy;
        if (other.gate && ud <= 0)
            return Contact.Never;
        const dd = Math.sqrt(dx * dx + dy * dy) * Math.sign(ud);
        const px = (this.position.x - other.p0.x) - dy / dd * this.radius;
        const py = (this.position.y - other.p0.y) + dx / dd * this.radius;
        const ua = (this.velocity.y * px - this.velocity.x * py) / ud;
        if (ua < 0.0 || ua > 1.0)
            return Contact.Never;
        const when = (dy * px - dx * py) / ud;
        return Contact.create(when, this, other);
    }
    repel(other) {
        if (other instanceof MovingCircle) {
            this.repelMovingCircle(other);
        }
        else if (other instanceof FixedPoint) {
            this.repelFixedPoint(other);
        }
        else if (other instanceof FixedCircle) {
            this.repelFixedCircle(other);
        }
        else if (other instanceof FixedLine) {
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
        const e = 2.0 * ((this.velocity.x - other.velocity.x) * nx + (this.velocity.y - other.velocity.y) * ny)
            / (this.inverseMass + other.inverseMass);
        const ex = nx * e;
        const ey = ny * e;
        this.velocity.x -= ex * this.inverseMass;
        this.velocity.y -= ey * this.inverseMass;
        other.velocity.x += ex * other.inverseMass;
        other.velocity.y += ey * other.inverseMass;
    }
    repelFixedPoint(other) {
        const nx = (this.position.x - other.point.x) / this.radius;
        const ny = (this.position.y - other.point.y) / this.radius;
        const e = 2.0 * (nx * this.velocity.x + ny * this.velocity.y);
        this.velocity.x -= nx * e;
        this.velocity.y -= ny * e;
    }
    repelFixedCircle(other) {
        const nn = this.radius + other.radius;
        const nx = (this.position.x - other.center.x) / nn;
        const ny = (this.position.y - other.center.y) / nn;
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
export class FixedCircle {
    constructor(center, radius) {
        this.center = center;
        this.radius = radius;
    }
    wireframe(context) {
        context.moveTo(this.center.x + this.radius, this.center.y);
        context.arc(this.center.x, this.center.y, this.radius, 0.0, TAU);
    }
}
export class FixedLine {
    constructor(p0, p1, gate = false) {
        this.p0 = p0;
        this.p1 = p1;
        this.gate = gate;
    }
    wireframe(context) {
        context.moveTo(this.p0.x, this.p0.y);
        context.lineTo(this.p1.x, this.p1.y);
        if (this.gate) {
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
}
//# sourceMappingURL=objects.js.map