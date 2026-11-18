import { Matrix4, type Camera } from 'three';

export const SCREEN_WIDTH = 800;
export const SCREEN_HEIGHT = 600;
// Measured rim of Cube.005 in vintage-television.glb, including the TV's
// [0, -0.3, 0] placement. Align to the rim, not the bulging glass center:
// putting the DOM plane in front of it shifts the picture at oblique angles.
// The aperture faces +X; DOM pixels run right (+u) and down (+v).
const screenPlane = new Matrix4().set(
  0,
  0,
  1,
  0.292,
  0,
  -1.542742 / SCREEN_HEIGHT,
  0,
  0.757964,
  -1.983668 / SCREEN_WIDTH,
  0,
  0,
  1.330956,
  0,
  0,
  0,
  1,
);
const clip = new Matrix4();
const css = new Matrix4();

/** Project a persistent DOM player onto the CRT without mounting it in WebGL. */
export function projectTVScreen(camera: Camera, width: number, height: number) {
  clip
    .copy(camera.projectionMatrix)
    .multiply(camera.matrixWorldInverse)
    .multiply(screenPlane);
  const m = clip.elements;
  css.set(
    (width / 2) * (m[0] + m[3]),
    (width / 2) * (m[4] + m[7]),
    0,
    (width / 2) * (m[12] + m[15]),
    (height / 2) * (-m[1] + m[3]),
    (height / 2) * (-m[5] + m[7]),
    0,
    (height / 2) * (-m[13] + m[15]),
    0,
    0,
    1,
    0,
    m[3],
    m[7],
    0,
    m[15],
  );
  return 'matrix3d(' + css.elements.join(',') + ')';
}
