import * as THREE from 'three';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { useRef, useEffect, useCallback, useMemo, useState, Suspense, Component } from 'react';

/**
 * Error boundary to catch any Canvas-specific rendering errors gracefully
 */
class SceneErrorBoundary extends Component {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error, info) {
    console.error('3D Scene Error:', error, info);
  }
  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

/**
 * Hook that watches `prefers-reduced-motion` and returns a boolean.
 */
function useReducedMotion() {
  const [reduced, setReduced] = useState(
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e) => setReduced(e.matches);
    setReduced(mq.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return reduced;
}

/**
 * Floating dust/bokeh particles - orbiting in 3D volume
 */
function AmbientParticles({ count = 28 }) {
  const pointsRef = useRef(null);
  const reducedMotion = useReducedMotion();

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const r = 2.0 + Math.random() * 2.5;
      pos[i * 3]     = Math.cos(theta) * r;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 5.0;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 2.5;
    }
    return pos;
  }, [count]);

  useFrame((state) => {
    if (!pointsRef.current || reducedMotion) return;
    const t = state.clock.getElapsedTime() * 0.08;
    pointsRef.current.rotation.y = t;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        color="#c8872a"
        transparent
        opacity={0.55}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

/**
 * GLSL Vertex & Fragment Shaders for 3D Depth Displacement Holographic Model
 */
const HologramShader = {
  vertexShader: /* glsl */ `
    uniform sampler2D uDepthMap;
    uniform float uDisplacement;
    uniform vec2 uMouse;
    
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying float vDepth;

    void main() {
      vUv = uv;
      
      // Sample depth map for 3D vertex extrusion
      float depth = texture2D(uDepthMap, uv).r;
      vDepth = depth;

      // Displace vertex along Z axis based on facial depth
      vec3 displacedPos = position;
      displacedPos.z += depth * uDisplacement;

      // Subtle dynamic 3D parallax bend
      displacedPos.x += depth * uMouse.x * 0.22;
      displacedPos.y += depth * uMouse.y * 0.18;

      // Calculate approximate normal from depth gradient for realistic lighting
      float delta = 1.0 / 128.0;
      float dR = texture2D(uDepthMap, uv + vec2(delta, 0.0)).r;
      float dL = texture2D(uDepthMap, uv - vec2(delta, 0.0)).r;
      float dU = texture2D(uDepthMap, uv + vec2(0.0, delta)).r;
      float dD = texture2D(uDepthMap, uv - vec2(0.0, delta)).r;

      vec3 normalApprox = normalize(vec3(
        (dL - dR) * uDisplacement * 2.5,
        (dD - dU) * uDisplacement * 2.5,
        1.0
      ));
      
      vNormal = normalize(normalMatrix * normalApprox);

      vec4 mvPosition = modelViewMatrix * vec4(displacedPos, 1.0);
      vViewPosition = -mvPosition.xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,

  fragmentShader: /* glsl */ `
    uniform sampler2D uTexture;
    uniform vec3 uLightColor;
    uniform float uLightIntensity;
    uniform vec2 uMouse;

    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying float vDepth;

    void main() {
      // Sample character color texture
      vec4 texColor = texture2D(uTexture, vUv);

      // Discard transparent background pixels cleanly
      if (texColor.a < 0.02) {
        discard;
      }

      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(vViewPosition);

      // Dynamic cursor-following light vector in view space
      vec3 lightDir = normalize(vec3(uMouse.x * 3.0, uMouse.y * 3.0 + 1.0, 3.5));

      // Diffuse wrap lighting (simulates warm skin subsurface bounce)
      float NdotL = dot(normal, lightDir);
      float wrapDiff = max(0.0, (NdotL + 0.35) / 1.35);

      // Specular highlight on 3D curves (glasses, nose bridge, highlights)
      vec3 halfDir = normalize(lightDir + viewDir);
      float spec = pow(max(0.0, dot(normal, halfDir)), 28.0) * 0.4 * vDepth;

      // Fresnel rim lighting around the 3D silhouette
      float fresnel = pow(1.0 - max(0.0, dot(normal, viewDir)), 3.0) * 0.3 * vDepth;
      vec3 rimColor = vec3(1.0, 0.7, 0.4);

      // Composite lighting
      vec3 ambient = vec3(0.88, 0.85, 0.82);
      vec3 diffuse = uLightColor * wrapDiff * uLightIntensity;
      vec3 lighting = ambient + diffuse + (rimColor * fresnel) + (vec3(1.0, 0.9, 0.7) * spec);

      vec3 finalRGB = texColor.rgb * lighting;

      gl_FragColor = vec4(finalRGB, texColor.a);
    }
  `
};

/**
 * 3D Depth Displaced Mesh Component
 */
function HolographicBust({ mouse }) {
  const meshRef = useRef(null);
  const materialRef = useRef(null);
  const reducedMotion = useReducedMotion();

  // Load color texture and depth map
  const colorTexture = useLoader(THREE.TextureLoader, '/hero-character.webp');
  const depthTexture = useLoader(THREE.TextureLoader, '/hero-depth.png');

  // Aspect ratio for 702x904 image
  const aspect = 702 / 904;
  const height = 5.2;
  const width = height * aspect;

  const uniforms = useMemo(() => ({
    uTexture: { value: colorTexture },
    uDepthMap: { value: depthTexture },
    uDisplacement: { value: 0.8 }, // True 3D depth extrusion
    uMouse: { value: new THREE.Vector2(0, 0) },
    uLightPos: { value: new THREE.Vector3(0, 1, 3.5) },
    uLightColor: { value: new THREE.Color('#ffb45e') },
    uLightIntensity: { value: 0.65 },
  }), [colorTexture, depthTexture]);

  useEffect(() => {
    if (colorTexture) {
      colorTexture.colorSpace = THREE.SRGBColorSpace;
      colorTexture.needsUpdate = true;
    }
  }, [colorTexture]);

  useFrame((state, delta) => {
    if (!meshRef.current || !materialRef.current) return;
    const t = state.clock.getElapsedTime();

    if (!reducedMotion) {
      // 3D physical rotation following mouse cursor
      const targetRotY = (mouse.current.x * 14 * Math.PI) / 180;
      const targetRotX = (mouse.current.y * -11 * Math.PI) / 180;

      meshRef.current.rotation.y = THREE.MathUtils.damp(
        meshRef.current.rotation.y, targetRotY, 3.5, delta
      );
      meshRef.current.rotation.x = THREE.MathUtils.damp(
        meshRef.current.rotation.x, targetRotX, 3.5, delta
      );

      // Idle breathing and floating motion
      meshRef.current.position.y = Math.sin(t * 1.6) * 0.1;
      meshRef.current.position.z = Math.sin(t * 0.9) * 0.05;

      // Update shader mouse uniforms
      materialRef.current.uniforms.uMouse.value.x = THREE.MathUtils.damp(
        materialRef.current.uniforms.uMouse.value.x, mouse.current.x, 4.0, delta
      );
      materialRef.current.uniforms.uMouse.value.y = THREE.MathUtils.damp(
        materialRef.current.uniforms.uMouse.value.y, mouse.current.y, 4.0, delta
      );
    } else {
      meshRef.current.position.y = Math.sin(t * 0.6) * 0.05;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, -0.1, 0]}>
      {/* High-density vertex grid: 128x128 = 16,384 vertices deformed in real 3D */}
      <planeGeometry args={[width, height, 128, 128]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={HologramShader.vertexShader}
        fragmentShader={HologramShader.fragmentShader}
        uniforms={uniforms}
        transparent={true}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

/**
 * Inner 3D scene
 */
function HeroScene({ mouse }) {
  return (
    <>
      <AmbientParticles count={28} />
      <HolographicBust mouse={mouse} />
    </>
  );
}

/**
 * HeroThree - renders 3D Holographic Character with Depth Map Displacement
 */
export default function HeroThree({ wrapperRef, onReady }) {
  const mouse = useRef({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e) => {
    const el = wrapperRef?.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    mouse.current = {
      x: ((e.clientX - rect.left) / rect.width) * 2 - 1,
      y: -((e.clientY - rect.top) / rect.height) * 2 + 1,
    };
  }, [wrapperRef]);

  const handleMouseLeave = useCallback(() => {
    mouse.current = { x: 0, y: 0 };
  }, []);

  useEffect(() => {
    const el = wrapperRef?.current;
    if (!el) return;
    el.addEventListener('mousemove', handleMouseMove);
    el.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      el.removeEventListener('mousemove', handleMouseMove);
      el.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [wrapperRef, handleMouseMove, handleMouseLeave]);

  const handleCreated = useCallback(() => {
    onReady?.();
  }, [onReady]);

  return (
    <SceneErrorBoundary>
      <Canvas
        camera={{ position: [0, 0, 5.8], fov: 45 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'default',
          preserveDrawingBuffer: false,
          outputColorSpace: THREE.SRGBColorSpace,
        }}
        onCreated={handleCreated}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 2,
          pointerEvents: 'none',
        }}
      >
        <Suspense fallback={null}>
          <HeroScene mouse={mouse} />
        </Suspense>
      </Canvas>
    </SceneErrorBoundary>
  );
}
