import { Outline } from "./objects.js";
export declare type SceneFormat = {
    objects: SceneObjectFormat[];
};
export declare type SceneObjectFormat = MovingCircleFormat | FixedPointFormat | FixedCircleFormat | FixedLineFormat;
export declare type MovingObjectFormat = {
    mass: number;
    px: number;
    py: number;
    vx: number;
    vy: number;
};
export declare type MovingCircleFormat = {
    class: 'moving-circle';
    radius: number;
} & MovingObjectFormat;
export declare type FixedPointFormat = {
    class: 'fixed-point';
    x: number;
    y: number;
};
export declare type FixedCircleFormat = {
    class: 'fixed-circle';
    x: number;
    y: number;
    radius: number;
    outline: Outline;
    segment: [number, number];
};
export declare type FixedLineFormat = {
    class: 'fixed-line';
    x0: number;
    y0: number;
    x1: number;
    y1: number;
    gate: boolean;
};
