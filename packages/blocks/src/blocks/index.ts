export { checkout } from './checkout.js';
export { setupNode } from './setup-node.js';
export { installDeps } from './install-deps.js';
export { build } from './build.js';
export { lint } from './lint.js';
export { test } from './test.js';
export { deployVercel } from './deploy-vercel.js';
export { dockerBuildx } from './docker-buildx.js';
export { deployGhPages } from './deploy-gh-pages.js';

import { checkout } from './checkout.js';
import { setupNode } from './setup-node.js';
import { installDeps } from './install-deps.js';
import { build } from './build.js';
import { lint } from './lint.js';
import { test } from './test.js';
import { deployVercel } from './deploy-vercel.js';
import { dockerBuildx } from './docker-buildx.js';
import { deployGhPages } from './deploy-gh-pages.js';
import type { Block } from '../types.js';

// Block registry for lookup by ID
export const blockRegistry: Record<string, Block> = {
  checkout,
  'setup-node': setupNode,
  'install-deps': installDeps,
  build,
  lint,
  test,
  'deploy-vercel': deployVercel,
  'docker-buildx': dockerBuildx,
  'deploy-gh-pages': deployGhPages,
};

export function getBlock(id: string): Block | undefined {
  return blockRegistry[id];
}
