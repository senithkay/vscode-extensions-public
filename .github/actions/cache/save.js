const core = require('@actions/core');
const cache = require('@actions/cache');
const { consts } = require("./constants");

async function run() {
  try {
    const { pnpmCacheDir, rushCacheDir, rushSysCacheDir } = await consts;
    const { pnpmCacheKey, rushCacheKey, pnpmCacheExists, rushCacheExists } = process.env;
    console.log(pnpmCacheKey);
    console.log(rushCacheKey);
    console.log(pnpmCacheExists);
    console.log(rushCacheExists);
    // Save the PNPM cache
    if (!pnpmCacheExists) {
      await cache.saveCache([pnpmCacheDir], pnpmCacheKey);
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
