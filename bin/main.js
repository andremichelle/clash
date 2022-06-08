var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { FixedPolygonBuilder } from "./clash/composite.js";
import { FixedCircle, FixedLine, MovingCircle, Outline, CircleSegment } from "./clash/objects.js";
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
                const radius = random.nextInt(4.0, 32.0);
                const mass = radius * radius;
                const x = random.nextInt(radius, window.innerWidth - radius);
                const y = random.nextInt(radius, window.innerHeight - radius);
                const object = new MovingCircle(mass, x, y, radius);
                object.velocity.x = random.nextDouble(-0.25, 0.25);
                object.velocity.y = random.nextDouble(-0.25, 0.25);
                scene.add(object);
            }
            scene.addComposite(new FixedPolygonBuilder()
                .addCoordinate(300, 100)
                .addCoordinate(700, 200)
                .addCoordinate(600, 500)
                .addCoordinate(240, 400)
                .close()
                .build());
            scene.add(new FixedCircle(new Vector(800, 400), 64));
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
            const ca = new MovingCircle(100.0, 100.0, 500.0, 32);
            const cb = new MovingCircle(100.0, 200.0, 300.0, 32);
            ca.velocity.y = -1;
            cb.velocity.y = 1;
            const ga = new FixedLine(new Vector(0, 400), new Vector(500, 400));
            scene.add(ca, ga, cb);
        },
        () => {
            const ca = new MovingCircle(16 * 16, 300.0, 300.0, 16);
            const cb = new MovingCircle(32 * 32, 300.0, 600.0, 32);
            const cc = new MovingCircle(32 * 32, 200.0, 200.0, 32);
            const outer = new FixedCircle(new Vector(300, 500), 64);
            const inner = new FixedCircle(new Vector(300, 500), 256);
            ca.velocity.x = 0.5;
            cb.velocity.y = 0.5;
            cc.velocity.x = 0.5;
            cc.velocity.y = 1.5;
            scene.add(ca, cb, cc, outer, inner);
        },
        () => {
            const moving = new MovingCircle(16 * 16, 400.0, 300.0, 16);
            const fixed = new FixedCircle(new Vector(400, 500), 256, Outline.Both, new CircleSegment(Math.PI, Math.PI));
            moving.velocity.x = 1.5;
            moving.velocity.y = 0.5;
            scene.add(moving, fixed);
        }
    ];
    Scenes[0]();
    scene.deserialize(scene.serialize());
    const canvas = HTML.query('canvas');
    const labelTotalEnergy = HTML.query('#total-energy');
    const labelNumTests = HTML.query('#num-tests');
    const labelMaxSteps = HTML.query('#max-steps');
    const labelNumObject = HTML.query('#num-objects');
    const context = canvas.getContext('2d');
    setInterval(() => labelMaxSteps.textContent = `${scene.getResetMaxIterations()}`, 1000);
    const nextFrame = () => {
        scene.step(1000.0 / 60.0);
        labelTotalEnergy.textContent = scene.kineticEnergy().toFixed(10);
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