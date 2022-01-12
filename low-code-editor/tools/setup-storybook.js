const { spawn, execSync } = require("child_process");
var glob = require( 'glob' );  
const { cp, writeFile, existsSync, writeFileSync } = require("fs");
const path = require("path");

function copyBBEJson() {
    const storyDataDir = path.join(__dirname, "..", "src", "stories", "data");
    const balHome = execSync("bal home").toString().trim();
    cp(
        path.join(balHome, "examples", "index.json"),
        path.join(storyDataDir, "bbes.json"),
        { force: true },
        (err) => err ? console.log("BBE copy error: " + err ) : console.log("BBE copy successful")
    );
    writeFile(path.join(storyDataDir, "baldist.json"),
`
{
    "balHome": "${balHome}"
}
`    ,
    (err) => err ? console.log("dist json make error: " + err ) : console.log("dist json make successful")
    )
}

function setupDevBalProject() {
    const storyDataDir = path.join(__dirname, "..", "src", "stories", "data");
    const devProjectFolder = path.join(storyDataDir, "project");
    if (existsSync(devProjectFolder)) {
        console.log("Development project alreay exists at " + devProjectFolder)
    } else {
        const balNewOutput = execSync("bal new project").toString().trim();
        if (balNewOutput.startsWith("Created new")) {
            console.log("Initialized new Ballerina Project at " + devProjectFolder)
        } else {
            console.log("Unable to initialize new Ballerina project at " + devProjectFolder)
        }
    }

    writeFileSync(path.join(devProjectFolder, "empty.bal"), "");

    glob(path.join(devProjectFolder, '**/*.bal'), function( err, files ) {
        if (err) {
            console.log("Error while analyzing development project. ", err)
            return
        }
        writeFile(path.join(storyDataDir, "devproject.json"),
`
{
    "projectPath": "${devProjectFolder}/",
    "balFiles": ${JSON.stringify(files)}
}
`    ,
    (err) => err ? console.log("dev project json make error: " + err ) : console.log("dev project json make successful")
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

copyBBEJson();
setupDevBalProject();
startLS();
startVSCodeMockServer();

setTimeout(() => startStoryBook(), 4000);
