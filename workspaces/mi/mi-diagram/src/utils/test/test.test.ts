import { spawn } from 'child_process';
import WebSocket from 'ws';

// Function to start the language server
function startLanguageServer() {
    return new Promise((resolve, reject) => {
        const jarPath1 = '/Users/tharinduj/Documents/wso2/git/ballerina-plugin-vscode/workspaces/mi/mi-extension/ls/org.eclipse.lemminx-0.24.0-wso2v19-SNAPSHOT.jar';
        const jarPath2 = '/Users/tharinduj/Documents/wso2/git/ballerina-plugin-vscode/workspaces/mi/mi-extension/ls/org.eclipse.lemminx-uber.jar';

        let langServer: any;
        try {
            langServer = spawn('java', [
                '-cp',
                `${jarPath1}:${jarPath2}`,
                'org.eclipse.lemminx.XMLServerLauncher',
            ], {
                env: {
                    ...process.env, // Preserve the existing environment variables
                    HTTP_PROXY_HOST: 'localhost',
                    HTTP_PROXY_PORT: '8080'
                }
            });
            console.log('Language Server started with process:', langServer);
        } catch (err) {
            console.error('Error starting the language server:', err);
        }

        langServer.stdout.on('data', (data: any) => {
            console.log(`Language Server stdout: ${data}`);
            resolve(langServer);
        });

        langServer.stderr.on('data', (data: any) => {
            console.error(`Language Server stderr: ${data}`);
        });

        langServer.on('close', (code: any) => {
            console.log(`Language Server exited with code ${code}`);
        });

        langServer.on('error', (err: any) => {
            console.error('Error starting the language server:', err);
            reject(err);
        });

        langServer.on('exit', (code: any) => {
            console.log(`Language Server exited with code ${code}`);
        });
        // resolve(langServer);
    });
}

// Function to connect to the language server via WebSocket
function connectWebSocket() {
    return new Promise((resolve, reject) => {
        let ws: any;
        console.log('Creating WebSocket');
        try {
            ws = new WebSocket('ws://localhost:8080'); // Replace with the actual port
        } catch (err) {
            console.error('Error connecting to the language server:', err);
        }
        console.log('WebSocket created:', ws);
        ws.on('open', () => {
            console.log('Connected to the language server');
            resolve(ws);
        });

        ws.on('error', (err: any) => {
            reject(err);
        });
    });
}

describe('Language Server Tests', () => {
    let langServer: any;
    let ws: any;

    beforeAll(async () => {
        console.log('Starting the language server');
        langServer = await startLanguageServer();
        console.log('Language Server started:', langServer);
        ws = await connectWebSocket();
        console.log('WebSocket connected:', ws);
    }, 300000); // Allow up to 30 seconds for the language server to start

    afterAll(() => {
        ws.close();
        langServer.kill();
    });

    test('Get Syntax Tree', (done) => {
        const documentIdentifier = {
            uri: '/Users/tharinduj/Documents/wso2/git/ballerina-plugin-vscode/workspaces/mi/mi-diagram/src/utils/test/data/xml/filter.xml' // Replace with the actual URI of your document
        };

        console.log('Sending request to get syntax tree for:', documentIdentifier.uri);

        const request = {
            jsonrpc: '2.0',
            id: 1,
            method: 'synapse/syntaxTree',
            params: { uri: `file://${documentIdentifier.uri}` }
        };

        ws.on('message', (data: string) => {
            const response = JSON.parse(data);
            console.log('Response:', response);
            if (response.id === 1) {
                expect(response.result).toBeDefined();
                console.log('Syntax Tree:', response.result);
                done();
            }
        });

        console.log('Sending request:', request);
        ws.send(JSON.stringify(request));
    });
});
