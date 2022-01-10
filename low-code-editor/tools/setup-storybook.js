const { spawn, execSync } = require("child_process");
const { cp } = require("fs");
const path = require("path");

function copyBBEJson() {
    const balHome = execSync("bal home").toString().trim();
    cp(
        path.join(balHome, "examples", "index.json"),
        path.join(__dirname, "..", "src", "stories", "data", "bbes.json"),
        { force: true },
        (err) => err ? console.log("copy error: " + err ) : console.log("copy successful")
    );
}

function startLS() {
    const ls = spawn('npx', ['start-ws-lang-server']);

    ls.stdout.on('data', (data) => {
        console.log(`lang-server:stdout: ${data}`);
    });

    ls.stderr.on('data', (data) => {
        console.error(`lang-server:stderr: ${data}`);
    });

    ls.on('close', (code) => {
     console.log(`lang-server:process exited with code ${code}`);
    });
}

function startVSCodeMockServer() {
    const vs = spawn('node', ['../ballerina-languageclient/tools/vscode-mock-server.js']);

    vs.stdout.on('data', (data) => {
        console.log(`vs-mock-server:stdout: ${data}`);
    });

    vs.stderr.on('data', (data) => {
        console.error(`vs-mock-server:stderr: ${data}`);
    });

    vs.on('close', (code) => {
     console.log(`vs-mock-server:process exited with code ${code}`);
    });
}

function startStoryBook() {
    const sb = spawn('npx', ['start-storybook', '-p', '6006']);

    sb.stdout.on('data', (data) => {
        console.log(`storybook:stdout: ${data}`);
    });

    sb.stderr.on('data', (data) => {
        console.error(`storybook:stderr: ${data}`);
    });

    sb.on('close', (code) => {
        console.log(`storybook:process exited with code ${code}`);
    });
}

copyBBEJson();
startLS();
startVSCodeMockServer();

setTimeout(() => startStoryBook(), 4000);
