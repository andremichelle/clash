import {FixedPoint, MovingCircle} from "./clash/objects.js"
import {Scene} from "./clash/scene.js"
import {Vector} from "./clash/vector.js"
import {Boot, preloadImagesOfCssFile} from "./lib/boot.js"
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

    scene.add(new MovingCircle(Number.POSITIVE_INFINITY, 400, 300, 32))
    scene.add(new FixedPoint(new Vector(600, 300)))
    scene.compile()

    // --- BOOT ENDS ---
    const canvas: HTMLCanvasElement = HTML.query('canvas')
    const labelTotalEnergy: HTMLCanvasElement = HTML.query('#total-energy')
    const labelNumTests: HTMLCanvasElement = HTML.query('#num-tests')
    const labelNumObject: HTMLCanvasElement = HTML.query('#num-objects')
    const context: CanvasRenderingContext2D = canvas.getContext('2d')
    const nextFrame = () => {
        scene.solve(1000.0 / 60.0) // assume steady 60fps
        labelTotalEnergy.textContent = scene.totalEnergy().toFixed(12)
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