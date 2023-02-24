
const cache = require('@actions/glob');
const projectPath = "./";

export const rushCacheKey = `rush-${process.platform}-` + (await cache.hashFiles("rush.json"));
export const rushCacheDir = path.join(projectPath, 'common', 'temp', 'install-run');
export const rushBuildCacheDir = path.join(projectPath, 'common', 'temp', 'build-cache');
export const rushSysCacheDir = path.join(process.env.HOME, '.rush');

export const pnpmCacheDir = path.join(projectPath, 'common', 'temp', 'pnpm-store');
export const pnpmCacheKey = `pnpm-${process.platform}-` + (await cache.hashFiles("**/pnpm-lock.yaml"));