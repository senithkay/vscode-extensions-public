const { spawn, execSync } = require("child_process");
var glob = require('glob');
const { cp, writeFile, existsSync, writeFileSync } = require("fs");
const path = require("path");

function setupDevBalProject() {
    const projectRoot = path.join(__dirname, "..");
    const sourceRoot = path.join(projectRoot, "src");
    const storyDataDir = path.join(sourceRoot, "stories", "data");
    let devProjectFolder = path.join(storyDataDir, "project");
    if (process.env.LOW_CODE_DEV_PROJECT_PATH) {
        devProjectFolder = process.env.LOW_CODE_DEV_PROJECT_PATH;
        console.log("Dev Project Path is set via env var LOW_CODE_DEV_PROJECT_PATH. Path: " + devProjectFolder)
    } else {
        console.log("Using default dev project path. Override using LOW_CODE_DEV_PROJECT_PATH env var.")
    }
    if (existsSync(devProjectFolder)) {
        console.log("Development project alreay exists at " + devProjectFolder)
    } else {
        const projectName = path.parse(devProjectFolder).name;
        const cwd = path.resolve(path.parse(devProjectFolder).dir);
        console.log(cwd)
        const balNewOutput = execSync("bal new " + projectName, { cwd }).toString().trim();
        if (balNewOutput.startsWith("Created new")) {
            console.log("Initialized new Ballerina Project at " + devProjectFolder)
        } else {
            console.log("Unable to initialize new Ballerina project at " + devProjectFolder)
        }
    }

    glob(path.join(devProjectFolder, '**/*.bal'), function (err, files) {
        if (err) {
            console.log("Error while analyzing development project. ", err)
            return
        }
        writeFile(path.join(storyDataDir, "devproject.json"),
            `
{
    "projectPath": "${devProjectFolder}/",
    "balFiles": ${JSON.stringify(files)},
    "projectRoot": "${projectRoot}/",
    "sourceRoot": "${sourceRoot}/"
}
`    ,
            (err) => err ? console.log("dev project json make error: " + err) : console.log("dev project json make successful")
        )
    });

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
    const vs = spawn('node', ['../integration-tests/tools/vscode-mock-server.js']);

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
        console.log(`storybook: ${data}`);
    });

    sb.stderr.on('data', (data) => {
        if (!data.includes("webpack.Progress") && !data.includes("webpack-dev-middleware")) {
            console.log(`storybook: ${data}`);
        }
    });

    sb.on('close', (code) => {
        console.log(`storybook:process exited with code ${code}`);
    });
}

setupDevBalProject();
startLS();
startVSCodeMockServer();

setTimeout(() => startStoryBook(), 4000);
