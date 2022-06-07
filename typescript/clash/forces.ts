import {MovingObject} from "./objects.js"

export interface ForceGenerator {
    applyForces(object: MovingObject, time: number): void
}

