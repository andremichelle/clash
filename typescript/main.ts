import {Scene} from "./clash/scene.js"
import {FixedPoint, MovingCircle} from "./clash/objects.js"
import {Vector} from "./clash/vector.js"
import {Boot, preloadImagesOfCssFile} from "./lib/boot.js"
import {ArrayUtils} from "./lib/common.js"
import {HTML} from "./lib/dom.js"
import {Mulberry32} from "./lib/math.js"

// https://martinheinz.dev/blog/15
// https://gamedevelopment.tutsplus.com/tutorials/how-to-create-a-custom-2d-physics-engine-the-core-engine--gamedev-7493

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
    const movingObjects = ArrayUtils.fill(5, () => {
        const radius = random.nextDouble(4.0, 64.0)
        return new MovingCircle(
            radius * radius,
            random.nextDouble(64, 400),
            random.nextDouble(64, 400),
            radius)
    })
    for (const object of movingObjects) {
        object.velocity.x = random.nextDouble(-0.5, 0.5)
        object.velocity.y = random.nextDouble(-0.5, 0.5)
        scene.add(object)
    }
    scene.add(new MovingCircle(Number.POSITIVE_INFINITY, 400, 300, 32))
    scene.add(new FixedPoint(new Vector(600, 300)))
    scene.compile()

    // --- BOOT ENDS ---
    const canvas: HTMLCanvasElement = HTML.query('canvas')
    const context: CanvasRenderingContext2D = canvas.getContext('2d')
    let lastTime = 0
    const nextFrame = (time) => {
        // scene.solve(Math.min(20.0, time - lastTime)) // max 20ms steps
        lastTime = time
        scene.solve(16)

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