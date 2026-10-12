"use client";

import { Gauge } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { playRev, type RevPlan } from "@/lib/engine-audio";

/** Copy for the three camera stops. Every claim comes from the official rules. */
const STAGES = [
  {
    label: "Rear exit only",
    title: "Where the noise is made.",
    text: "The exhaust is compulsory and must be present only at the rear side of the vehicle. An end can is compulsory for all vehicles.",
  },
  {
    label: "Under the skin",
    title: "Up to 2000 cc.",
    text: "Cars with engine capacities up to 2000 cc are allowed. Every vehicle is thoroughly checked before the competition.",
  },
  {
    label: "On the meter",
    title: "Sixty seconds. No second chances.",
    text: "The decibel meter sits one metre from the exhaust outlet, and only engine revving is measured.",
  },
] as const;

/** Camera stops: angle around the car (0 = dead astern), distance, height, look-at height. */
const SHOTS = [
  { angle: 0.32, radius: 5.6, height: 0.75, look: 0.55 },
  { angle: 1.62, radius: 7.6, height: 1.05, look: 0.6 },
  { angle: 2.62, radius: 6.2, height: 1.7, look: 0.5 },
] as const;

const PAINTS = ["#F01824", "#8E99A3", "#FF5A1F"] as const;

type Api = { rev: () => void };

/**
 * Scroll-driven 3D showcase. The section is taller than the screen and its
 * stage is `position: sticky`, so the page scrolls natively while the camera
 * orbits the car — nothing is hijacked. three.js and the model load only when
 * the section approaches the viewport, and the loop runs only while visible.
 */
export function Machine() {
  const section = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const api = useRef<Api | null>(null);
  const [stage, setStage] = useState(0);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "failed">("idle");

  useEffect(() => {
    const host = section.current;
    const view = canvas.current;
    if (!host || !view) return;

    let disposed = false;
    let teardown = () => {};

    const init = async () => {
      setStatus("loading");
      try {
        const [THREE, { GLTFLoader }, { DRACOLoader }, { RoomEnvironment }] = await Promise.all([
          import("three"),
          import("three/examples/jsm/loaders/GLTFLoader.js"),
          import("three/examples/jsm/loaders/DRACOLoader.js"),
          import("three/examples/jsm/environments/RoomEnvironment.js"),
        ]);
        if (disposed) return;

        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const renderer = new THREE.WebGLRenderer({ canvas: view, antialias: true, alpha: true, powerPreference: "high-performance" });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth < 768 ? 1.5 : 2));
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 0.85;

        const scene = new THREE.Scene();
        scene.fog = new THREE.Fog(0x05070a, 9, 24);
        const pmrem = new THREE.PMREMGenerator(renderer);
        const environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
        scene.environment = environment;
        scene.environmentIntensity = 0.8;

        const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);

        // Wet-tarmac floor and a moving grid that sells the speed.
        const floor = new THREE.Mesh(
          new THREE.PlaneGeometry(80, 80),
          new THREE.MeshStandardMaterial({ color: 0x05070a, roughness: 0.62, metalness: 0.35 }),
        );
        floor.rotation.x = -Math.PI / 2;
        scene.add(floor);
        const grid = new THREE.GridHelper(40, 80, 0xc9d0d6, 0xc9d0d6);
        const gridMaterial = grid.material as InstanceType<typeof THREE.LineBasicMaterial>;
        gridMaterial.transparent = true;
        gridMaterial.opacity = 0.1;
        gridMaterial.depthWrite = false;
        grid.position.y = 0.002;
        scene.add(grid);

        const paint = new THREE.MeshPhysicalMaterial({ color: PAINTS[0], metalness: 0.9, roughness: 0.45, clearcoat: 1, clearcoatRoughness: 0.03 });
        const trim = new THREE.MeshStandardMaterial({ color: 0xc9d0d6, metalness: 1, roughness: 0.4 });
        const glass = new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 0.25, roughness: 0, transmission: 1 });

        const draco = new DRACOLoader();
        draco.setDecoderPath("/draco/");
        const loader = new GLTFLoader();
        loader.setDRACOLoader(draco);
        const gltf = await loader.loadAsync("/models/showcase-car.glb");
        if (disposed) {
          renderer.dispose();
          return;
        }

        const car = gltf.scene.children[0];
        const setMaterial = (name: string, material: InstanceType<typeof THREE.Material>) => {
          const part = car.getObjectByName(name);
          if (part && "material" in part) (part as InstanceType<typeof THREE.Mesh>).material = material;
        };
        setMaterial("body", paint);
        ["rim_fl", "rim_fr", "rim_rr", "rim_rl", "trim"].forEach((name) => setMaterial(name, trim));
        setMaterial("glass", glass);
        // The source model carries a manufacturer's badges; this is a generic showcase car, so hide them.
        ["chrome", "yellow_trim", "blue"].forEach((name) => {
          const part = car.getObjectByName(name);
          if (part) part.visible = false;
        });
        const wheels = ["wheel_fl", "wheel_fr", "wheel_rl", "wheel_rr"]
          .map((name) => car.getObjectByName(name))
          .filter((wheel) => wheel !== undefined);
        scene.add(car);

        // Exhaust fire: one GPU point cloud. Each particle ages from a blue-white core
        // through yellow and orange to dull red; sparks are small, long-lived and fall.
        const COUNT = 520;
        const positions = new Float32Array(COUNT * 3);
        const velocities = new Float32Array(COUNT * 3);
        const ages = new Float32Array(COUNT).fill(1);
        const sizes = new Float32Array(COUNT);
        const kinds = new Float32Array(COUNT);
        const born = new Float32Array(COUNT);
        const lifespans = new Float32Array(COUNT).fill(1);
        const fireGeometry = new THREE.BufferGeometry();
        fireGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        fireGeometry.setAttribute("aAge", new THREE.BufferAttribute(ages, 1));
        fireGeometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
        fireGeometry.setAttribute("aKind", new THREE.BufferAttribute(kinds, 1));
        const fireMaterial = new THREE.ShaderMaterial({
          uniforms: { uScale: { value: 1 } },
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          vertexShader: `
            attribute float aAge;
            attribute float aSize;
            attribute float aKind;
            uniform float uScale;
            varying float vAge;
            varying float vKind;
            void main() {
              vAge = aAge;
              vKind = aKind;
              vec4 mv = modelViewMatrix * vec4(position, 1.0);
              float grow = aKind > 0.5 ? 1.0 : 0.5 + aAge * 1.9;
              gl_PointSize = aAge >= 1.0 ? 0.0 : aSize * grow * uScale / -mv.z;
              gl_Position = projectionMatrix * mv;
            }`,
          fragmentShader: `
            varying float vAge;
            varying float vKind;
            void main() {
              float d = length(gl_PointCoord - 0.5) * 2.0;
              if (d > 1.0) discard;
              float soft = pow(1.0 - d, 1.7);
              if (vKind > 0.5) {
                vec3 spark = mix(vec3(1.0, 0.9, 0.6), vec3(1.0, 0.3, 0.05), vAge);
                gl_FragColor = vec4(spark, soft * (1.0 - vAge) * 1.4);
                return;
              }
              vec3 core = vec3(0.7, 0.85, 1.0);
              vec3 hot = vec3(1.0, 0.94, 0.68);
              vec3 mid = vec3(1.0, 0.44, 0.07);
              vec3 cool = vec3(0.5, 0.04, 0.02);
              vec3 color = vAge < 0.1 ? mix(core, hot, vAge / 0.1)
                : vAge < 0.42 ? mix(hot, mid, (vAge - 0.1) / 0.32)
                : mix(mid, cool, (vAge - 0.42) / 0.58);
              float fade = (1.0 - vAge) * (1.0 - vAge) * smoothstep(0.0, 0.04, vAge);
              gl_FragColor = vec4(color, soft * fade * 0.5);
            }`,
        });
        const fire = new THREE.Points(fireGeometry, fireMaterial);
        fire.frustumCulled = false;
        scene.add(fire);
        const flameLight = new THREE.PointLight(0xff5a1f, 0, 8, 1.6);
        flameLight.position.set(0, 0.45, REAR_Z * 1.2);
        scene.add(flameLight);

        const tail = Math.sign(REAR_Z);
        const PIPES = [-0.11, 0, 0.11];
        let cursor = 0;
        /** Spawns `n` particles. kind 0 = flame, 1 = spark. */
        const emit = (n: number, power: number, kind: 0 | 1) => {
          for (let k = 0; k < n; k++) {
            cursor = (cursor + 1) % COUNT;
            const p = cursor * 3;
            positions[p] = PIPES[Math.floor(Math.random() * 3)] + (Math.random() - 0.5) * 0.03;
            positions[p + 1] = 0.33 + (Math.random() - 0.5) * 0.03;
            positions[p + 2] = REAR_Z + tail * 0.02;
            if (kind === 0) {
              velocities[p] = (Math.random() - 0.5) * 0.5 * power;
              velocities[p + 1] = (Math.random() - 0.25) * 0.55;
              velocities[p + 2] = tail * (2.6 + Math.random() * 3.4) * power;
              lifespans[cursor] = (0.16 + Math.random() * 0.3) * (0.7 + power * 0.35);
              sizes[cursor] = 0.15 + Math.random() * 0.17;
            } else {
              velocities[p] = (Math.random() - 0.5) * 2.2;
              velocities[p + 1] = 0.4 + Math.random() * 2;
              velocities[p + 2] = tail * (2.5 + Math.random() * 5);
              lifespans[cursor] = 0.5 + Math.random() * 0.7;
              sizes[cursor] = 0.03 + Math.random() * 0.025;
            }
            kinds[cursor] = kind;
            born[cursor] = 0;
            ages[cursor] = 0;
          }
        };
        const stepFire = (dt: number) => {
          for (let k = 0; k < COUNT; k++) {
            if (ages[k] >= 1) continue;
            born[k] += dt;
            const age = born[k] / lifespans[k];
            if (age >= 1) {
              ages[k] = 1;
              continue;
            }
            ages[k] = age;
            const p = k * 3;
            if (kinds[k] === 0) {
              const drag = Math.max(0, 1 - 3.6 * dt);
              velocities[p] *= drag;
              velocities[p + 2] *= drag;
              velocities[p + 1] += 1.7 * dt;
            } else {
              velocities[p + 1] -= 6.5 * dt;
              if (positions[p + 1] < 0.02 && velocities[p + 1] < 0) velocities[p + 1] *= -0.35;
            }
            positions[p] += velocities[p] * dt;
            positions[p + 1] += velocities[p + 1] * dt;
            positions[p + 2] += velocities[p + 2] * dt;
          }
          fireGeometry.attributes.position.needsUpdate = true;
          fireGeometry.attributes.aAge.needsUpdate = true;
          fireGeometry.attributes.aSize.needsUpdate = true;
          fireGeometry.attributes.aKind.needsUpdate = true;
        };

        const colors = PAINTS.map((hex) => new THREE.Color(hex));
        const target = new THREE.Vector3();
        let progress = 0;
        let smooth = -1;
        // The rev currently playing: its timing drives throttle level, flames and backfires.
        let plan: RevPlan | null = null;
        let planStart = 0;
        let nextPop = 0;
        let level = 0;
        let flash = 0;
        let flameDebt = 0;
        let sparkDebt = 0;
        let seen = 0;
        let greeted = false;
        const startRev = () => {
          if (plan) return;
          plan = playRev();
          planStart = performance.now();
          nextPop = 0;
        };
        let travelled = 0;
        let frame = 0;
        let visible = false;
        let last = performance.now();
        let currentStage = -1;

        const resize = () => {
          const { clientWidth: w, clientHeight: h } = view;
          if (!w || !h) return;
          renderer.setSize(w, h, false);
          camera.aspect = w / h;
          // Wide screens: nudge the car right and up so the caption has room. Phones: lift it above the text.
          if (w > h) camera.setViewOffset(w, h, -w * 0.08, h * 0.09, w, h);
          else camera.setViewOffset(w, h, 0, h * 0.2, w, h);
          camera.updateProjectionMatrix();
          // Converts particle sizes from world units to pixels.
          fireMaterial.uniforms.uScale.value = renderer.domElement.height / (2 * Math.tan((camera.fov * Math.PI) / 360));
        };

        const tick = (now: number) => {
          const dt = Math.min((now - last) / 1000, 0.05);
          last = now;

          const rect = host.getBoundingClientRect();
          progress = Math.min(1, Math.max(0, -rect.top / Math.max(1, rect.height - window.innerHeight)));
          smooth = smooth < 0 ? progress : smooth + (progress - smooth) * Math.min(1, dt * 4);

          // Blend between the camera stops and paint colours.
          const scaled = smooth * (SHOTS.length - 1);
          const i = Math.min(SHOTS.length - 2, Math.floor(scaled));
          const raw = scaled - i;
          const t = raw * raw * (3 - 2 * raw);
          const a = SHOTS[i];
          const b = SHOTS[i + 1];
          const mix = (x: number, y: number) => x + (y - x) * t;
          const narrow = camera.aspect < 1 ? 2.05 : 1;
          const angle = mix(a.angle, b.angle);
          const radius = mix(a.radius, b.radius) * narrow;
          const shake = reduce ? 0 : level * 0.03 + flash * 0.06;
          camera.position.set(
            Math.sin(angle) * radius + (Math.random() - 0.5) * shake,
            mix(a.height, b.height) * (narrow > 1 ? 1.25 : 1) + (Math.random() - 0.5) * shake,
            Math.cos(angle) * radius * Math.sign(REAR_Z),
          );
          target.set(0, mix(a.look, b.look), 0);
          camera.lookAt(target);
          paint.color.lerpColors(colors[i], colors[i + 1], t);

          const nextStage = Math.min(STAGES.length - 1, Math.round(scaled));
          if (nextStage !== currentStage) {
            currentStage = nextStage;
            setStage(nextStage);
          }

          // Rolling road.
          if (!reduce) {
            travelled += dt * (5 + level * 10);
            grid.position.z = (travelled % 0.5) * Math.sign(REAR_Z);
            wheels.forEach((wheel) => {
              wheel.rotation.x = -travelled * 3 * Math.sign(REAR_Z);
            });
          }

          // First arrival: let it clear its throat once.
          seen += dt;
          if (!greeted && !reduce && seen > 0.9 && progress < 0.2) {
            greeted = true;
            startRev();
          }

          // Follow the rev: throttle level from its bursts, a fireball on every backfire.
          let throttle = 0;
          if (plan) {
            const elapsed = (now - planStart) / 1000;
            for (const [from, to, strength] of plan.bursts) {
              if (elapsed < from || elapsed > to + 0.3) continue;
              const envelope = elapsed < to ? Math.min(1, (elapsed - from) / 0.08) : 1 - (elapsed - to) / 0.3;
              throttle = Math.max(throttle, envelope * strength);
            }
            while (nextPop < plan.pops.length && elapsed >= plan.pops[nextPop]) {
              emit(30, 1.55, 0);
              emit(12, 1, 1);
              flash = 1;
              nextPop++;
            }
            if (elapsed > plan.duration) plan = null;
          }
          level = throttle;
          flash = Math.max(0, flash - dt * 6);

          flameDebt += level * level * 560 * dt;
          sparkDebt += level * 26 * dt;
          const flameCount = Math.floor(flameDebt);
          const sparkCount = Math.floor(sparkDebt);
          flameDebt -= flameCount;
          sparkDebt -= sparkCount;
          if (flameCount) emit(flameCount, 0.55 + level * 0.75, 0);
          if (sparkCount) emit(sparkCount, 1, 1);
          stepFire(dt);

          flameLight.intensity = level * 9 + flash * 26;
          car.rotation.x = (level * 0.012 + flash * 0.006) * tail;

          renderer.render(scene, camera);
          frame = requestAnimationFrame(tick);
        };

        const run = () => {
          cancelAnimationFrame(frame);
          if (visible && !document.hidden) {
            last = performance.now();
            frame = requestAnimationFrame(tick);
          }
        };
        const watcher = new IntersectionObserver(([entry]) => {
          visible = entry.isIntersecting;
          run();
        });
        const sizer = new ResizeObserver(resize);

        resize();
        watcher.observe(host);
        sizer.observe(view);
        document.addEventListener("visibilitychange", run);
        api.current = { rev: startRev };
        setStatus("ready");

        teardown = () => {
          cancelAnimationFrame(frame);
          watcher.disconnect();
          sizer.disconnect();
          document.removeEventListener("visibilitychange", run);
          api.current = null;
          scene.traverse((object) => {
            const mesh = object as InstanceType<typeof THREE.Mesh>;
            mesh.geometry?.dispose();
            const material = mesh.material;
            (Array.isArray(material) ? material : material ? [material] : []).forEach((m) => m.dispose());
          });
          environment.dispose();
          pmrem.dispose();
          draco.dispose();
          renderer.dispose();
        };
        if (disposed) teardown();
      } catch (error) {
        console.error("[machine]", error);
        if (!disposed) setStatus("failed");
      }
    };

    // Start loading a screen or so before the section arrives.
    const approach = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        approach.disconnect();
        void init();
      },
      { rootMargin: "900px 0px" },
    );
    approach.observe(host);

    return () => {
      disposed = true;
      approach.disconnect();
      teardown();
    };
  }, []);

  const onRev = () => api.current?.rev();

  const current = STAGES[stage];

  return (
    <section ref={section} id="machine" aria-label="3D car showcase" className="relative h-[260svh] scroll-mt-0 border-y border-silver/10 bg-obsidian">
      <div className="sticky top-0 h-svh overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_62%,rgb(28_38_48/0.9),transparent_62%)]" aria-hidden="true" />
        <canvas ref={canvas} className="absolute inset-0 size-full" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-obsidian to-transparent" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-obsidian via-obsidian/70 to-transparent" aria-hidden="true" />

        <div className="relative mx-auto flex h-full max-w-[1600px] flex-col justify-between px-5 pb-8 pt-24 sm:px-8 lg:px-12 lg:pb-12">
          <div className="flex items-start justify-between gap-6">
            <p className="label-tech flex items-center gap-4 text-silver/70">
              <span className="h-px w-10 bg-fire" aria-hidden="true" />
              The machine
            </p>
            <ol className="label-tech flex gap-3 text-[0.625rem]" aria-hidden="true">
              {STAGES.map((item, i) => (
                <li key={item.label} className={`transition-colors duration-500 ${i === stage ? "text-fire" : "text-silver/30"}`}>
                  0{i + 1}
                </li>
              ))}
            </ol>
          </div>

          {status !== "ready" && (
            <p className="label-tech absolute left-1/2 top-1/2 -translate-x-1/2 text-[0.625rem] text-silver/50" role="status">
              {status === "failed" ? "3D view unavailable on this device" : "Warming up…"}
            </p>
          )}

          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div key={stage} className="anim-stage max-w-xl">
              <p className="label-tech text-fire">{current.label}</p>
              <h2 className="display mt-3 text-[clamp(2.5rem,6.5vw,5.5rem)] text-paper">{current.title}</h2>
              <p className="mt-4 max-w-md text-base leading-relaxed text-silver sm:text-lg">{current.text}</p>
            </div>
            <div className="flex shrink-0 flex-col items-start gap-3 md:mb-16 md:items-end">
              <button
                type="button"
                onClick={onRev}
                disabled={status !== "ready"}
                className="label-tech group flex items-center gap-3 bg-fire px-6 py-4 font-semibold text-obsidian transition-colors hover:bg-paper active:bg-racing active:text-paper disabled:opacity-40"
              >
                <Gauge className="size-4" aria-hidden="true" />
                Rev the engine
              </button>
              <p className="label-tech text-[0.5625rem] leading-relaxed text-silver/40 md:text-right">
                Illustration · 3D model by vicent091036
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Z coordinate of the tail in model space (sign = which way the car points). */
const REAR_Z = 2.25;
