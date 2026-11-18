import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PerspectiveCamera, Vector3 } from 'three';
import { projectTVScreen } from '../../src/app/_lib/screen-projection';

// Use the shipped model as the reference so a correctly projected but misplaced
// rectangle cannot pass by repeating the implementation's calibration values.
const glb = readFileSync('public/3D/vintage-television.glb');
const model = JSON.parse(
  glb.subarray(20, 20 + glb.readUInt32LE(12)).toString(),
);
const screen = model.nodes.find(
  (node: { name: string }) => node.name === 'Cube.005',
);
const positions = model.meshes[screen.mesh].primitives[0].attributes.POSITION;
const bounds = model.accessors[positions];
const min = bounds.min.map(
  (value: number, i: number) => value * screen.scale[i] + screen.translation[i],
);
const max = bounds.max.map(
  (value: number, i: number) => value * screen.scale[i] + screen.translation[i],
);
min[1] -= 0.3;
max[1] -= 0.3;

test('the video corners align with the shipped CRT rim across camera angles and viewport sizes', () => {
  for (const [width, height] of [
    [1440, 1000],
    [390, 844],
  ]) {
    for (const position of [
      [4.3, 0.65, 1.55],
      [5, 1.2, 2.4],
      [4, 0.08, 0.08],
    ]) {
      const camera = new PerspectiveCamera(48, width / height, 0.1, 40);
      camera.position.set(position[0], position[1], position[2]);
      camera.lookAt(0, -0.12, 0);
      camera.updateMatrixWorld();
      const matrix = projectTVScreen(camera, width, height)
        .slice(9, -1)
        .split(',')
        .map(Number);
      assert.ok(matrix.every(Number.isFinite));
      for (const [u, v] of [
        [0, 0],
        [800, 0],
        [0, 600],
        [800, 600],
      ]) {
        const expected = new Vector3(
          min[0],
          max[1] - (v / 600) * (max[1] - min[1]),
          max[2] - (u / 800) * (max[2] - min[2]),
        ).project(camera);
        const divisor = matrix[3] * u + matrix[7] * v + matrix[15];
        assert.ok(divisor > 0, 'screen stays in front of camera');
        const x = (matrix[0] * u + matrix[4] * v + matrix[12]) / divisor;
        const y = (matrix[1] * u + matrix[5] * v + matrix[13]) / divisor;
        // The curved rim varies by less than 0.001 world units in depth.
        assert.ok(
          Math.abs(x - ((expected.x + 1) * width) / 2) < 0.2,
          'horizontal edge matches the model',
        );
        assert.ok(
          Math.abs(y - ((1 - expected.y) * height) / 2) < 0.2,
          'vertical edge matches the model',
        );
      }
    }
  }
});
