const core = require('@actions/core');
const cache = require('@actions/cache');
const { consts } = require("./constants");

async function run() {
  try {
    const { pnpmCacheKey, pnpmCacheDir, rushCacheKey, rushCacheDir, rushSysCacheDir } = await consts;
    const pnpmCacheExists = core.getState("pnpmCacheExists");
    const rushCacheExists = core.getState("rushCacheExists");

    // Save the PNPM cache
    if (!pnpmCacheExists) {
      const x = await cache.saveCache([pnpmCacheDir], pnpmCacheKey);
      core.info(`PNPM cache saved with key ${pnpmCacheKey}`);
    }

    // Save the Rush cache
    if (!rushCacheExists) {
      await cache.saveCache([rushCacheDir, rushSysCacheDir], rushCacheKey);
      core.info(`Rush cache saved with key ${rushCacheKey}`);
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

if (process.env['STATE'] !== 'failure') {
  run();
}
