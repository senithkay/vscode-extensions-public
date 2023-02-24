const core = require('@actions/core');
const cache = require('@actions/cache');

import { pnpmCacheKey, pnpmCacheDir, rushCacheKey, rushCacheDir, rushSysCacheDir } from "./constants";

async function run() {
    try {
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
