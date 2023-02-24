const core = require('@actions/core');
const cache = require('@actions/cache');

const { consts } = require("./constants");

async function run() {
    try {
        const { pnpmCacheKey, pnpmCacheDir, rushCacheKey, rushCacheDir, rushSysCacheDir } = await consts;
        core.exportVariable("pnpmCacheKey", pnpmCacheKey);
        core.exportVariable("rushCacheKey", rushCacheKey);

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
