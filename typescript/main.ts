import {FixedPolygonBuilder} from "./clash/composite.js"
import {FixedCircle, FixedLine, MovingCircle, Outline, CircleSegment} from "./clash/objects.js"
import {Scene} from "./clash/scene.js"
import {Vector} from "./clash/vector.js"
import {Boot, preloadImagesOfCssFile} from "./lib/boot.js"
import {HTML} from "./lib/dom.js"
import {Mulberry32} from "./lib/math.js"

// Articles I read:
// https://martinheinz.dev/blog/15
// https://gamedevelopment.tutsplus.com/tutorials/how-to-create-a-custom-2d-physics-engine-the-core-engine--gamedev-7493
// https://research.ncl.ac.uk/game/mastersdegree/gametechnologies/physicstutorials/2linearmotion/Physics%20-%20Linear%20Motion.pdf

// TODO
// Try constrain repelling to single axis

const showProgress = (() => {
    const progress: SVGSVGElement = document.querySelector("svg.preloader")
    window.onerror = () => progress.classList.add("error")
    window.onunhandledrejection = () => progress.classList.add("error")
    return (percentage: number) => progress.style.setProperty("--percentage", percentage.toFixed(2))
})();

(async () => {
    console.debug("booting...")

    // --- BOOT STARTS ---

    const boot = new Boot()
    boot.addObserver(boot => showProgress(boot.normalizedPercentage()))
    boot.registerProcess(preloadImagesOfCssFile("./bin/main.css"))
    // const context = newAudioContext()
    // boot.registerProcess(LimiterWorklet.loadModule(context))
    // boot.registerProcess(MeterWorklet.loadModule(context))
    // boot.registerProcess(MetronomeWorklet.loadModule(context))
    await boot.waitForCompletion()

    const scene = new Scene()
    const corners = scene.frame(0.0, 0.0, 0.0, 0.0)
    const random = new Mulberry32()

    const Scenes = [
        () => {
            for (let i = 0; i < 100; i++) {
                const radius = random.nextDouble(4.0, 32.0)
                const mass = radius * radius
                const x = random.nextDouble(radius, window.innerWidth - radius)
                const y = random.nextDouble(radius, window.innerHeight - radius)
                const object = new MovingCircle(mass, x, y, radius)
                object.velocity.x = random.nextDouble(-0.25, 0.25)
                object.velocity.y = random.nextDouble(-0.25, 0.25)
                scene.add(object)
            }
            scene.addComposite(new FixedPolygonBuilder()
                .addCoordinate(300, 100)
                .addCoordinate(700, 200)
                .addCoordinate(600, 500)
                .addCoordinate(240, 400)
                .close()
                .build())
            scene.add(new FixedCircle(new Vector(800, 400), 64))
        }
        , () => {
            const circleA = new MovingCircle(100.0, 300.0, 300.0, 32)
            const circleB = new MovingCircle(100.0, 500.0 - 32.0, 300.0, 32)
            const circleC = new MovingCircle(100.0, 500.0 + 32.0, 300.0, 32)
            const circleD = new MovingCircle(100.0, 700.0, 300.0, 32)
            circleA.velocity.x = 1.5
            circleD.velocity.x = -1
            scene.add(circleA, circleB, circleC, circleD)
        }
        , () => {
            const ca = new MovingCircle(100.0, 100.0, 500.0, 32)
            const cb = new MovingCircle(100.0, 200.0, 300.0, 32)
            ca.velocity.y = -1
            cb.velocity.y = 1
            const ga = new FixedLine(new Vector(0, 400), new Vector(500, 400))
            scene.add(ca, ga, cb)
        }
        , () => {
            const ca = new MovingCircle(16 * 16, 300.0, 300.0, 16)
            const cb = new MovingCircle(32 * 32, 300.0, 600.0, 32)
            const cc = new MovingCircle(32 * 32, 200.0, 200.0, 32)
            const outer = new FixedCircle(new Vector(300, 500), 64)
            const inner = new FixedCircle(new Vector(300, 500), 256)
            ca.velocity.x = 0.5
            cb.velocity.y = 0.5
            cc.velocity.x = 0.5
            cc.velocity.y = 1.5
            scene.add(ca, cb, cc, outer, inner)
        }
        , () => {
            const moving = new MovingCircle(16 * 16, 400.0, 300.0, 16)
            const fixed = new FixedCircle(new Vector(400, 500), 256, Outline.Both, new CircleSegment(Math.PI, Math.PI))
            moving.velocity.x = 1.5
            moving.velocity.y = 0.5
            scene.add(moving, fixed)
        }
    ]
    Scenes[0]()

    // --- BOOT ENDS ---
    const canvas: HTMLCanvasElement = HTML.query('canvas')
    const labelTotalEnergy: HTMLCanvasElement = HTML.query('#total-energy')
    const labelNumTests: HTMLCanvasElement = HTML.query('#num-tests')
    const labelNumObject: HTMLCanvasElement = HTML.query('#num-objects')
    const context: CanvasRenderingContext2D = canvas.getContext('2d')
    const nextFrame = () => {
        scene.step(1000.0 / 60.0) // assume steady 60fps
        // scene.step(1)
        labelTotalEnergy.textContent = scene.kineticEnergy().toFixed(10)
        labelNumTests.textContent = `${scene.numTests()}`
        labelNumObject.textContent = `${scene.numObjects()}`

        const w = canvas.clientWidth
        const h = canvas.clientHeight
        corners[1].x = w
        corners[2].x = w
        corners[2].y = h
        corners[3].y = h
        canvas.width = w * devicePixelRatio
        canvas.height = h * devicePixelRatio
        context.save()
        context.scale(devicePixelRatio, devicePixelRatio)
        scene.wireframe(context)
        context.restore()
        if (scene.running) {
            requestAnimationFrame(nextFrame)
        }
    }
    requestAnimationFrame(nextFrame)

    // prevent dragging entire document on mobile
    document.addEventListener('touchmove', (event: TouchEvent) => event.preventDefault(), {passive: false})
    document.addEventListener('dblclick', (event: Event) => event.preventDefault(), {passive: false})
    const resize = () => document.body.style.height = `${window.innerHeight}px`
    window.addEventListener("resize", resize)
    resize()
    requestAnimationFrame(() => {
        document.querySelectorAll("body svg.preloader").forEach(element => element.remove())
        document.querySelectorAll("body main").forEach(element => element.classList.remove("invisible"))
    })
    console.debug("boot complete.")
})()