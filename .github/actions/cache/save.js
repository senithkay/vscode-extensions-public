const core = require('@actions/core');
const glob = require('@actions/glob');
const path = require('path');
// const cache = require('@actions/cache');
// const { consts } = require("./constants");

async function run() {
  try {
    const projectPath = "./";

    const rushCacheKey = `rush-${process.platform}-` + (await glob.hashFiles("rush.json", { options: { followSymbolicLinks: false }, verbose: true }));
    // const rushCacheDir = path.join(projectPath, 'common', 'temp', 'install-run');
    // const rushBuildCacheDir = path.join(projectPath, 'common', 'temp', 'build-cache');
    // const rushSysCacheDir = path.join(process.env.HOME, '.rush');

    const pnpmCacheDir = " path.join(projectPath, 'common', 'temp', 'pnpm-store')";
    // const pnpmCacheKey = `pnpm-${process.platform}-` + (await glob.hashFiles("**/pnpm-lock.yaml", { options: { followSymbolicLinks: false }, verbose: true }));

    // const pnpmCacheKey = core.getState("pnpmCacheKey");
    // const rushCacheKey = core.getState("rushCacheKey");
    const pnpmCacheExists = core.getState("pnpmCacheExists");
    const rushCacheExists = core.getState("rushCacheExists");

    console.log(pnpmCacheDir);
    // console.log(pnpmCacheKey);
    console.log(rushCacheKey);
    console.log(pnpmCacheExists);
    console.log(rushCacheExists);
    // Save the PNPM cache
    // if (!pnpmCacheExists) {
    //   console.log(pnpmCacheDir);
    //   // const x = await cache.saveCache([pnpmCacheDir], pnpmCacheKey);
    //   console.log(x);
    //   core.info(`PNPM cache saved with key ${pnpmCacheKey}`);
    // }

    // // Save the Rush cache
    // if (!rushCacheExists) {
    //   await cache.saveCache([rushCacheDir, rushSysCacheDir], rushCacheKey);
    //   core.info(`Rush cache saved with key ${rushCacheKey}`);
    // }
  } catch (error) {
    core.setFailed(error.message);
  }
}

if (process.env['STATE'] !== 'failure') {
  run();
}
