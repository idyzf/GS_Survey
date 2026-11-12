import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import dnaModelUrl from '../assets/dna.glb?url';

type Variant = 'hero' | 'card';

const SETTINGS: Record<Variant, { fov: number; cameraZ: number; modelHeight: number; particles: number; particleSize: number; minHeight: string }> = {
  hero: { fov: 45, cameraZ: 8.2, modelHeight: 9.0, particles: 140, particleSize: 0.09, minHeight: '400px' },
  card: { fov: 42, cameraZ: 9.5, modelHeight: 7.2, particles: 70, particleSize: 0.07, minHeight: '180px' },
};

const BASE_TILT = { x: 0.12, z: 0.28 };

/** Software renderers (SwiftShader, llvmpipe…) get a cheaper, throttled render loop. */
function detectSoftwareGl(): boolean {
  const gl = document.createElement('canvas').getContext('webgl2');
  if (!gl) return true;
  const ext = gl.getExtension('WEBGL_debug_renderer_info');
  const gpu = String(gl.getParameter(ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER));
  gl.getExtension('WEBGL_lose_context')?.loseContext();
  return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
}

function createParticles(count: number, size: number): THREE.Points {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const palette = [new THREE.Color(0x00e5ff), new THREE.Color(0xa855f7)];

  for (let i = 0; i < count * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 8;
    positions[i + 1] = (Math.random() - 0.5) * 12;
    positions[i + 2] = (Math.random() - 0.5) * 6;
    const color = palette[Math.random() > 0.5 ? 0 : 1];
    colors.set([color.r, color.g, color.b], i);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const material = new THREE.PointsMaterial({
    size,
    vertexColors: true,
    transparent: true,
    opacity: 0.65,
    blending: THREE.AdditiveBlending,
  });
  return new THREE.Points(geometry, material);
}

/** Centers and scales the glTF model and boosts its materials for dark backgrounds. */
function prepareModel(model: THREE.Object3D, targetHeight: number): THREE.Group {
  const box = new THREE.Box3().setFromObject(model);
  model.position.sub(box.getCenter(new THREE.Vector3()));

  model.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (!mesh.isMesh || !mesh.material) return;
    const mat = mesh.material as THREE.MeshStandardMaterial;
    mat.roughness = Math.min(mat.roughness ?? 0.5, 0.35);
    mat.metalness = Math.max(mat.metalness ?? 0, 0.15);
    if (mat.color) mat.emissive = mat.color.clone().multiplyScalar(0.2);
  });

  const wrapper = new THREE.Group();
  wrapper.add(model);
  wrapper.scale.setScalar(targetHeight / Math.max(box.getSize(new THREE.Vector3()).y, 0.001));
  return wrapper;
}

function disposeObject(root: THREE.Object3D): void {
  root.traverse((child) => {
    const obj = child as THREE.Mesh | THREE.Points;
    if (!obj.geometry) return;
    obj.geometry.dispose();
    const materials = Array.isArray(obj.material) ? obj.material : [obj.material];
    materials.forEach((m) => m?.dispose());
  });
}

/** Rotating 3D DNA helix that tilts toward the mouse pointer. */
export function DnaCanvas({ variant = 'hero' }: { variant?: Variant }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const settings = SETTINGS[variant];

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || (variant === 'card' ? 320 : 640);
    const height = container.clientHeight || (variant === 'card' ? 240 : 540);
    const isSoftwareGl = detectSoftwareGl();

    const renderer = new THREE.WebGLRenderer({ antialias: !isSoftwareGl, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(settings.fov, width / height, 0.1, 100);
    camera.position.set(0, 0, settings.cameraZ);

    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    const lights: [THREE.Light, [number, number, number]?][] = [
      [new THREE.DirectionalLight(0xffffff, 2.4), [4, 5, 5]],
      [new THREE.DirectionalLight(0xa855f7, 2.0), [-4, -3, 3]],
      [new THREE.DirectionalLight(0x00e5ff, 1.8), [0, -4, 4]],
      [new THREE.HemisphereLight(0x38bdf8, 0x0f172a, 1.4)],
    ];
    lights.forEach(([light, pos]) => {
      if (pos) light.position.set(...pos);
      scene.add(light);
    });

    const dnaGroup = new THREE.Group();
    dnaGroup.rotation.set(BASE_TILT.x, 0, BASE_TILT.z);
    scene.add(dnaGroup);

    let disposed = false;
    new GLTFLoader().load(
      dnaModelUrl,
      (gltf) => !disposed && dnaGroup.add(prepareModel(gltf.scene, settings.modelHeight)),
      undefined,
      (err) => console.error('Failed to load DNA model:', err)
    );

    const particles = createParticles(settings.particles, settings.particleSize);
    scene.add(particles);

    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const onPointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.targetX = (((e.clientX - rect.left) / rect.width) * 2 - 1) * 0.45;
      mouse.targetY = -(((e.clientY - rect.top) / rect.height) * 2 - 1) * 0.35;
    };
    window.addEventListener('mousemove', onPointerMove);

    let frameId = 0;
    let timeoutId = 0;
    const clock = new THREE.Clock();

    // On software GL, wait for the GPU fence before scheduling the next frame.
    const afterDraw = (cb: () => void) => {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (sync && gl.getSyncParameter(sync, gl.SYNC_STATUS) === gl.UNSIGNALED) {
          timeoutId = window.setTimeout(poll, 5);
        } else {
          gl.deleteSync(sync);
          timeoutId = window.setTimeout(cb, 80);
        }
      };
      timeoutId = window.setTimeout(poll, 5);
    };

    const tick = () => {
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;
      dnaGroup.rotation.y += delta * 0.45;
      dnaGroup.rotation.x = BASE_TILT.x + mouse.y * 0.5;
      dnaGroup.rotation.z = BASE_TILT.z + mouse.x * 0.4;
      dnaGroup.position.y = Math.sin(time * 0.8) * 0.15;
      particles.rotation.y = time * 0.05;

      renderer.render(scene, camera);
      if (isSoftwareGl) afterDraw(tick);
      else frameId = requestAnimationFrame(tick);
    };
    tick();

    const resizeObserver = new ResizeObserver(() => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w > 0 && h > 0) {
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
    });
    resizeObserver.observe(container);

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(timeoutId);
      window.removeEventListener('mousemove', onPointerMove);
      resizeObserver.disconnect();
      disposeObject(scene);
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [variant, settings]);

  return (
    <div
      ref={mountRef}
      className="relative w-full h-full overflow-hidden pointer-events-none select-none"
      style={{ minHeight: settings.minHeight }}
    />
  );
}
