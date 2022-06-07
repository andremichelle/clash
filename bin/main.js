var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { FixedPoint, MovingCircle } from "./clash/objects.js";
import { Scene } from "./clash/scene.js";
import { Vector } from "./clash/vector.js";
import { Boot, preloadImagesOfCssFile } from "./lib/boot.js";
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
    const Scenes = [
        () => {
            for (let i = 0; i < 100; i++) {
                const radius = random.nextDouble(4.0, 32.0);
                const mass = radius * radius;
                const x = random.nextDouble(radius, window.innerWidth - radius);
                const y = random.nextDouble(radius, window.innerHeight - radius);
                const object = new MovingCircle(mass, x, y, radius);
                object.velocity.x = random.nextDouble(-0.25, 0.25);
                object.velocity.y = random.nextDouble(-0.25, 0.25);
                scene.add(object);
            }
            scene.add(new MovingCircle(Number.POSITIVE_INFINITY, 400, 300, 32));
            scene.add(new FixedPoint(new Vector(600, 300)));
        },
        () => {
            const circleA = new MovingCircle(100.0, 300.0, 300.0, 32);
            const circleB = new MovingCircle(100.0, 500.0 - 32.0, 300.0, 32);
            const circleC = new MovingCircle(100.0, 500.0 + 32.0, 300.0, 32);
            const circleD = new MovingCircle(100.0, 700.0, 300.0, 32);
            circleA.velocity.x = 1.5;
            circleD.velocity.x = -1;
            scene.add(circleA, circleB, circleC, circleD);
        },
        () => {
            const a = new MovingCircle(100.0, 500.0, 300.0, 32);
            scene.add(a);
        }
    ];
    Scenes[0]();
    const canvas = HTML.query('canvas');
    const labelTotalEnergy = HTML.query('#total-energy');
    const labelNumTests = HTML.query('#num-tests');
    const labelNumObject = HTML.query('#num-objects');
    const context = canvas.getContext('2d');
    const nextFrame = () => {
        scene.step(1000.0 / 60.0);
        labelTotalEnergy.textContent = scene.totalEnergy().toFixed(10);
        labelNumTests.textContent = `${scene.numTests()}`;
        labelNumObject.textContent = `${scene.numObjects()}`;
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