const { execSync } = require('child_process');
const path = require('path');

console.log("Building lang-server-msf4j docker image");
execSync("./gradlew buildDockerDev", {
    cwd: path.resolve(__dirname, "lang-server-msf4j"),
    stdio: "inherit"
});

console.log("Building mock server for workspace");
execSync("npm i", {
    cwd: path.resolve(__dirname, "workspace-server-mock"),
    stdio: "inherit"
});
