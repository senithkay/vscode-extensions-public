const core = require('@actions/core');
const exec = require('@actions/exec');
const cache = require('@actions/cache');
const fs = require('fs');
const path = require('path');
const { pnpmCacheKey, pnpmCacheDir, rushCacheKey, rushCacheDir, rushSysCacheDir } = require("./constants.js");

async function run() {
  try {
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
