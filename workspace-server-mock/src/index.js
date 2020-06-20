const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const getPort = require('get-port');
const fs = require('fs');
const WebSocket = require('ws');
const exitHook = require('exit-hook');

const app = express();
const expressWs = require('express-ws')(app);

app.use(express.json());

const port = 3000;

const defaultContent = "";

const repoPath = path.resolve(__dirname, "..", "repo");
const fileAPIPath = "/orgs/:orgId/apps/:appId/workspace/files/*";
const langServerPath = "/orgs/:orgId/apps/:appId/workspace/lang-server";

function ensureDirectoryExistence(filePath) {
    var dirname = path.dirname(filePath);
    if (fs.existsSync(dirname)) {
      return true;
    }
    ensureDirectoryExistence(dirname);
    fs.mkdirSync(dirname);
}

// file GET - retrieves files
app.get(fileAPIPath, (req, res) => {

    const filePath =  path.resolve(repoPath, req.params.orgId,  req.params.appId, req.params[0]);
    let contentRaw;
    if(!fs.existsSync(filePath)) {
        ensureDirectoryExistence(filePath);
        fs.writeFileSync(filePath, defaultContent);
        contentRaw = defaultContent;
    } else {
        contentRaw = fs.readFileSync(filePath).toString();
    }
    res.send({
        content: Buffer.from(contentRaw).toString('base64'),
        path: "/" + req.params[0],
        size: contentRaw.length,
        type: "file"
    });
});

// file POST - update files
app.post(fileAPIPath, (req, res) => {
    const filePath =  path.resolve(repoPath, req.params.orgId,  req.params.appId, req.params[0]);
    const contentEncoded = req.body.content;
    fs.writeFileSync(filePath, Buffer.from(contentEncoded, 'base64').toString());
    res.send({
        content: contentEncoded,
        path: "/" + req.params[0],
        size: req.body.content.length,
        type: "file"
    });
});

// app ping
app.post("/orgs/:orgId/apps/:appId/ping", (req, res) => {
    res.send({
        ping: "success"
    });
});

// app runtime info
app.get("/orgs/:orgId/apps/:appId/runtime", (req, res) => {
    const orgId = req.params.orgId;
    const appId = req.params.appId;
    res.send({
        prod: {
            observabilityUrl: "obsurl",
            accessUrl: "accessurl",
            status: "stopped"
        },
        test: {
            observabilityUrl: "obsurl",
            accessUrl: "accessurl",
            status: "stopped"
        }
    });
});

function getApp(orgId, appId) {
    return {
        id: 100,
        name: appId,
        displayName: appId,
        workingFile: `/app/project/src/main-module/choreo.bal`,
        org: orgId,
        organizationId: 100,
        template: "Service",
        observabilityId: "obsid",
        gitRemote: "gitUrl",
        status: "string",
        isPersisted: true
    }
}

// get app info
app.get("/orgs/:orgId/apps/:appId", (req, res) => {
    const orgId = req.params.orgId;
    const appId = req.params.appId;
    res.send(getApp(orgId, appId));
});

// get apps
app.get("/orgs/:orgId/apps/", (req, res) => {
    const orgId = req.params.orgId;
    res.send([
        getApp(orgId, "myfirstapp")
    ]);
});

const serverInfoMap = new Map();

async function startLangServer(orgId, appId, ws) {
    let firstMsg;
    ws.on('message', function incoming(data) {
        if (!firstMsg) {
            firstMsg = data;
        }
    });
    const workspaceID = orgId + ":" + appId;
    const projectPath = path.resolve(repoPath, orgId, appId, "app");
    const debBalDistPath = process.env.BALLERINA_DEV_HOME;
    console.log("Starting LangServer for workspace: " + workspaceID);

    function createMessageProxy(port) {
        const wsClient = new WebSocket('ws://localhost:' + port + "/lang-server");
        wsClient.on('open', function open() {
            console.log("Opened connection to " + workspaceID + " LS.");
            if (firstMsg) {
                wsClient.send(firstMsg);
            }
            serverInfoMap.get(workspaceID).connections += 1;
            // proxy messages from BE to FE
            const onFEMsg = (data) => {
                if (wsClient.readyState === 1) {
                    wsClient.send(data);
                } else {
                    wsClient.on("open", () => {
                        wsClient.send(data);
                    });
                }
            }
            const onBEMsg = (data) => {
                if (ws.readyState === 1) {
                    ws.send(data);
                } else {
                    ws.on("open", () => {
                        ws.send(data);
                    });
                }
            }
            
            ws.on('message', onFEMsg);
            wsClient.on('message', onBEMsg);

            // remove event listeners
            ws.on("close", () => {
                ws.removeEventListener("message", onFEMsg);
            });
            wsClient.on("close", () => {
                wsClient.removeEventListener("message", onBEMsg);
            });
        });
        ws.on("close", () => {
            const serverInfo = serverInfoMap.get(workspaceID);
            serverInfo.connections -= 1;
            // wait some time before killing lang-server
            // as this can be a page refresh and starting for each
            // refresh is killing dev experience.
            setTimeout(() => {
                if (serverInfo.connections === 0) {
                    serverInfo.serverProcess.kill();
                    serverInfoMap.delete(workspaceID);
                    console.log("Killed LangServer for workspace:" + workspaceID);
                }
            }, 20000);
        });
    }

    if (serverInfoMap.has(workspaceID)) {
        console.log("Using existing server for new connection. " + workspaceID);
        const startProxyInterval = setInterval(() => {
            if (!serverInfoMap.get(workspaceID).isStarting) {
                createMessageProxy(serverInfoMap.get(workspaceID).lsPort);
                clearInterval(startProxyInterval);
            } else {
                console.log("Waiting for LS startup in . " + workspaceID);
            }
        }, 2000);
    } else if (!debBalDistPath) {
        const msg = "Env variable $BALLERINA_DEV_HOME is not defined.";
        console.log(msg);
        ws.close();
    } else {
        const lsPort = await getPort({port: getPort.makeRange(9090, 9190)});
        const debugPort = await getPort({port: getPort.makeRange(5005, 5105)});
        const currentFilePath = __dirname;
        console.log("Using " + lsPort + " for LS and " + debugPort + " for jvm debug");
        const serverProcess = spawn("docker",
            [
                "run",
                "-p", debugPort + ":5005",
                "-p", lsPort + ":9090",
                "-v", currentFilePath + "/../connector:/ballerina/connector",
                "--env", "DEFAULT_CONNECTOR_FILE=/ballerina/connector/connector.toml",
                "-v", debBalDistPath + ":/ballerina/runtime",
                "-v", projectPath + ":/app",
                "-v", path.resolve(require("os").homedir(), ".ballerina") + ":/root/.ballerina",
                "workspace-lang-server:1.0.0"
            ]
        );
        exitHook(() => {
            if (serverProcess) {
                serverProcess.kill();
            }
        });
        serverInfoMap.set(workspaceID, {
            lsPort,
            debugPort,
            connections: 0,
            serverProcess,
            isStarting: true
        });
        serverProcess.stdout.on("data", (msg) => console.log("LS:STDOUT:" + workspaceID + ":" + msg));
        serverProcess.stderr.on("data", (msg) => {
            console.log("LS:STDERR:" + workspaceID + ":" + msg);
            if (msg.toString().includes("Interface starting on host 0.0.0.0 and port 9090")) {
                serverInfoMap.get(workspaceID).isStarting = false;
                createMessageProxy(lsPort);
            }
        });
    }
}

// workspace lang-server connection
app.ws(langServerPath, async function(ws, req, next) {
    const { appId, orgId } = req.params;
    startLangServer(orgId, appId, ws);
    next();
});

app.listen(port, () => console.log(`File Server listening at http://localhost:${port}`));
