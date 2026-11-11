import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import dnaModelUrl from '../assets/DNAcolored.glb';

interface ThreeDnaCanvasProps {
  className?: string;
  variant?: 'hero' | 'card' | 'minimal';
  interactive?: boolean;
}

export const ThreeDnaCanvas: React.FC<ThreeDnaCanvasProps> = ({
  className = '',
  variant = 'hero',
  interactive = true,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const mousePosRef = useRef<{ x: number; y: number; targetX: number; targetY: number }>({
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
  });

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = container.clientWidth || (variant === 'card' ? 320 : 640);
    let height = container.clientHeight || (variant === 'card' ? 240 : 540);

    // 1. Software WebGL Guard (mandatory Three.js directive)
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // 2. Renderer setup
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.appendChild(renderer.domElement);

    // 3. Scene & Camera setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      variant === 'card' ? 42 : 45,
      width / height,
      0.1,
      100
    );
    camera.position.set(0, 0, variant === 'card' ? 9.5 : 8.2);

    // 4. Studio Environment
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 5. Lighting Rig
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.4);
    keyLight.position.set(4, 5, 5);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xa855f7, 2.0);
    fillLight.position.set(-4, -3, 3);
    scene.add(fillLight);

    const cyanLight = new THREE.DirectionalLight(0x00e5ff, 1.8);
    cyanLight.position.set(0, -4, 4);
    scene.add(cyanLight);

    const hemiLight = new THREE.HemisphereLight(0x38bdf8, 0x0f172a, 1.4);
    scene.add(hemiLight);

    // 6. DNA Group Pivot
    const dnaGroup = new THREE.Group();
    scene.add(dnaGroup);

    let loadedModel: THREE.Group | null = null;

    // Load DNAcolored.glb
    const loader = new GLTFLoader();
    const modelSource = dnaModelUrl || `${import.meta.env.BASE_URL}DNAcolored.glb`;

    loader.load(
      modelSource,
      (gltf) => {
        loadedModel = gltf.scene;

        // Calculate bounding box and center pivot at (0, 0, 0)
        const box = new THREE.Box3().setFromObject(loadedModel);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        loadedModel.position.x = -center.x;
        loadedModel.position.y = -center.y;
        loadedModel.position.z = -center.z;

        // Target height depending on viewport variant
        const targetHeight = variant === 'card' ? 7.2 : 9.0;
        const scale = targetHeight / Math.max(size.y, 0.001);

        const modelWrapper = new THREE.Group();
        modelWrapper.add(loadedModel);
        modelWrapper.scale.setScalar(scale);

        // Enhance materials
        loadedModel.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            if (mesh.material) {
              const mat = mesh.material as THREE.MeshStandardMaterial;
              mat.roughness = Math.min(mat.roughness ?? 0.5, 0.35);
              mat.metalness = Math.max(mat.metalness ?? 0, 0.15);
              if (mat.color) {
                // Subtle glow to enhance contrast on dark backgrounds
                mat.emissive = mat.color.clone().multiplyScalar(0.2);
              }
            }
          }
        });

        dnaGroup.add(modelWrapper);
      },
      undefined,
      (err) => {
        console.warn('Failed to load DNAcolored.glb, attempting fallback URL:', err);
        // Fallback attempt from public path
        loader.load(
          `${import.meta.env.BASE_URL}DNAcolored.glb`,
          (gltf) => {
            loadedModel = gltf.scene;
            const box = new THREE.Box3().setFromObject(loadedModel);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            loadedModel.position.sub(center);
            const targetHeight = variant === 'card' ? 7.2 : 9.0;
            const scale = targetHeight / Math.max(size.y, 0.001);
            const modelWrapper = new THREE.Group();
            modelWrapper.add(loadedModel);
            modelWrapper.scale.setScalar(scale);
            dnaGroup.add(modelWrapper);
          },
          undefined,
          (err2) => {
            console.error('All attempts to load DNA model failed:', err2);
          }
        );
      }
    );

    // 7. Ambient Molecular Floating Dust Particles
    const particleCount = variant === 'card' ? 70 : 140;
    const particleGeom = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    const c1 = new THREE.Color(0x00e5ff);
    const c2 = new THREE.Color(0xa855f7);

    for (let p = 0; p < particleCount; p++) {
      const idx = p * 3;
      particlePositions[idx] = (Math.random() - 0.5) * 8;
      particlePositions[idx + 1] = (Math.random() - 0.5) * 12;
      particlePositions[idx + 2] = (Math.random() - 0.5) * 6;

      const mixed = Math.random() > 0.5 ? c1 : c2;
      particleColors[idx] = mixed.r;
      particleColors[idx + 1] = mixed.g;
      particleColors[idx + 2] = mixed.b;
    }

    particleGeom.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeom.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: variant === 'card' ? 0.07 : 0.09,
      vertexColors: true,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeom, particleMat);
    scene.add(particles);

    // Initial orientation
    dnaGroup.rotation.z = 0.28;
    dnaGroup.rotation.x = 0.12;

    // Pointer interaction handler
    const handlePointerMove = (e: MouseEvent) => {
      if (!interactive) return;
      const rect = container.getBoundingClientRect();
      const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const normY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mousePosRef.current.targetX = normX * 0.45;
      mousePosRef.current.targetY = normY * 0.35;
    };

    if (interactive) {
      window.addEventListener('mousemove', handlePointerMove);
    }

    // 8. Continuous loop with Software WebGL afterDraw guard
    let frameId = 0;
    const clock = new THREE.Clock();

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function tick() {
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Continuous subtle helix rotation
      dnaGroup.rotation.y += delta * 0.45;

      // Interactive mouse damping
      mousePosRef.current.x += (mousePosRef.current.targetX - mousePosRef.current.x) * 0.05;
      mousePosRef.current.y += (mousePosRef.current.targetY - mousePosRef.current.y) * 0.05;

      dnaGroup.rotation.x = 0.12 + mousePosRef.current.y * 0.5;
      dnaGroup.rotation.z = 0.28 + mousePosRef.current.x * 0.4;

      // Gentle vertical floating breathing motion
      dnaGroup.position.y = Math.sin(time * 0.8) * 0.15;

      // Ambient particle slow orbit
      particles.rotation.y = time * 0.05;

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    tick();

    // Resize observer for responsive layout
    const resizeObserver = new ResizeObserver(() => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w > 0 && h > 0) {
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
    });
    resizeObserver.observe(container);

    // Clean up
    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      if (interactive) {
        window.removeEventListener('mousemove', handlePointerMove);
      }
      resizeObserver.disconnect();

      // Dispose loaded model resources
      if (loadedModel) {
        loadedModel.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const m = child as THREE.Mesh;
            m.geometry?.dispose();
            if (Array.isArray(m.material)) {
              m.material.forEach((mat) => mat.dispose());
            } else if (m.material) {
              m.material.dispose();
            }
          }
        });
      }

      particleGeom.dispose();
      particleMat.dispose();
      renderer.dispose();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [variant, interactive]);

  return (
    <div
      ref={mountRef}
      className={`relative w-full h-full overflow-hidden pointer-events-none select-none ${className}`}
      style={{ minHeight: variant === 'card' ? '180px' : '400px' }}
    />
  );
};
