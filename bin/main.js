var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Scene } from "./clash/scene.js";
import { MovingCircle } from "./clash/shapes.js";
import { Boot, preloadImagesOfCssFile } from "./lib/boot.js";
import { ArrayUtils } from "./lib/common.js";
import { HTML } from "./lib/dom.js";
import { Mulberry32 } from "./lib/math.js";
const showProgress = (() => {
    const progress = document.querySelector("svg.preloader");
    window.onerror = () => progress.classList.add("error");
    window.onunhandledrejection = () => progress.classList.add("error");
    return (percentage) => progress.style.setProperty("--percentage", percentage.toFixed(2));
})();
(() => __awaiter(void 0, void 0, void 0, function* () {
    console.debug("booting...");
    const boot = new Boot();
    boot.addObserver(boot => showProgress(boot.normalizedPercentage()));
    boot.registerProcess(preloadImagesOfCssFile("./bin/main.css"));
    yield boot.waitForCompletion();
    const scene = new Scene();
    const corners = scene.frame(0.0, 0.0, 0.0, 0.0);
    const random = new Mulberry32();
    const movingObjects = ArrayUtils.fill(50, () => {
        const radius = random.nextDouble(4.0, 64.0);
        return new MovingCircle(radius * radius, random.nextDouble(64, 400), random.nextDouble(64, 400), radius);
    });
    for (const object of movingObjects) {
        object.velocity.x = random.nextDouble(-0.5, 0.5);
        object.velocity.y = random.nextDouble(-0.5, 0.5);
        scene.add(object);
    }
    scene.add(new MovingCircle(Number.POSITIVE_INFINITY, 400, 300, 32));
    scene.compile();
    const canvas = HTML.query('canvas');
    const context = canvas.getContext('2d');
    let lastTime = 0;
    const nextFrame = (time) => {
        lastTime = time;
        scene.solve(16);
        const w = canvas.clientWidth;
        const h = canvas.clientHeight;
        corners[1].x = w;
        corners[2].x = w;
        corners[2].y = h;
        corners[3].y = h;
        canvas.width = w * devicePixelRatio;
        canvas.height = h * devicePixelRatio;
        context.save();
        context.scale(devicePixelRatio, devicePixelRatio);
        scene.wireframe(context);
        context.restore();
        if (scene.running) {
            requestAnimationFrame(nextFrame);
        }
    };
    requestAnimationFrame(nextFrame);
    document.addEventListener('touchmove', (event) => event.preventDefault(), { passive: false });
    document.addEventListener('dblclick', (event) => event.preventDefault(), { passive: false });
    const resize = () => document.body.style.height = `${window.innerHeight}px`;
    window.addEventListener("resize", resize);
    resize();
    requestAnimationFrame(() => {
        document.querySelectorAll("body svg.preloader").forEach(element => element.remove());
        document.querySelectorAll("body main").forEach(element => element.classList.remove("invisible"));
    });
    console.debug("boot complete.");
}))();
//# sourceMappingURL=main.js.map