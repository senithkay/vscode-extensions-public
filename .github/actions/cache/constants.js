
const glob = require('@actions/glob');
const path = require('path');
const projectPath = "./";

module.exports.consts = (async () => {
    const rushCacheKey = `rush-${process.platform}-` + (await glob.hashFiles("rush.json"));
    const rushCacheDir = path.join(projectPath, 'common', 'temp', 'install-run');
    const rushBuildCacheDir = path.join(projectPath, 'common', 'temp', 'build-cache');
    const rushSysCacheDir = path.join(process.env.HOME, '.rush');

    const pnpmCacheDir = path.join(projectPath, 'common', 'temp', 'pnpm-store');
    const pnpmCacheKey = `pnpm-${process.platform}-` + (await glob.hashFiles("**/pnpm-lock.yaml"));
    return { rushCacheKey, rushCacheDir, rushBuildCacheDir, rushSysCacheDir, pnpmCacheDir, pnpmCacheKey };
})();
