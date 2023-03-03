import * as core from '@actions/core';

async function run() {
  try {
    core.exportVariable(key, process.env["ACTIONS_CACHE_URL"]);
    core.exportVariable(key, process.env["ACTIONS_RUNTIME_TOKEN"]);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
