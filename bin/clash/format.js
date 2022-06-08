import { CircleSegment, FixedCircle, FixedLine, FixedPoint, MovingCircle } from "./objects.js";
import { Vector } from "./vector.js";
export const decodeSceneObject = (format) => {
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
//# sourceMappingURL=format.js.map