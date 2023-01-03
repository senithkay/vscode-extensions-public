const { spawn, execSync } = require("child_process");
var glob = require( 'glob' );  
const { writeFile, existsSync } = require("fs");
const path = require("path");

module.exports.setupBalProject = function setupBalProject() {
    const storyDataDir = path.join(__dirname, "..", "src", "stories", "data");
    const projectFolder = path.join(storyDataDir, "balproj");

    glob(path.join(projectFolder, '**/transform.bal'), function( err, files ) {
        if (err) {
            console.log("Error while analyzing project. ", err)
            return
        }
        writeFile(path.join(storyDataDir, "project.json"),
`
{
    "projectPath": "${projectFolder}/",
    "balFiles": ${JSON.stringify(files)}
}
`    ,
    (err) => err ? console.log("Project json make error: " + err ) : console.log("Project json make successful")
    )
    });
    
}


module.exports.startLS = function startLS() {
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


module.exports.startVSCodeMockServer = function startVSCodeMockServer() {
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


module.exports.startStoryBook = function startStoryBook() {
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
