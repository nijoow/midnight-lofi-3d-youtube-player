'use client';
import {
  Suspense,
  useEffect,
  useLayoutEffect,
  useRef,
  type RefObject,
} from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Sparkles } from '@react-three/drei';
import { Vector3, type PerspectiveCamera } from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { VintageTelevision } from './VintageTelevision';
import Room from './Room';
import { Furniture } from './Furniture';
import { projectTVScreen } from '../../_lib/screen-projection';
import type { CameraView, Mood } from '../../_lib/room';

export interface VintageRoomProps {
  mood: Mood;
  camera: CameraView;
  cameraRevision: number;
  lampOn: boolean;
  focusing: boolean;
  playing: boolean;
  reducedMotion: boolean;
  lowQuality: boolean;
  active: boolean;
  screenRef: RefObject<HTMLDivElement | null>;
  onLamp: () => void;
  onFailure: () => void;
}

function ScreenProjection({ screenRef }: Pick<VintageRoomProps, 'screenRef'>) {
  const { invalidate } = useThree();
  const lastTransform = useRef('');
  useFrame(({ camera, size }) => {
    const screen = screenRef.current;
    if (!screen) return;
    camera.updateMatrixWorld();
    const transform = projectTVScreen(camera, size.width, size.height);
    if (lastTransform.current !== transform || !screen.style.transform) {
      screen.style.transform = transform;
      lastTransform.current = transform;
    }
    screen.dataset.projected = 'true';
  });
  useEffect(() => {
    const screen = screenRef.current;
    invalidate();
    return () => {
      if (screen) {
        screen.style.removeProperty('transform');
        delete screen.dataset.projected;
      }
    };
  }, [screenRef, invalidate]);
  return null;
}

function CameraRig({ view, revision }: { view: CameraView; revision: number }) {
  const controls = useRef<OrbitControlsImpl>(null);
  const { camera, size, invalidate } = useThree();
  useLayoutEffect(() => {
    const camera3d = camera as PerspectiveCamera;
    // Preserve the original +X view; pull back on narrow screens to fit the CRT.
    const portrait = size.width < 700;
    const distance = portrait
      ? Math.max(5.1, 4.3 / (size.width / size.height))
      : 4.3;
    const target = new Vector3(0, -0.12, 0);
    const positions: Record<CameraView, [number, number, number]> = {
      room: [distance, portrait ? distance * 0.16 : 0.65, distance * 0.36],
      desk: [distance * 1.12, 1.2, distance * 0.55],
      tv: [distance * 0.92, 0.08, 0.08],
    };
    camera3d.position.set(...positions[view]);
    camera3d.fov = 48;
    camera3d.lookAt(target);
    camera3d.updateProjectionMatrix();
    if (controls.current) {
      controls.current.target.copy(target);
      controls.current.update();
    }
    invalidate();
  }, [camera, view, revision, size.width, size.height, invalidate]);
  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enablePan={false}
      enableZoom={false}
      enableDamping={false}
      minPolarAngle={Math.PI * 0.35}
      maxPolarAngle={Math.PI * 0.52}
      minAzimuthAngle={Math.PI * 0.32}
      maxAzimuthAngle={Math.PI * 0.62}
    />
  );
}

function ContextGuard({ onFailure }: { onFailure: () => void }) {
  const { gl } = useThree();
  useEffect(() => {
    const canvas = gl.domElement;
    const handle = (event: Event) => {
      event.preventDefault();
      onFailure();
    };
    canvas.addEventListener('webglcontextlost', handle);
    return () => canvas.removeEventListener('webglcontextlost', handle);
  }, [gl, onFailure]);
  return null;
}

function WindowLight({ mood }: { mood: Mood }) {
  const color =
    mood === 'sunset' ? '#c38356' : mood === 'rain' ? '#51677b' : '#24334b';
  return (
    <group position={[-1.17, 1.55, -2.15]} rotation={[0, Math.PI / 2, 0]}>
      <mesh>
        <planeGeometry args={[1.3, 1.65]} />
        <meshBasicMaterial color={color} />
      </mesh>
      {[-0.68, 0, 0.68].map(x => (
        <mesh key={x} position={[x, 0, 0.015]}>
          <boxGeometry args={[0.045, 1.75, 0.045]} />
          <meshStandardMaterial color="#201710" />
        </mesh>
      ))}
      {[-0.85, 0, 0.85].map(y => (
        <mesh key={y} position={[0, y, 0.015]}>
          <boxGeometry args={[1.4, 0.045, 0.045]} />
          <meshStandardMaterial color="#201710" />
        </mesh>
      ))}
      {mood === 'rain' &&
        Array.from({ length: 28 }, (_, i) => (
          <mesh
            key={i}
            position={[
              -0.6 + ((i * 0.173) % 1.2),
              -0.75 + ((i * 0.317) % 1.5),
              0.007,
            ]}
            rotation={[0, 0, -0.13]}
          >
            <planeGeometry args={[0.005, 0.04 + (i % 3) * 0.02]} />
            <meshBasicMaterial color="#a5b7c2" transparent opacity={0.32} />
          </mesh>
        ))}
    </group>
  );
}

export default function VintageRoom(props: VintageRoomProps) {
  const { mood, lampOn, focusing, playing, active, reducedMotion, lowQuality } =
    props;
  const warm = lampOn || focusing;
  const animated = active && !reducedMotion && !lowQuality;
  return (
    <Canvas
      shadows={!lowQuality}
      dpr={lowQuality ? 1 : [1, 1.5]}
      camera={{ position: [4.3, 0.65, 1.55], fov: 48, near: 0.1, far: 40 }}
      frameloop={animated ? 'always' : 'demand'}
      gl={{ antialias: !lowQuality, toneMappingExposure: 1.1 }}
      fallback={
        <span className="canvas-unavailable">
          3D를 불러올 수 없어요. 2D 보기를 선택해 주세요.
        </span>
      }
    >
      <color attach="background" args={['#0d0804']} />
      <fog attach="fog" args={['#0d0804', 8, 18]} />
      <ambientLight intensity={0.4} color="#d8c2ad" />
      <hemisphereLight args={['#a99584', '#1a0c06', 0.6]} />
      <directionalLight
        position={[3, 5, 2]}
        intensity={warm ? 2 : 0.7}
        color={mood === 'sunset' ? '#ffbc7d' : '#edbd90'}
        castShadow={!lowQuality}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
        shadow-normalBias={0.03}
      />
      <pointLight
        position={[1.1, 0.2, 0.3]}
        color={mood === 'sunset' ? '#b4bce6' : '#719edb'}
        intensity={playing ? 4 : 1.8}
        distance={6}
        decay={2}
      />
      <pointLight
        position={[-0.45, 1, -2.5]}
        color="#ffc376"
        intensity={warm ? 6 : 0}
        distance={5}
      />
      <pointLight
        position={[-0.45, 1, 2.5]}
        color="#ffc376"
        intensity={warm ? 6 : 0}
        distance={5}
      />
      <Suspense fallback={null}>
        <Room />
        <Furniture lampOn={warm} onLamp={props.onLamp} />
        <VintageTelevision />
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, -1.04, 0]}
          receiveShadow
        >
          <planeGeometry args={[24, 24]} />
          <meshStandardMaterial
            color="#25150d"
            roughness={0.43}
            metalness={0.12}
          />
        </mesh>
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[1.1, -1.035, 0]}
          receiveShadow
        >
          <planeGeometry args={[1.6, 2.2]} />
          <meshStandardMaterial color="#291b13" roughness={1} />
        </mesh>
        <WindowLight mood={mood} />
        {animated && (
          <Sparkles
            count={35}
            size={1.4}
            speed={0.13}
            opacity={0.25}
            color="#d8b089"
            scale={[6, 3, 7]}
            position={[1, 0.5, 0]}
          />
        )}
        <ScreenProjection screenRef={props.screenRef} />
      </Suspense>
      <CameraRig view={props.camera} revision={props.cameraRevision} />
      <ContextGuard onFailure={props.onFailure} />
    </Canvas>
  );
}
