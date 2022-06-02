import {MovingCircle, Scene} from "./clash/objects.js"
import {Boot, preloadImagesOfCssFile} from "./lib/boot.js"
import {HTML} from "./lib/dom.js"

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

    const circleA = new MovingCircle(64, 256, 256)
    const circleB = new MovingCircle(64, 512, 256)
    circleA.velocity.x = 1.0

    scene.movingObjects.push(circleA, circleB)

    // --- BOOT ENDS ---
    const canvas: HTMLCanvasElement = HTML.query('canvas')
    const context: CanvasRenderingContext2D = canvas.getContext('2d')
    const frame = () => {
        canvas.width = canvas.clientWidth * devicePixelRatio
        canvas.height = canvas.clientHeight * devicePixelRatio
        context.save()
        context.scale(devicePixelRatio, devicePixelRatio)
        scene.wireframe(context)

        scene.solve(1.0)

        context.restore()

    }
    requestAnimationFrame(frame)

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