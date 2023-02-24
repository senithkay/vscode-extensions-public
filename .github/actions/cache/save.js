const core = require('@actions/core');
const cache = require('@actions/cache');
const { consts } = require("./constants");

async function run() {
  try {
    const { pnpmCacheDir, rushCacheDir, rushSysCacheDir } = await consts;
    const { pnpmCacheKey, rushCacheKey } = process.env;
    // Save the PNPM cacheÒ
    await cache.saveCache([pnpmCacheDir], pnpmCacheKey);
    core.info(`PNPM cache saved with key ${pnpmCacheKey}`);

    // Save the Rush cacheÒ
    await cache.saveCache([rushCacheDir, rushSysCacheDir], rushCacheKey);
    core.info(`Rush cache saved with key ${rushCacheKey}`);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
