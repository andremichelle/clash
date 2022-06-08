import {Outline} from "./objects.js"

export type SceneFormat = {
    objects: SceneObjectFormat[]
}

export type SceneObjectFormat = MovingCircleFormat | FixedPointFormat | FixedCircleFormat | FixedLineFormat

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