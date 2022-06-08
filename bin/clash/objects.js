import { TAU } from "../lib/math.js";
import { Contact } from "./contact.js";
import { SceneObject } from "./scene.js";
import { Vector } from "./vector.js";
export const decode = (format) => {
    switch (format.class) {
        case 'moving-circle':
            return new MovingCircle(format.mass, format.px, format.py, format.radius).setVelocity(format.vx, format.vy);
        case 'fixed-point':
            return new FixedPoint(new Vector(format.x, format.y));
        case 'fixed-circle':
            return new FixedCircle(new Vector(format.x, format.y), format.radius, format.outline, new CircleSegment(format.segment[0], format.segment[1]));
        case 'fixed-line':
            return new FixedLine(new Vector(format.x0, format.y0), new Vector(format.x1, format.y1), format.gate);
    }
    throw new Error(`Unknown format: ${format}`);
};
export class MovingObject extends SceneObject {
    constructor(mass, x = 0.0, y = 0.0) {
        super();
        this.mass = mass;
        this.inverseMass = this.mass === Number.POSITIVE_INFINITY ? 0.0 : 1.0 / this.mass;
        this.position = new Vector(x, y);
        this.velocity = new Vector(0.0, 0.0);
        this.force = new Vector(0.0, 0.0);
    }
    setVelocity(x, y) {
        this.velocity.x = x;
        this.velocity.y = y;
        return this;
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
    proximateMovingCircle(nearest, other) {
        const vx = other.velocity.x - this.velocity.x;
        const vy = other.velocity.y - this.velocity.y;
        const vs = vx * vx + vy * vy;
        const ex = this.position.x - other.position.x;
        const ey = this.position.y - other.position.y;
        const ev = ex * vy - ey * vx;
        const rr = this.radius + other.radius;
        const sq = vs * rr * rr - ev * ev;
        if (sq < 0.0)
            return nearest;
        const when = -(Math.sqrt(sq) - ey * vy - ex * vx) / vs;
        return Contact.compare(nearest, when, this, other);
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
    serialize() {
        return {
            class: "moving-circle",
            mass: this.mass,
            px: this.position.x,
            py: this.position.y,
            vx: this.velocity.x,
            vy: this.velocity.y,
            radius: this.radius
        };
    }
}
export class FixedPoint extends SceneObject {
    constructor(point) {
        super();
        this.point = point;
    }
    wireframe(context) {
        const radius = 3.0;
        context.moveTo(this.point.x - radius, this.point.y - radius);
        context.lineTo(this.point.x + radius, this.point.y + radius);
        context.moveTo(this.point.x + radius, this.point.y - radius);
        context.lineTo(this.point.x - radius, this.point.y + radius);
    }
    proximateMovingCircle(nearest, circle) {
        const dx = this.point.x - circle.position.x;
        const dy = this.point.y - circle.position.y;
        const vx = circle.velocity.x;
        const vy = circle.velocity.y;
        const vs = vx * vx + vy * vy;
        const ev = dx * vy - dy * vx;
        const sq = vs * circle.radius * circle.radius - ev * ev;
        if (sq < 0.0)
            return nearest;
        return Contact.compare(nearest, -(Math.sqrt(sq) - dy * vy - dx * vx) / vs, circle, this);
    }
    repelMovingCircle(circle) {
        const nx = (circle.position.x - this.point.x) / circle.radius;
        const ny = (circle.position.y - this.point.y) / circle.radius;
        const e = 2.0 * (nx * circle.velocity.x + ny * circle.velocity.y);
        circle.velocity.x -= nx * e;
        circle.velocity.y -= ny * e;
    }
    serialize() {
        return {
            class: "fixed-point",
            x: this.point.x,
            y: this.point.y
        };
    }
}
export var Outline;
(function (Outline) {
    Outline["Both"] = "both";
    Outline["Positive"] = "positive";
    Outline["Negative"] = "negative";
})(Outline || (Outline = {}));
export class CircleSegment {
    constructor(angleMin, angleRange) {
        this.angleMin = angleMin;
        this.angleRange = angleRange;
        console.assert(0.0 <= angleMin && angleMin < TAU && 0.0 < angleRange && angleRange <= TAU);
    }
}
CircleSegment.Full = new CircleSegment(0.0, TAU);
export class FixedCircle extends SceneObject {
    constructor(point, radius, outline = Outline.Both, segment = CircleSegment.Full) {
        super();
        this.point = point;
        this.radius = radius;
        this.outline = outline;
        this.segment = segment;
    }
    wireframe(context) {
        if (this.segment === CircleSegment.Full) {
            context.moveTo(this.point.x + this.radius, this.point.y);
            context.arc(this.point.x, this.point.y, this.radius, 0.0, TAU);
        }
        else {
            context.moveTo(this.point.x + Math.cos(this.segment.angleMin) * this.radius, this.point.y + Math.sin(this.segment.angleMin) * this.radius);
            context.arc(this.point.x, this.point.y, this.radius, this.segment.angleMin, this.segment.angleMin + this.segment.angleRange);
        }
    }
    proximateMovingCircle(nearest, circle) {
        switch (this.outline) {
            case Outline.Both:
                return Contact.proximate(this.proximateMovingCircleSigned(nearest, circle, 1), this.proximateMovingCircleSigned(nearest, circle, -1));
            case Outline.Positive:
                return this.proximateMovingCircleSigned(nearest, circle, 1);
            case Outline.Negative:
                return this.proximateMovingCircleSigned(nearest, circle, -1);
            default:
                throw new Error('unknown type');
        }
    }
    proximateMovingCircleSigned(nearest, circle, sign) {
        const dx = this.point.x - circle.position.x;
        const dy = this.point.y - circle.position.y;
        const rr = circle.radius + this.radius * sign;
        const vx = circle.velocity.x;
        const vy = circle.velocity.y;
        const vs = vx * vx + vy * vy;
        const ev = dx * vy - dy * vx;
        const sq = vs * rr * rr - ev * ev;
        if (sq < 0.0)
            return nearest;
        const when = (-Math.sqrt(sq) * sign + dy * vy + dx * vx) / vs;
        if (this.segment === CircleSegment.Full) {
            return Contact.compare(nearest, when, circle, this);
        }
        const px = circle.position.x + circle.velocity.x * when - this.point.x;
        const py = circle.position.y + circle.velocity.y * when - this.point.y;
        let angle = Math.atan2(py, px) - this.segment.angleMin;
        while (angle < 0.0)
            angle += TAU;
        if (angle >= this.segment.angleRange) {
            return nearest;
        }
        return Contact.compare(nearest, when, circle, this);
    }
    repelMovingCircle(circle) {
        const dx = circle.position.x - this.point.x;
        const dy = circle.position.y - this.point.y;
        const dd = Math.sqrt(dx * dx + dy * dy);
        const nx = dx / dd;
        const ny = dy / dd;
        const e = 2.0 * (nx * circle.velocity.x + ny * circle.velocity.y);
        circle.velocity.x -= nx * e;
        circle.velocity.y -= ny * e;
    }
    serialize() {
        return {
            class: "fixed-circle",
            x: this.point.x,
            y: this.point.y,
            radius: this.radius,
            outline: this.outline,
            segment: [this.segment.angleMin, this.segment.angleRange]
        };
    }
}
export class FixedLine extends SceneObject {
    constructor(p0, p1, gate = false) {
        super();
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
    proximateMovingCircle(nearest, circle) {
        const dx = this.p1.x - this.p0.x;
        const dy = this.p1.y - this.p0.y;
        const ud = circle.velocity.y * dx - circle.velocity.x * dy;
        if (this.gate && ud <= 0)
            return nearest;
        const dd = Math.sqrt(dx * dx + dy * dy) * Math.sign(ud);
        const px = (circle.position.x - this.p0.x) - dy / dd * circle.radius;
        const py = (circle.position.y - this.p0.y) + dx / dd * circle.radius;
        const ua = (circle.velocity.y * px - circle.velocity.x * py) / ud;
        if (ua < 0.0 || ua > 1.0)
            return nearest;
        return Contact.compare(nearest, (dy * px - dx * py) / ud, circle, this);
    }
    repelMovingCircle(circle) {
        const dx = this.p1.x - this.p0.x;
        const dy = this.p1.y - this.p0.y;
        const dd = Math.sqrt(dx * dx + dy * dy);
        const nx = dy / dd;
        const ny = -dx / dd;
        const e = 2.0 * (nx * circle.velocity.x + ny * circle.velocity.y);
        circle.velocity.x -= nx * e;
        circle.velocity.y -= ny * e;
    }
    serialize() {
        return {
            class: "fixed-line",
            x0: this.p0.x,
            y0: this.p0.y,
            x1: this.p1.x,
            y1: this.p1.y,
            gate: this.gate
        };
    }
}
//# sourceMappingURL=objects.js.map