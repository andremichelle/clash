import { Outline } from "./objects.js";
export declare type SceneFormat = {
    objects: SceneObjectFormat[];
};
export declare type SceneObjectFormat = {
    class: 'moving-circle' | 'fixed-point' | 'fixed-circle' | 'fixed-line';
};
export declare type MovingObjectFormat = {
    mass: number;
    px: number;
    py: number;
    vx: number;
    vy: number;
} & SceneObjectFormat;
export declare type MovingCircleFormat = {
    radius: number;
} & MovingObjectFormat;
export declare type FixedPointFormat = {
    x: number;
    y: number;
} & SceneObjectFormat;
export declare type FixedCircleFormat = {
    x: number;
    y: number;
    radius: number;
    outline: Outline;
    segment: [number, number];
} & SceneObjectFormat;
export declare type FixedLineFormat = {
    x0: number;
    y0: number;
    x1: number;
    y1: number;
    gate: boolean;
} & SceneObjectFormat;
