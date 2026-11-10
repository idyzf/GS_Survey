import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

interface ThreeDnaCanvasProps {
  className?: string;
  variant?: 'hero' | 'card' | 'minimal';
  interactive?: boolean;
}

// Module-level reusable math objects for zero garbage collection
const _vec3A = new THREE.Vector3();
const _vec3B = new THREE.Vector3();
const _vec3Mid = new THREE.Vector3();

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
    renderer.toneMappingExposure = 1.15;
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
    const keyLight = new THREE.DirectionalLight(0x00e5ff, 2.2);
    keyLight.position.set(4, 5, 5);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xa855f7, 1.8);
    fillLight.position.set(-4, -3, 3);
    scene.add(fillLight);

    const hemiLight = new THREE.HemisphereLight(0x38bdf8, 0x0f172a, 1.2);
    scene.add(hemiLight);

    // 6. Build Procedural DNA Double Helix Group
    const dnaGroup = new THREE.Group();
    scene.add(dnaGroup);

    // Parameters for DNA geometry
    const turns = variant === 'card' ? 2.5 : 3.2;
    const heightSpan = variant === 'card' ? 9.0 : 11.0;
    const radius = variant === 'card' ? 1.4 : 1.7;
    const rungCount = variant === 'card' ? 34 : 46;

    // Materials
    const backboneMatCyan = new THREE.MeshStandardMaterial({
      color: 0x00e5ff,
      roughness: 0.25,
      metalness: 0.85,
      emissive: 0x005577,
      emissiveIntensity: 0.35,
    });

    const backboneMatMagenta = new THREE.MeshStandardMaterial({
      color: 0xd946ef,
      roughness: 0.25,
      metalness: 0.85,
      emissive: 0x661155,
      emissiveIntensity: 0.35,
    });

    const sphereGeom = new THREE.SphereGeometry(variant === 'card' ? 0.16 : 0.19, 16, 16);
    const rungCylinderGeom = new THREE.CylinderGeometry(0.045, 0.045, 1, 12);
    rungCylinderGeom.translate(0, 0.5, 0);
    rungCylinderGeom.rotateX(Math.PI / 2);

    // Nucleotide base pair palette (Adenine, Thymine, Cytosine, Guanine)
    const baseColors = [
      { color: 0x00e5ff, emissive: 0x0088aa }, // A (Cyan)
      { color: 0xa855f7, emissive: 0x581c87 }, // T (Purple)
      { color: 0x38bdf8, emissive: 0x0284c7 }, // C (Sky)
      { color: 0xf43f5e, emissive: 0xbe123c }, // G (Rose)
    ];

    const baseMaterials = baseColors.map(
      (c) =>
        new THREE.MeshStandardMaterial({
          color: c.color,
          roughness: 0.3,
          metalness: 0.6,
          emissive: c.emissive,
          emissiveIntensity: 0.45,
        })
    );

    // Construct the double helix backbone spheres and rungs
    for (let i = 0; i < rungCount; i++) {
      const t = i / (rungCount - 1);
      const y = (t - 0.5) * heightSpan;
      const angle = t * Math.PI * 2 * turns;

      const x1 = Math.cos(angle) * radius;
      const z1 = Math.sin(angle) * radius;

      const x2 = Math.cos(angle + Math.PI) * radius;
      const z2 = Math.sin(angle + Math.PI) * radius;

      // Backbone node 1 (Strand A)
      const nodeA = new THREE.Mesh(sphereGeom, backboneMatCyan);
      nodeA.position.set(x1, y, z1);
      dnaGroup.add(nodeA);

      // Backbone node 2 (Strand B)
      const nodeB = new THREE.Mesh(sphereGeom, backboneMatMagenta);
      nodeB.position.set(x2, y, z2);
      dnaGroup.add(nodeB);

      // Connecting Base-pair Rung (divided into 2 halves with distinct nucleotide colors)
      _vec3A.set(x1, y, z1);
      _vec3B.set(x2, y, z2);
      _vec3Mid.lerpVectors(_vec3A, _vec3B, 0.5);

      const matIndex1 = i % 4;
      const matIndex2 = (i + 2) % 4;

      // Half 1
      const halfRung1 = new THREE.Mesh(rungCylinderGeom, baseMaterials[matIndex1]);
      halfRung1.position.copy(_vec3A);
      halfRung1.lookAt(_vec3Mid);
      const dist1 = _vec3A.distanceTo(_vec3Mid);
      halfRung1.scale.set(1, 1, dist1);
      dnaGroup.add(halfRung1);

      // Center bond sphere
      const bondSphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.08, 12, 12),
        new THREE.MeshStandardMaterial({
          color: 0xffffff,
          roughness: 0.2,
          metalness: 0.9,
          emissive: 0x93c5fd,
          emissiveIntensity: 0.6,
        })
      );
      bondSphere.position.copy(_vec3Mid);
      dnaGroup.add(bondSphere);

      // Half 2
      const halfRung2 = new THREE.Mesh(rungCylinderGeom, baseMaterials[matIndex2]);
      halfRung2.position.copy(_vec3Mid);
      halfRung2.lookAt(_vec3B);
      const dist2 = _vec3Mid.distanceTo(_vec3B);
      halfRung2.scale.set(1, 1, dist2);
      dnaGroup.add(halfRung2);
    }

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
    let clock = new THREE.Clock();

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
      dnaGroup.rotation.y += delta * 0.42;

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
      sphereGeom.dispose();
      rungCylinderGeom.dispose();
      backboneMatCyan.dispose();
      backboneMatMagenta.dispose();
      baseMaterials.forEach((m) => m.dispose());
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
