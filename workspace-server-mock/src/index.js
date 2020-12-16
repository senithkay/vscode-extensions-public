const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const getPort = require('get-port');
const fs = require('fs');
const WebSocket = require('ws');
const exitHook = require('exit-hook');
const cors = require('cors');
const app = express();
const expressWs = require('express-ws')(app);

app.use(express.json());


app.use(cors());
app.options('*', cors());

const port = 3000;

const defaultContent = `
import ballerina/http;
@http:ServiceConfig {
    basePath: "/"
}
service hello on new http:Listener(8090) {
    @http:ResourceConfig {
        methods: ["GET"],
        path: "/hello"
    }
    resource function hello(http:Caller caller, http:Request req) {
        http:Client httpEndpoint = new ("");
        var getResponse = checkpanic httpEndpoint->get("");
        checkpanic caller->respond(<@untainted>"Hello");
    }
}`;

const repoPath = path.resolve(__dirname, "..", "repo");
const dumpPath = path.resolve(__dirname, "..", "dump");
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
        observability: {observabilityId: "", latestVersion: "123"},
        gitRemote: "gitUrl",
        status: "string",
        isPersisted: true,
        deployType: "",
        displayType: ""
    }
}

// get app info
app.get("/orgs/:orgId/apps/:appId", (req, res) => {
    const orgId = req.params.orgId;
    const appId = req.params.appId;
    res.send(getApp(orgId, appId));
});

// patch app info
app.patch("/orgs/:orgId/apps/:appId", (req, res) => {
    const orgId = req.params.orgId;
    const appId = req.params.appId;
    const appInfo = getApp(orgId, appId);
    res.send({ ...appInfo, ...req.body });
});

// app AST cache
app.get("/orgs/:orgId/apps/:appId/code", (req, res) => {
    res.send(undefined);
});

app.put("/orgs/:orgId/apps/:appId/code", (req, res) => {
    res.send(undefined);
});


// wait for workspace
app.get("/orgs/:orgId/apps/:appId/wait-for-workspace", (req, res) => {
    const orgId = req.params.orgId;
    const appId = req.params.appId;
    res.send(true);
});

// get apps
app.get("/orgs/:orgId/apps/", (req, res) => {
    const orgId = req.params.orgId;
    res.send([
        getApp(orgId, "myfirstapp")
    ]);
});

// IDP Redirect
app.get("/oauth2/authorize", (req, res) => {
    const state = req.query.state;
    const redirectURI = req.query.redirect_uri;
    res.redirect(301, redirectURI + '?code=mock-code'
        + '&state=' + state
        + '&AuthenticatedIdPs=mock-aidps'
        + '&session_state=mock-session-state');
});

// Token validate
app.post("/auth/token", (req, res) => {
    // ignore real data and respond with mock user
    res.send({
        token: "mock-token",
        userEmail: "mockuser@choreo.dev",
        userProfilePictureUrl: "",
        displayName: "Mock User",
        organizations: [{
            id: 101,
            name: "myorg",
            handle: "myorg"
        }]
    });
});

/**
 * TEST CASE RELATED MOCK API START
 */
 
//Single Test Case
function getTestCase(orgId, appId, testCaseId) {
    return {
        id: testCaseId,
        name: testCaseId,
        orgSlug: orgId,
        appSlug: appId,
        displayName: "Default Test Case " + testCaseId,
        workingFile: `/app/project/src/main-module/tests/test.bal`,
        createdAt: "2020-10-28T11:10:17Z",
        updatedAt: "2020-10-28T11:10:17Z"
    }
}

//Create New Test Case
app.post("/testbase/testmanager/orgs/:orgId/apps/:appId/testcases", (req, res) => {
    const orgId = req.params.orgId;
    const appId = req.params.appId;
    const newTest = {
        id: orgId,
        name: req.body.name,
        orgSlug: orgId,
        appSlug: appId,
        displayName: req.body.displayName,
        workingFile: `/app/project/src/main-module/tests/test.bal`,
        createdAt: "2020-10-28T11:10:17Z",
        updatedAt: "2020-10-28T11:10:17Z"
    }
    setTimeout(function(){
        res.status(201).send(newTest);
    }, 2000);
});

//Get The List of Test Cases
app.get("/testbase/testmanager/orgs/:orgId/apps/:appId/testcases", (req, res) => {
    const orgId = req.params.orgId;
    const appId = req.params.appId;
    const response = [];
    for(let x = 0; x < 10; x++) {
        response.push(getTestCase(orgId, appId, x+1))
    }
    setTimeout(function(){
        res.status(200).send(response);
    }, 2000);

});

//Delete Test Case
app.delete("/testbase/testmanager/orgs/:orgId/apps/:appId/testcases/:testCaseId", (req, res) => {
    const orgId = req.params.orgId;
    const appId = req.params.appId;
    const response = {
        message: "Test Case Deleted Success",
    }
    setTimeout(function(){
        res.status(200).send(response);
    }, 2000);
});

//Get Single Test Case
app.get("/testbase/testmanager/orgs/:orgId/apps/:appId/testcases/:testCaseId", (req, res) => {
    const orgId = req.params.orgId;
    const appId = req.params.appId;
    const testCaseId = req.params.testCaseId;

    setTimeout(function(){
        res.status(200).send(getTestCase(orgId, appId, testCaseId));
    }, 2000);
});

//Update Test Case
app.patch("/testbase/testmanager/orgs/:orgId/apps/:appId/testcases/:testCaseId", (req, res) => {
    const orgId = req.params.orgId;
    const appId = req.params.appId;
    const newTest = {
        id: "2",
        name: "DefaultTestCase",
        orgSlug: orgId,
        appSlug: appId,
        displayName: req.body.displayName,
        workingFile: `/app/project/src/main-module/tests/test.bal`,
        createdAt: "2020-10-28T11:10:17Z",
        updatedAt: "2020-10-28T11:10:17Z"
    }
    setTimeout(function(){
        res.status(200).send(newTest);
    }, 2000);
    
});

// Test Case ping
app.post("/testbase/testmanager/orgs/:orgId/apps/:appId/testcases/:testCaseId/ping", (req, res) => {
    setTimeout(function(){
        res.send({
            ping: "success"
        });
    }, 2000);
});

// Test Case AST cache
app.get("/testbase/testmanager/orgs/:orgId/apps/:appId/testcases/:testCaseId/code", (req, res) => {
    setTimeout(function(){
        res.send([]);
    }, 2000);
});

// Test Case AST cache Update
app.put("/testbase/testmanager/orgs/:orgId/apps/:appId/testcases/:testCaseId/code", (req, res) => {
    setTimeout(function(){
        res.send(undefined);
    }, 2000);
});


/**
 * TEST CASE RELATED MOCK API END
 */



const serverInfoMap = new Map();

const dumpConnector = (msg) => {
    const dump = process.env.DUMP_CONNECTOR;
    if (dump && msg && ensureDirectoryExistence(dumpPath)) {
        const rpcMsg = JSON.parse(msg);
        if (!rpcMsg || !rpcMsg.result) {
            return;
        }
        const { module, ast, name, org, version } = rpcMsg.result;
        if (name && org && module && version && ast) {
            const fileName = path.resolve(dumpPath, org, module, version, name, "ast.json");
            if (!fs.existsSync(fileName)) {
                ensureDirectoryExistence(fileName);
                fs.writeFileSync(fileName, JSON.stringify(ast));
            }
        }
    }
}

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
        const lsURL = `ws://localhost:${port}/`;
        const wsClient = new WebSocket(lsURL);
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
                dumpConnector(data);
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
                "-v", currentFilePath + "/../../lang-server-msf4j/connectors:/ballerina/connectors",
                "--env", "DEFAULT_CONNECTOR_FILE=/ballerina/connectors/connectors.toml",
                "-v", debBalDistPath + ":/ballerina/runtime",
                "-v", projectPath + ":/app",
                "-v", path.resolve(require("os").homedir(), ".ballerina") + ":/root/.ballerina",
                "workspace-lang-server:2.0.0"
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

        const checkStart = (msg) => {
            if (msg.toString().includes("started HTTP/WS listener 0.0.0.0:9090")) {
                serverInfoMap.get(workspaceID).isStarting = false;
                createMessageProxy(lsPort);
            }
        }
        serverProcess.stdout.on("data", (msg) => {
            checkStart(msg);
            console.log("LS:STDOUT:" + workspaceID + ":" + msg);
        });
        serverProcess.stderr.on("data", (msg) => {
            checkStart(msg);
            console.log("LS:STDERR:" + workspaceID + ":" + msg);
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
