import {Outline} from "./objects.js"

export type SceneFormat = {
    objects: SceneObjectFormat[]
}

export type SceneObjectFormat = {
    class: 'moving-circle' | 'fixed-point' | 'fixed-circle' | 'fixed-line'
}

export type MovingObjectFormat = {
    mass: number,
    px: number,
    py: number,
    vx: number,
    vy: number
} & SceneObjectFormat

export type MovingCircleFormat = {
    radius: number
} & MovingObjectFormat

export type FixedPointFormat = {
    x: number,
    y: number
} & SceneObjectFormat

export type FixedCircleFormat = {
    x: number,
    y: number,
    radius: number,
    outline: Outline,
    segment: [number, number]
} & SceneObjectFormat

export type FixedLineFormat = {
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    gate: boolean
} & SceneObjectFormat