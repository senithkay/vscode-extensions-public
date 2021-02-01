
import {
    DebugConfigurationProvider, WorkspaceFolder, DebugConfiguration,
    debug, ExtensionContext, window, commands,
    DebugSession,
    DebugAdapterExecutable, DebugAdapterDescriptor, DebugAdapterDescriptorFactory, DebugAdapterServer,
    Uri
} from 'vscode';
import * as child_process from "child_process";
import { getPortPromise } from 'portfinder';
import * as path from "path";
import { ballerinaExtInstance, BallerinaExtension } from '../core/index';
import { ExtendedLangClient } from '../core/extended-language-client';
import { BALLERINA_HOME } from '../core/preferences';
import { TM_EVENT_START_DEBUG_SESSION } from '../telemetry';
import { log, debug as debugLog } from "../utils";
import { ExecutableOptions } from 'vscode-languageclient';

const BALLERINA_COMMAND = "ballerina.command";

const debugConfigProvider: DebugConfigurationProvider = {
    resolveDebugConfiguration(folder: WorkspaceFolder, config: DebugConfiguration)
        : Thenable<DebugConfiguration> {
        return getModifiedConfigs(config);
    }

};

async function getModifiedConfigs(config: DebugConfiguration) {
    let debuggeePort = config.debuggeePort;
    if (!debuggeePort) {
        debuggeePort = await getPortPromise({ port: 5010, stopPort: 10000 });
    }

    const ballerinaHome = ballerinaExtInstance.getBallerinaHome();
    config[BALLERINA_HOME] = ballerinaHome;
    config[BALLERINA_COMMAND] = ballerinaExtInstance.ballerinaCmd;

    if (!config.type) {
        config.type = 'ballerina';
    }

    if (!config.request) {
        config.request = 'launch';
    }

    if (!config.script || config.script === "${file}") {
        if (!window.activeTextEditor) {
            ballerinaExtInstance.showMessageInvalidFile();
            return Promise.reject();
        }

        const activeDoc = window.activeTextEditor.document;

        if (!activeDoc.fileName.endsWith('.bal')) {
            ballerinaExtInstance.showMessageInvalidFile();
            return Promise.reject();
        }

        config.script = window.activeTextEditor.document.uri.fsPath;
    }

    let langClient = <ExtendedLangClient>ballerinaExtInstance.langClient;
    if (langClient.initializeResult) {
        const { experimental } = langClient.initializeResult!.capabilities;
        if (experimental && experimental.introspection && experimental.introspection.port > 0) {
            config.networkLogsPort = experimental.introspection.port;
            if (config.networkLogs === undefined) {
                config.networkLogs = false;
            }
        }
    }

    config.debuggeePort = debuggeePort.toString();


    if (!config.debugServer) {
        const debugServer = await getPortPromise({ port: 10001, stopPort: 20000 });
        config.debugServer = debugServer.toString();
    }
    return config;
}

export function activateDebugConfigProvider(ballerinaExtInstance: BallerinaExtension) {
    let context = <ExtensionContext>ballerinaExtInstance.context;

    context.subscriptions.push(debug.registerDebugConfigurationProvider('ballerina', debugConfigProvider));

    const factory = new BallerinaDebugAdapterDescriptorFactory(ballerinaExtInstance);
    context.subscriptions.push(debug.registerDebugAdapterDescriptorFactory('ballerina', factory));
}

class BallerinaDebugAdapterDescriptorFactory implements DebugAdapterDescriptorFactory {
    private ballerinaExtInstance: BallerinaExtension;
    constructor(ballerinaExtInstance: BallerinaExtension) {
        this.ballerinaExtInstance = ballerinaExtInstance;
    }
    createDebugAdapterDescriptor(session: DebugSession, executable: DebugAdapterExecutable | undefined): Thenable<DebugAdapterDescriptor> {
        const port = session.configuration.debugServer;
        const cwd = this.getCurrentWorkingDir();
        let args: string[] = [];
        const cmd = this.getScriptPath(args);

        const SHOW_VSCODE_IDE_DOCS = "https://ballerina.io/learn/tools-ides/vscode-plugin/run-and-debug";
        const showDetails: string = 'Learn More';
        window.showWarningMessage("Ballerina Debugging is an experimental feature. Click \"Learn more\" for known limitations and workarounds.",
            showDetails).then((selection) => {
                if (showDetails === selection) {
                    commands.executeCommand('vscode.open', Uri.parse(SHOW_VSCODE_IDE_DOCS));
                }
            });

        args.push(port.toString());

        let opt: ExecutableOptions = { cwd: cwd };
        opt.env = Object.assign({}, process.env);

        const serverProcess = child_process.spawn(cmd, args, opt);

        log(`Starting debug adapter: '${this.ballerinaExtInstance.ballerinaCmd} start-debugger-adapter ${port.toString()}`);

        return new Promise<void>((resolve) => {
            serverProcess.stdout.on('data', (data) => {
                if (data.toString().includes('Debug server started')) {
                    resolve();
                }
                log(`${data}`);
            });

            serverProcess.stderr.on('data', (data) => {
                debugLog(`${data}`);
            });
        }).then(() => {
            ballerinaExtInstance.telemetryReporter.sendTelemetryEvent(TM_EVENT_START_DEBUG_SESSION);
            return new DebugAdapterServer(port);
        });
    }
    getScriptPath(args: string[]): string {
        let cmd = this.ballerinaExtInstance.ballerinaCmd;
        args.push('start-debugger-adapter');
        return cmd;
    }
    getCurrentWorkingDir(): string {
        return path.join(this.ballerinaExtInstance.ballerinaHome, "bin");
    }
}
