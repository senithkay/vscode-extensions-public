const core = require('@actions/core');
const cache = require('@actions/cache');

const { pnpmCacheKey, pnpmCacheDir, rushCacheKey, rushCacheDir, rushSysCacheDir } = require("./constants.js");

async function run() {
    try {
        console.log(pnpmCacheKey);
        console.log(pnpmCacheDir);
        console.log(rushCacheKey);
        console.log(rushCacheDir);
        console.log(rushSysCacheDir);
        const pnpmCacheHit = await cache.restoreCache([pnpmCacheDir], pnpmCacheKey);
        if (pnpmCacheHit) {
            core.info(`PNPM cache restored from key ${pnpmCacheKey}`);
        } else {
            core.info(`No PNPM cache found for key ${pnpmCacheKey}`);
        }

        const rushCacheHit = await cache.restoreCache([rushCacheDir, rushSysCacheDir], rushCacheKey);
        if (rushCacheHit) {
            core.info(`Rush cache restored from key ${rushCacheKey}`);
        } else {
            core.info(`No Rush cache found for key ${rushCacheKey}`);
        }
    } catch (error) {
        core.setFailed(error.message);
    }
}

run();
