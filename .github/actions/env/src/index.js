import * as core from '@actions/core';

async function run() {
  try {
    core.exportVariable("ACTIONS_CACHE_URL", process.env["ACTIONS_CACHE_URL"]);
    core.exportVariable("ACTIONS_RUNTIME_TOKEN", process.env["ACTIONS_RUNTIME_TOKEN"]);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
