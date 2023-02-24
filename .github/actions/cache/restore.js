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
            core.exportVariable("pnpmCacheAvailable", true);
        } else {
            core.info(`No PNPM cache found for key ${pnpmCacheKey}`);
            core.exportVariable("pnpmCacheAvailable", false);
        }

        const rushCacheHit = await cache.restoreCache([rushCacheDir, rushSysCacheDir], rushCacheKey);
        if (rushCacheHit) {
            core.info(`Rush cache restored from key ${rushCacheKey}`);
            core.exportVariable("rushCacheAvailable", true);
        } else {
            core.info(`No Rush cache found for key ${rushCacheKey}`);
            core.exportVariable("rushCacheAvailable", false);
        }
    } catch (error) {
        core.setFailed(error.message);
    }
}

run();
