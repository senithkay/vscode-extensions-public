/**
 * Copyright (c) 2018, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */

import {
    workspace, window, commands, languages, Uri, ConfigurationChangeEvent, extensions, Extension, ExtensionContext,
    IndentAction, OutputChannel, StatusBarItem, StatusBarAlignment
} from "vscode";
import {
    INVALID_HOME_MSG, INSTALL_BALLERINA, DOWNLOAD_BALLERINA, MISSING_SERVER_CAPABILITY, ERROR, COMMAND_NOT_FOUND,
    NO_SUCH_FILE, CONFIG_CHANGED, OLD_BALLERINA_VERSION, UNKNOWN_ERROR, INVALID_FILE, INVALID_PROJECT,
    OLD_PLUGIN_INSTALLED
} from "./messages";
import { join, sep } from 'path';
import { exec, spawnSync } from 'child_process';
import { LanguageClientOptions, State as LS_STATE, RevealOutputChannelOn, ServerOptions } from "vscode-languageclient/node";
import { getServerOptions } from '../server/server';
import { ExtendedLangClient } from './extended-language-client';
import { debug, log, getOutputChannel, outputChannel, isWindows, isSupportedVersion, VERSION } from '../utils';
import { AssertionError } from "assert";
import {
    BALLERINA_HOME, ENABLE_ALL_CODELENS, ENABLE_TELEMETRY, ENABLE_SEMANTIC_HIGHLIGHTING, OVERRIDE_BALLERINA_HOME,
    BALLERINA_LOW_CODE_MODE, ENABLE_PERFORMANCE_FORECAST, ENABLE_DEBUG_LOG, ENABLE_BALLERINA_LS_DEBUG,
    ENABLE_CONFIGURABLE_EDITOR, ENABLE_EXPERIMENTAL_FEATURES, ENABLE_NOTEBOOK_DEBUG
}
    from "./preferences";
import TelemetryReporter from "vscode-extension-telemetry";
import {
    createTelemetryReporter, CMP_EXTENSION_CORE, sendTelemetryEvent, sendTelemetryException,
    TM_EVENT_ERROR_INVALID_BAL_HOME_CONFIGURED, TM_EVENT_EXTENSION_INIT, TM_EVENT_EXTENSION_INI_FAILED,
    TM_EVENT_ERROR_OLD_BAL_HOME_DETECTED,
    getMessageObject
} from "../telemetry";
import { BALLERINA_COMMANDS, runCommand } from "../project";
import { SessionDataProvider } from "../tree-view/session-tree-data-provider";
import { gitStatusBarItem } from "../editor-support/git-status";
import { OAuthTokenHandler } from "../choreo-auth/inbuilt-impl";

const SWAN_LAKE_REGEX = /(s|S)wan( |-)(l|L)ake/g;

export const EXTENSION_ID = 'wso2.ballerina';
const PREV_EXTENSION_ID = 'ballerina.ballerina';
export enum LANGUAGE {
    BALLERINA = 'ballerina',
    TOML = 'toml'
}

export enum WEBVIEW_TYPE {
    PERFORMANCE_FORECAST,
    SWAGGER,
    BBE,
    CONFIGURABLE
}

export interface ConstructIdentifier {
    filePath: string;
    kind: string;
    startLine: number;
    startColumn: number;
    name: string;
}

export interface Change {
    fileUri: Uri;
    startLine: number;
    startColumn: number;
}

export interface ChoreoSession {
    loginStatus: boolean;
    choreoUser?: string;
    choreoAccessToken?: string;
    choreoCookie?: string;
    choreoRefreshToken?: string;
    choreoLoginTime?: Date;
    tokenExpirationTime?: number;
}

export interface CodeServerContext {
    codeServerEnv: boolean;
    manageChoreoRedirectUri?: string;
    statusBarItem?: gitStatusBarItem;
    infoMessageStatus: {
        messageFirstEdit: boolean;
        sourceControlMessage: boolean;
    };
    telemetryTracker?: TelemetryTracker;
}

interface PerformanceForecastContext {
    infoMessageStatus: {
        signinChoreo: boolean;
    };
    temporaryDisabled?: boolean;
}

export interface WebviewContext {
    isOpen: boolean;
    type?: WEBVIEW_TYPE;
}

export class BallerinaExtension {
    public telemetryReporter: TelemetryReporter;
    public ballerinaHome: string;
    private ballerinaCmd: string;
    public ballerinaVersion: string;
    public extension: Extension<any>;
    private clientOptions: LanguageClientOptions;
    public langClient?: ExtendedLangClient;
    public context?: ExtensionContext;
    private sdkVersion: StatusBarItem;
    private documentContext: DocumentContext;
    private choreoSession: ChoreoSession;
    private choreoSessionTreeProvider: SessionDataProvider | undefined;
    private codeServerContext: CodeServerContext;
    private webviewContext: WebviewContext;
    private perfForecastContext: PerformanceForecastContext;
    private ballerinaConfigPath: string;

    constructor() {
        this.ballerinaHome = '';
        this.ballerinaCmd = '';
        this.ballerinaVersion = '';
        this.sdkVersion = window.createStatusBarItem(StatusBarAlignment.Left, 100);
        this.sdkVersion.text = `Ballerina SDK: Detecting`;
        this.sdkVersion.command = `ballerina.showLogs`;
        this.sdkVersion.show();
        // Load the extension
        this.extension = extensions.getExtension(EXTENSION_ID)!;
        this.clientOptions = {
            documentSelector: [{ scheme: 'file', language: LANGUAGE.BALLERINA }, {
                scheme: 'file', language:
                    LANGUAGE.TOML
            }],
            synchronize: { configurationSection: LANGUAGE.BALLERINA },
            outputChannel: getOutputChannel(),
            revealOutputChannelOn: RevealOutputChannelOn.Never,
            initializationOptions: {
                "enableSemanticHighlighting": <string>workspace.getConfiguration().get(ENABLE_SEMANTIC_HIGHLIGHTING),
                "supportBalaScheme": "true"
            }
        };
        this.telemetryReporter = createTelemetryReporter(this);
        this.documentContext = new DocumentContext();
        this.choreoSession = { loginStatus: false };
        this.codeServerContext = {
            codeServerEnv: this.isCodeServerEnv(),
            manageChoreoRedirectUri: process.env.VSCODE_CHOREO_DEPLOY_URI,
            infoMessageStatus: {
                sourceControlMessage: true,
                messageFirstEdit: true
            }
        };
        if (this.isCodeServerEnv()) {
            commands.executeCommand('workbench.action.closeAllEditors');
            this.getCodeServerContext().telemetryTracker = new TelemetryTracker();
        }
        this.webviewContext = { isOpen: false };
        this.perfForecastContext = {
            infoMessageStatus: {
                signinChoreo: true
            }
        };
        this.ballerinaConfigPath = '';
    }

    setContext(context: ExtensionContext) {
        this.context = context;
    }

    init(_onBeforeInit: Function): Promise<void> {
        if (extensions.getExtension(PREV_EXTENSION_ID)) {
            this.showUninstallOldVersion();
        }
        // Register show logs command.
        const showLogs = commands.registerCommand('ballerina.showLogs', () => {
            outputChannel.show();
        });
        this.context!.subscriptions.push(showLogs);

        try {
            // Register pre init handlers.
            this.registerPreInitHandlers();

            // Check if ballerina home is set.
            if (this.overrideBallerinaHome()) {
                if (!this.getConfiguredBallerinaHome()) {
                    const message = "Trying to get ballerina version without setting ballerina home.";
                    sendTelemetryEvent(this, TM_EVENT_ERROR_INVALID_BAL_HOME_CONFIGURED, CMP_EXTENSION_CORE, getMessageObject(message));
                    throw new AssertionError({
                        message: message
                    });
                }

                debug("Ballerina home is configured in settings.");
                this.ballerinaHome = this.getConfiguredBallerinaHome();
            }

            // Validate the ballerina version.
            const pluginVersion = this.extension.packageJSON.version.split('-')[0];
            return this.getBallerinaVersion(this.ballerinaHome, this.overrideBallerinaHome()).then(runtimeVersion => {
                this.ballerinaVersion = runtimeVersion.split('-')[0];
                const { home } = this.autoDetectBallerinaHome();
                this.ballerinaHome = home;
                log(`Plugin version: ${pluginVersion}\nBallerina version: ${this.ballerinaVersion}`);

                if (!this.ballerinaVersion.match(SWAN_LAKE_REGEX) || (this.ballerinaVersion.match(SWAN_LAKE_REGEX) &&
                    !isSupportedVersion(ballerinaExtInstance, VERSION.BETA, 3))) {
                    this.showMessageOldBallerina();
                    const message = `Ballerina version ${this.ballerinaVersion} is not supported. 
                        The extension supports Ballerina Swan Lake Beta 3+ versions.`;
                    sendTelemetryEvent(this, TM_EVENT_ERROR_OLD_BAL_HOME_DETECTED, CMP_EXTENSION_CORE, getMessageObject(message));
                    return;
                }

                // if Home is found load Language Server.
                let serverOptions: ServerOptions;
                serverOptions = getServerOptions(this.ballerinaCmd, this);
                this.langClient = new ExtendedLangClient('ballerina-vscode', 'Ballerina LS Client', serverOptions,
                    this.clientOptions, this, false);

                // Following was put in to handle server startup failures.
                const disposeDidChange = this.langClient.onDidChangeState(async stateChangeEvent => {
                    if (stateChangeEvent.newState === LS_STATE.Stopped) {
                        const message = "Couldn't establish language server connection.";
                        sendTelemetryEvent(this, TM_EVENT_EXTENSION_INI_FAILED, CMP_EXTENSION_CORE, getMessageObject(message));
                        log(message);
                        this.showPluginActivationError();
                    } else if (stateChangeEvent.newState === LS_STATE.Running) {
                        await this.langClient?.registerExtendedAPICapabilities();
                        this.sdkVersion.text = `Ballerina SDK: ${this.ballerinaVersion}`;
                        sendTelemetryEvent(this, TM_EVENT_EXTENSION_INIT, CMP_EXTENSION_CORE);
                    }
                });

                let disposable = this.langClient.start();
                this.langClient.onReady().then(() => {
                    disposeDidChange.dispose();
                    this.context!.subscriptions.push(disposable);
                });
            }, (reason) => {
                sendTelemetryException(this, reason, CMP_EXTENSION_CORE);
                throw new Error(reason);
            }).catch(e => {
                const msg = `Error when checking ballerina version. ${e.message}`;
                sendTelemetryException(this, e, CMP_EXTENSION_CORE, getMessageObject(msg));
                this.telemetryReporter.dispose();
                throw new Error(msg);
            });
        } catch (ex) {
            let msg = "Error happened.";
            if (ex instanceof Error) {
                msg = "Error while activating plugin. " + (ex.message ? ex.message : ex);
                // If any failure occurs while initializing show an error message
                this.showPluginActivationError();
                sendTelemetryException(this, ex, CMP_EXTENSION_CORE, getMessageObject(msg));
                this.telemetryReporter.dispose();
            }
            return Promise.reject(msg);
        }
    }

    onReady(): Promise<void> {
        if (!this.langClient) {
            const message = `Ballerina SDK: Error`;
            this.sdkVersion.text = message;
            sendTelemetryEvent(this, TM_EVENT_EXTENSION_INI_FAILED, CMP_EXTENSION_CORE, getMessageObject(message));
            this.telemetryReporter.dispose();
            return Promise.reject('BallerinaExtension is not initialized');
        }
        return this.langClient.onReady();
    }

    showPluginActivationError(): any {
        // message to display on Unknown errors.
        // ask to enable debug logs.
        // we can ask the user to report the issue.
        this.sdkVersion.text = `Ballerina SDK: Error`;
        window.showErrorMessage(UNKNOWN_ERROR);
    }

    registerPreInitHandlers(): any {
        // We need to restart VSCode if we change plugin configurations.
        workspace.onDidChangeConfiguration((params: ConfigurationChangeEvent) => {
            if (params.affectsConfiguration(BALLERINA_HOME) || params.affectsConfiguration(OVERRIDE_BALLERINA_HOME)
                || params.affectsConfiguration(ENABLE_ALL_CODELENS) ||
                params.affectsConfiguration(BALLERINA_LOW_CODE_MODE) || params.affectsConfiguration(ENABLE_DEBUG_LOG)
                || params.affectsConfiguration(ENABLE_BALLERINA_LS_DEBUG) ||
                params.affectsConfiguration(ENABLE_EXPERIMENTAL_FEATURES) || 
                params.affectsConfiguration(ENABLE_NOTEBOOK_DEBUG)) {
                this.showMsgAndRestart(CONFIG_CHANGED);
            }
        });

        languages.setLanguageConfiguration('ballerina', {
            onEnterRules: [
                {
                    beforeText: new RegExp('^\\s*#'),
                    action: {
                        appendText: '# ',
                        indentAction: IndentAction.None,
                    }
                }
            ]
        });
    }

    showMsgAndRestart(msg: string): void {
        const action = 'Restart Now';
        window.showInformationMessage(msg, action).then((selection) => {
            if (action === selection) {
                commands.executeCommand('workbench.action.reloadWindow');
            }
        });
    }

    async getBallerinaVersion(ballerinaHome: string, overrideBallerinaHome: boolean): Promise<string> {
        // if ballerina home is overridden, use ballerina cmd inside distribution
        // otherwise use wrapper command
        if (ballerinaHome) {
            debug(`Ballerina Home: ${ballerinaHome}`);
        }
        let distPath = "";
        if (overrideBallerinaHome) {
            distPath = join(ballerinaHome, "bin") + sep;
        }
        let exeExtension = "";
        if (isWindows()) {
            exeExtension = ".bat";
        }

        let ballerinaExecutor = '';
        return new Promise((resolve, reject) => {
            exec(distPath + 'bal' + exeExtension + ' version', (err, stdout, stderr) => {
                if (stdout) {
                    debug(`bal command stdout: ${stdout}`);
                }
                if (stderr) {
                    debug(`bal command _stderr: ${stderr}`);
                }
                if (err) {
                    debug(`bal command err: ${err}`);
                    reject(err);
                    return;
                }

                if (stdout.length === 0 || stdout.startsWith(ERROR) || stdout.includes(NO_SUCH_FILE) ||
                    stdout.includes(COMMAND_NOT_FOUND)) {
                    reject(stdout);
                    return;
                }

                ballerinaExecutor = 'bal';
                debug(`'bal' executor is picked up by the plugin.`);

                this.ballerinaCmd = (distPath + ballerinaExecutor + exeExtension).trim();
                try {
                    debug(`Ballerina version output: ${stdout}`);
                    const implVersionLine = stdout.split('\n')[0];
                    const replacePrefix = implVersionLine.startsWith("jBallerina")
                        ? /jBallerina /
                        : /Ballerina /;
                    const parsedVersion = implVersionLine.replace(replacePrefix, '').replace(/[\n\t\r]/g, '');
                    return resolve(parsedVersion);
                } catch (error) {
                    if (error instanceof Error) {
                        sendTelemetryException(this, error, CMP_EXTENSION_CORE);
                    }
                    return reject(error);
                }
            });
        });
    }

    showMessageInstallBallerina(): any {
        const download: string = 'Download';
        const openSettings: string = 'Open Settings';
        const viewLogs: string = 'View Logs';
        window.showWarningMessage(INSTALL_BALLERINA, download, openSettings, viewLogs).then((selection) => {
            if (openSettings === selection) {
                commands.executeCommand('workbench.action.openGlobalSettings');
            } else if (download === selection) {
                commands.executeCommand('vscode.open', Uri.parse(DOWNLOAD_BALLERINA));
            } else if (viewLogs === selection) {
                const balOutput = ballerinaExtInstance.getOutPutChannel();
                if (balOutput) {
                    balOutput.show();
                }
            }

        });
    }

    showUninstallOldVersion(): void {
        const action = 'Uninstall';
        window.showErrorMessage(OLD_PLUGIN_INSTALLED, action).then(selection => {
            if (selection === action) {
                runCommand('', 'code', BALLERINA_COMMANDS.OTHER, '--uninstall-extension', PREV_EXTENSION_ID);
            }
        });
    }

    showMessageInvalidBallerinaHome(): void {
        const action = 'Open Settings';
        window.showWarningMessage(INVALID_HOME_MSG, action).then((selection) => {
            if (action === selection) {
                commands.executeCommand('workbench.action.openGlobalSettings');
            }
        });
    }

    showMessageOldBallerina(): any {
        const download: string = 'Download';
        window.showWarningMessage(OLD_BALLERINA_VERSION, download).then((selection) => {
            if (download === selection) {
                commands.executeCommand('vscode.open', Uri.parse(DOWNLOAD_BALLERINA));
            }
        });
    }

    showMessageServerMissingCapability(): any {
        const download: string = 'Download';
        window.showErrorMessage(MISSING_SERVER_CAPABILITY, download).then((selection) => {
            if (download === selection) {
                commands.executeCommand('vscode.open', Uri.parse(DOWNLOAD_BALLERINA));
            }
        });
    }

    showMessageInvalidFile(): any {
        window.showErrorMessage(INVALID_FILE);
    }

    showMessageInvalidProject(): any {
        window.showErrorMessage(INVALID_PROJECT);
    }

    /**
     * Get ballerina home path.
     *
     * @returns {string}
     * @memberof BallerinaExtension
     */
    getBallerinaHome(): string {
        return this.ballerinaHome;
    }

    /**
    * Get ballerina executor command.
    *
    * @returns {string}
    * @memberof BallerinaExtension
    */
    getBallerinaCmd(): string {
        return this.ballerinaCmd;
    }

    /**
     * Get ballerina home path configured in preferences.
     *
     * @returns {string}
     * @memberof BallerinaExtension
     */
    getConfiguredBallerinaHome(): string {
        return <string>workspace.getConfiguration().get(BALLERINA_HOME);
    }

    getWebviewContext(): WebviewContext {
        return this.webviewContext;
    }

    setWebviewContext(context: WebviewContext) {
        this.webviewContext = context;
    }

    autoDetectBallerinaHome(): { home: string, isOldBallerinaDist: boolean, isBallerinaNotFound: boolean } {
        let balHomeOutput = "",
            isBallerinaNotFound = false,
            isOldBallerinaDist = false;
        try {
            let response = spawnSync(this.ballerinaCmd, ['home']);
            if (response.stdout.length > 0) {
                balHomeOutput = response.stdout.toString().trim();
            } else if (response.stderr.length > 0) {
                let message = response.stderr.toString();
                // ballerina is installed, but ballerina home command is not found
                isOldBallerinaDist = message.includes("bal: unknown command 'home'");
                // ballerina is not installed
                isBallerinaNotFound = message.includes('command not found')
                    || message.includes('unknown command')
                    || message.includes('is not recognized as an internal or external command');
                log(`Error executing 'bal home'.\n<---- cmd output ---->\n${message}<---- cmd output ---->\n`);
            }

            // specially handle unknown ballerina command scenario for windows
            if (balHomeOutput === "" && isWindows()) {
                isOldBallerinaDist = true;
            }
        } catch (er) {
            if (er instanceof Error) {
                const { message } = er;
                // ballerina is installed, but ballerina home command is not found
                isOldBallerinaDist = message.includes("bal: unknown command 'home'");
                // ballerina is not installed
                isBallerinaNotFound = message.includes('command not found')
                    || message.includes('unknown command')
                    || message.includes('is not recognized as an internal or external command');
                log(`Error executing 'bal home'.\n<---- cmd output ---->\n${message}<---- cmd output ---->\n`);
            }
        }

        return {
            home: isBallerinaNotFound || isOldBallerinaDist ? '' : balHomeOutput,
            isBallerinaNotFound,
            isOldBallerinaDist
        };
    }

    public overrideBallerinaHome(): boolean {
        return <boolean>workspace.getConfiguration().get(OVERRIDE_BALLERINA_HOME);
    }

    public getID(): string {
        return this.extension.id;
    }

    public getVersion(): string {
        return this.extension.packageJSON.version;
    }

    public getOutPutChannel(): OutputChannel | undefined {
        return getOutputChannel();
    }

    public isTelemetryEnabled(): boolean {
        return <boolean>workspace.getConfiguration().get(ENABLE_TELEMETRY);
    }

    public isAllCodeLensEnabled(): boolean {
        return <boolean>workspace.getConfiguration().get(ENABLE_ALL_CODELENS);
    }

    public isBallerinaLowCodeMode(): boolean {
        return <boolean>workspace.getConfiguration().get(BALLERINA_LOW_CODE_MODE) ||
            process.env.LOW_CODE_MODE === 'true';
    }

    public isCodeServerEnv(): boolean {
        return process.env.CODE_SERVER_ENV === 'true';
    }

    public enableLSDebug(): boolean {
        return this.overrideBallerinaHome() && <boolean>workspace.getConfiguration().get(ENABLE_BALLERINA_LS_DEBUG);
    }

    public enabledPerformanceForecasting(): boolean {
        return <boolean>workspace.getConfiguration().get(ENABLE_PERFORMANCE_FORECAST);
    }

    public isConfigurableEditorEnabled(): boolean {
        return this.isCodeServerEnv() ||
            <boolean>workspace.getConfiguration().get(ENABLE_CONFIGURABLE_EDITOR);
    }

    public enabledExperimentalFeatures(): boolean {
        return <boolean>workspace.getConfiguration().get(ENABLE_EXPERIMENTAL_FEATURES);
    }

    public enabledNotebookDebugMode(): boolean {
        return <boolean>workspace.getConfiguration().get(ENABLE_NOTEBOOK_DEBUG);
    }

    public async updatePerformanceForecastSetting(status: boolean) {
        await workspace.getConfiguration().update(ENABLE_PERFORMANCE_FORECAST, status);
    }

    public getDocumentContext(): DocumentContext {
        return this.documentContext;
    }

    public setDiagramActiveContext(value: boolean) {
        commands.executeCommand('setContext', 'isBallerinaDiagram', value);
        this.documentContext.setActiveDiagram(value);
    }

    public setChoreoAuthEnabled(value: boolean) {
        commands.executeCommand('setContext', 'isChoreoAuthEnabled', value);
    }

    public setChoreoSession(choreoSession: ChoreoSession) {
        this.choreoSession = choreoSession;
    }

    public getChoreoSession(): ChoreoSession {
        if (this.choreoSession.loginStatus && this.choreoSession.choreoLoginTime
            && this.choreoSession.tokenExpirationTime) {
            let tokenDuration = (new Date().getTime() - new Date(this.choreoSession.choreoLoginTime).getTime()) / 1000;
            if (tokenDuration > this.choreoSession.tokenExpirationTime) {
                debug(`Exchanging refresh token. ${new Date()}`);
                new OAuthTokenHandler(this).exchangeRefreshToken(this.choreoSession.choreoRefreshToken!);
            }
        }
        return this.choreoSession;
    }

    public setChoreoSessionTreeProvider(choreoSessionTreeProvider: SessionDataProvider) {
        this.choreoSessionTreeProvider = choreoSessionTreeProvider;
    }

    public getChoreoSessionTreeProvider(): SessionDataProvider | undefined {
        return this.choreoSessionTreeProvider;
    }

    public getCodeServerContext(): CodeServerContext {
        return this.codeServerContext;
    }

    public getPerformanceForecastContext(): PerformanceForecastContext {
        return this.perfForecastContext;
    }

    public setPerformanceForecastContext(context: PerformanceForecastContext) {
        this.perfForecastContext = context;
    }

    public setBallerinaConfigPath(path: string) {
        this.ballerinaConfigPath = path;
    }

    public getBallerinaConfigPath(): string {
        return this.ballerinaConfigPath;
    }

    public setNotebookVariableViewEnabled(value: boolean) {
        commands.executeCommand('setContext', 'isNotebookVariableViewEnabled', value);
    }

    public setNotebookDebugModeEnabled(value: boolean) {
        commands.executeCommand('setContext', 'isNotebookDebugModeEnabled', value);
    }
}

/**
 * Class keeps data related to text and diagram document changes.
 */
class DocumentContext {
    private diagramTreeElementClickedCallbacks: Array<(construct: ConstructIdentifier) => void> = [];
    private editorChangesCallbacks: Array<(change: Change) => void> = [];
    private latestDocument: Uri | undefined;
    private activeDiagram: boolean = false;

    public diagramTreeElementClicked(construct: ConstructIdentifier): void {
        this.diagramTreeElementClickedCallbacks.forEach((callback) => {
            callback(construct);
        });
    }

    public onDiagramTreeElementClicked(callback: (construct: ConstructIdentifier) => void) {
        this.diagramTreeElementClickedCallbacks.push(callback);
    }

    public onEditorChanged(callback: (change: Change) => void) {
        this.editorChangesCallbacks.push(callback);
    }

    public didEditorChange(change: Change): void {
        this.editorChangesCallbacks.forEach((callback) => {
            callback(change);
        });
    }

    public setLatestDocument(uri: Uri | undefined) {
        if (uri && (uri.scheme !== 'file' || uri.fsPath.split(sep).pop()?.split(".").pop() !== "bal")) {
            return;
        }
        this.latestDocument = uri;
    }

    public getLatestDocument(): Uri | undefined {
        return this.latestDocument;
    }

    public isActiveDiagram(): boolean {
        return this.activeDiagram;
    }

    public setActiveDiagram(isActiveDiagram: boolean) {
        this.activeDiagram = isActiveDiagram;
    }
}

/**
 * Telemetry tracker keeps track of the events, and
 * it is used to send telemetry events in batches.
 */
export class TelemetryTracker {
    private textEditCount: number;
    private diagramEditCount: number;

    constructor() {
        this.diagramEditCount = 0;
        this.textEditCount = 0;
    }

    public reset() {
        this.textEditCount = 0;
        this.diagramEditCount = 0;
    }

    public hasTextEdits(): boolean {
        return this.textEditCount > 0;
    }

    public hasDiagramEdits(): boolean {
        return this.diagramEditCount > 0;
    }

    public incrementTextEditCount() {
        this.textEditCount++;
    }

    public incrementDiagramEditCount() {
        this.diagramEditCount++;
    }
}

export const ballerinaExtInstance = new BallerinaExtension();
