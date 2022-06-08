import {CircleSegment, FixedCircle, FixedLine, FixedPoint, MovingCircle, Outline} from "./objects.js"
import {SceneObject} from "./scene.js"
import {Vector} from "./vector.js"

export type SceneFormat = {
    gravity: number,
    damping: number,
    objects: SceneObjectFormat[]
}

export type SceneObjectFormat = MovingCircleFormat | FixedPointFormat | FixedCircleFormat | FixedLineFormat

export const decodeSceneObject = (format: SceneObjectFormat): SceneObject => {
    switch (format.class) {
        case 'moving-circle':
            return new MovingCircle(format.mass, format.px, format.py, format.radius).setVelocity(format.vx, format.vy)
        case 'fixed-point':
            return new FixedPoint(new Vector(format.x, format.y))
        case 'fixed-circle':
            return new FixedCircle(new Vector(format.x, format.y), format.radius, format.outline, new CircleSegment(format.segment[0], format.segment[1]))
        case 'fixed-line':
            return new FixedLine(new Vector(format.x0, format.y0), new Vector(format.x1, format.y1), format.gate)
    }
    throw new Error(`Unknown format: ${format}`)
}

export type MovingObjectFormat = {
    mass: number,
    px: number,
    py: number,
    vx: number,
    vy: number
}

export type MovingCircleFormat = {
    class: 'moving-circle',
    radius: number
} & MovingObjectFormat

export type FixedPointFormat = {
    class: 'fixed-point',
    x: number,
    y: number
}

export type FixedCircleFormat = {
    class: 'fixed-circle',
    x: number,
    y: number,
    radius: number,
    outline: Outline,
    segment: [number, number]
}

export type FixedLineFormat = {
    class: 'fixed-line',
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    gate: boolean
}