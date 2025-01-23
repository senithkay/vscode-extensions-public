/**
 * Copyright (c) 2018, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import {
    workspace, window, commands, languages, Uri, ConfigurationChangeEvent, extensions, Extension, ExtensionContext,
    IndentAction, OutputChannel, StatusBarItem, StatusBarAlignment, env, TextEditor, ThemeColor,
    ConfigurationTarget, ProgressLocation
} from "vscode";
import {
    INVALID_HOME_MSG, INSTALL_BALLERINA, DOWNLOAD_BALLERINA, MISSING_SERVER_CAPABILITY, ERROR, COMMAND_NOT_FOUND,
    NO_SUCH_FILE, CONFIG_CHANGED, OLD_BALLERINA_VERSION, UNKNOWN_ERROR, INVALID_FILE, INVALID_PROJECT,
    OLD_PLUGIN_INSTALLED,
    COOKIE_SETTINGS
} from "./messages";
import { join, sep } from 'path';
import { exec, spawnSync } from 'child_process';
import { LanguageClientOptions, State as LS_STATE, RevealOutputChannelOn, ServerOptions } from "vscode-languageclient/node";
import { getServerOptions } from '../utils/server/server';
import { ExtendedLangClient } from './extended-language-client';
import { debug, log, getOutputChannel, outputChannel, isWindows, isSupportedVersion, VERSION, isSupportedSLVersion } from '../utils';
import { AssertionError } from "assert";
import {
    BALLERINA_HOME, ENABLE_ALL_CODELENS, ENABLE_TELEMETRY, ENABLE_SEMANTIC_HIGHLIGHTING, OVERRIDE_BALLERINA_HOME,
    ENABLE_PERFORMANCE_FORECAST, ENABLE_DEBUG_LOG, ENABLE_BALLERINA_LS_DEBUG,
    ENABLE_EXPERIMENTAL_FEATURES, ENABLE_NOTEBOOK_DEBUG, ENABLE_RUN_FAST, ENABLE_INLAY_HINTS, FILE_DOWNLOAD_PATH,
    ENABLE_LIVE_RELOAD,
    ENABLE_AI_SUGGESTIONS,
    ENABLE_SEQUENCE_DIAGRAM_VIEW
}
    from "./preferences";
import TelemetryReporter from "vscode-extension-telemetry";
import {
    createTelemetryReporter, CMP_EXTENSION_CORE, sendTelemetryEvent, sendTelemetryException,
    TM_EVENT_ERROR_INVALID_BAL_HOME_CONFIGURED, TM_EVENT_EXTENSION_INIT, TM_EVENT_EXTENSION_INI_FAILED,
    TM_EVENT_ERROR_OLD_BAL_HOME_DETECTED,
    getMessageObject
} from "../features/telemetry";
import { BALLERINA_COMMANDS, runCommand } from "../features/project";
import { gitStatusBarItem } from "../features/editor-support/git-status";
import { checkIsPersistModelFile } from "../views/persist-layer-diagram/activator";
import { BallerinaProject, DownloadProgress, onDownloadProgress } from "@wso2-enterprise/ballerina-core";
import os, { platform } from "os";
import axios from "axios";
import AdmZip from 'adm-zip';
import fs from 'fs';
import path from 'path';
import { RPCLayer } from "../RPCLayer";
import { VisualizerWebview } from "../views/visualizer/webview";

const SWAN_LAKE_REGEX = /(s|S)wan( |-)(l|L)ake/g;

export const EXTENSION_ID = 'wso2.kolab';
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

const showMessageInstallBallerinaCommand = 'kolab.showMessageInstallBallerina';
const SDK_PREFIX = 'Ballerina ';
export class BallerinaExtension {
    public telemetryReporter: TelemetryReporter;
    public ballerinaHome: string;
    private ballerinaCmd: string;
    public ballerinaVersion: string;
    public extension: Extension<any>;
    private clientOptions: LanguageClientOptions;
    public langClient?: ExtendedLangClient;
    public context?: ExtensionContext;
    public isPersist?: boolean;
    private sdkVersion: StatusBarItem;
    private documentContext: DocumentContext;
    private codeServerContext: CodeServerContext;
    private webviewContext: WebviewContext;
    private perfForecastContext: PerformanceForecastContext;
    private ballerinaConfigPath: string;
    private isOpenedOnce: boolean;
    private ballerinaUserHome: string;
    private ballerinaUserHomeName; string;
    private ballerinaLatestVersion: string;
    private ballerinaLatestReleaseUrl: string;
    private ballerinaKolaVersion: string;
    private ballerinaKolaReleaseUrl: string;
    private ballerinaHomeCustomDirName: string;
    private ballerinaKolaHome: string;

    constructor() {
        this.ballerinaHome = '';
        this.ballerinaCmd = '';
        this.ballerinaVersion = '';
        this.isPersist = false;
        this.ballerinaUserHomeName = '.ballerina';
        this.ballerinaUserHome = path.join(this.getUserHomeDirectory(), this.ballerinaUserHomeName);
        this.ballerinaLatestVersion = "2201.10.2";
        this.ballerinaLatestReleaseUrl = "https://dist.ballerina.io/downloads/" + this.ballerinaLatestVersion;
        this.ballerinaKolaReleaseUrl = "https://api.github.com/repos/ballerina-platform/ballerina-distribution/releases";
        this.ballerinaHomeCustomDirName = "ballerina-home";
        this.ballerinaKolaHome = path.join(this.getBallerinaUserHome(), this.ballerinaHomeCustomDirName);
        this.showStatusBarItem();
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
                "enableInlayHints": <string>workspace.getConfiguration().get(ENABLE_INLAY_HINTS),
                "supportBalaScheme": "true",
                "supportQuickPick": "true",
                "supportPositionalRenamePopup": "true"
            }
        };
        this.telemetryReporter = createTelemetryReporter(this);
        this.documentContext = new DocumentContext();
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
            this.showCookieConsentMessage();
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
        const showLogs = commands.registerCommand('kolab.showLogs', () => {
            outputChannel.show();
        });
        this.context!.subscriptions.push(showLogs);

        commands.registerCommand(showMessageInstallBallerinaCommand, () => {
            this.showMessageInstallBallerina();
        });

        commands.registerCommand('kolab-setup.installBallerina', () => {
            this.installBallerina();
        });

        commands.registerCommand('kolab-setup.setupKola', () => {
            // this.setupKolaVersion();
            this.updateKolaVersion();
        });

        commands.registerCommand('kolab-setup.updateKola', () => {
            this.updateKolaVersion(true);
        });

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
            return this.getBallerinaVersion(this.ballerinaHome, this.overrideBallerinaHome()).then(async runtimeVersion => {
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

                await this.langClient.start();

                // Following was put in to handle server startup failures.
                if (this.langClient.state === LS_STATE.Stopped) {
                    const message = "Couldn't establish language server connection.";
                    sendTelemetryEvent(this, TM_EVENT_EXTENSION_INI_FAILED, CMP_EXTENSION_CORE, getMessageObject(message));
                    log(message);
                    this.showPluginActivationError();
                } else if (this.langClient.state === LS_STATE.Running) {
                    await this.langClient?.registerExtendedAPICapabilities();
                    this.updateStatusBar(this.ballerinaVersion);
                    sendTelemetryEvent(this, TM_EVENT_EXTENSION_INIT, CMP_EXTENSION_CORE);
                }

                commands.registerCommand('kolab.stopLangServer', () => {
                    this.langClient.stop();
                });

            }, (reason) => {
                sendTelemetryException(this, reason, CMP_EXTENSION_CORE);
                this.showMessageInstallBallerina();
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

    async installBallerina() {
        try {
            window.showInformationMessage("Downloading and setting up Ballerina...");
            console.log('Downloading and setting up Ballerina...');

            // Get the latest release installer url
            const installerUrl = this.getInstallerUrl();
            const parts = installerUrl.split("/");
            const installerName = parts[parts.length - 1];

            // Create ballerina user home directory if it doesn't exist
            if (!fs.existsSync(this.getBallerinaUserHome())) {
                fs.mkdirSync(this.getBallerinaUserHome(), { recursive: true });
            }

            const installerFilePath = path.join(this.getBallerinaUserHome(), installerName);

            // Download the installer and save it to the user home directory
            console.log('Starting download of Ballerina installer from:', installerUrl);
            const response = await axios({
                url: installerUrl,
                method: 'GET',
                responseType: 'arraybuffer',
                onDownloadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    console.log(`Download progress: ${percentCompleted}%`);
                }
            });
            console.log('Download of Ballerina installer completed.');
            await fs.writeFileSync(installerFilePath, response.data);

            // Install Ballerina
            var command = '';
            const platform = os.platform();
            if (platform === 'win32') {
                command = `msiexec /i ${installerFilePath}`;
            } else if (platform === 'linux') {
                command = `sudo dpkg -i ${installerFilePath}`;
            } else if (platform === 'darwin') {
                command = `sudo installer -pkg ${installerFilePath} -target /Library`;
            }
            const terminal = window.createTerminal('Install Ballerina');
            await terminal.sendText(command);
            await terminal.show();

            // Cleanup: Remove the downloaded zip file
            fs.rmSync(installerFilePath);

            console.log('Ballerina home has been set successfully.');
            window.showInformationMessage("Ballerina has been set up successfully.");
        } catch (error) {
            console.error('Error downloading or installing Ballerina:', error);
            window.showErrorMessage('Error downloading or installing Ballerina:', error);
        }
    }

    async setupKolaVersion() {
        try {
            window.showInformationMessage(`Setting up Ballerina Kola version`);

            await this.downloadAndUnzipBallerina();

            await this.setBallerinaHomeAndCommand();

            await this.setExecutablePermissions();

            let res: DownloadProgress = {
                message: `Success..`,
                success: true,
                step: 6 // This is the last step
            };
            RPCLayer._messenger.sendNotification(onDownloadProgress, { type: 'webview', webviewType: VisualizerWebview.viewType }, res);

            console.log('Ballerina home has been set successfully for Kola version.');
            window.showInformationMessage("Ballerina has been set up successfully for Kola version");
        } catch (error) {
            console.error('Error downloading or unzipping the Ballerina Kola version:', error);
            window.showErrorMessage('Error downloading or unzipping the Ballerina Kola version:', error);
        }
    }

    async updateKolaVersion(restartWindow?: boolean) {
        try {
            if (this.langClient?.isRunning()) {
                window.showInformationMessage(`Stopping the ballerina language server...`);
                await this.langClient.stop();
                await new Promise(resolve => setTimeout(resolve, 15000)); // Wait for 15 seconds
            }

            window.showInformationMessage(`Updating Ballerina Kola version`);
            // Remove the existing Ballerina Kola version
            fs.rmSync(this.ballerinaKolaHome, { recursive: true, force: true });

            await this.downloadAndUnzipBallerina(restartWindow);

            await this.setBallerinaHomeAndCommand();

            await this.setExecutablePermissions();

            let res: DownloadProgress = {
                message: `Success..`,
                success: true,
                step: 6 // This is the last step
            };
            RPCLayer._messenger.sendNotification(onDownloadProgress, { type: 'webview', webviewType: VisualizerWebview.viewType }, res);

            console.log('Ballerina home has been set successfully for Kola version.');
            if (restartWindow) {
                commands.executeCommand('workbench.action.reloadWindow');
            } else {
                window.showInformationMessage("Ballerina has been set up successfully for Kola version");
            }
        } catch (error) {
            console.error('Error downloading or unzipping the Ballerina Kola version:', error);
            window.showErrorMessage('Error downloading or unzipping the Ballerina Kola version:', error);
        }
    }

    private async downloadAndUnzipBallerina(restartWindow?: boolean) {
        try {
            // Get the latest successful daily build run and artifacts
            let res: DownloadProgress = {
                downloadedSize: 0,
                message: "Fetching kola release details..",
                percentage: 0,
                success: false,
                totalSize: 0,
                step: 1
            };
            RPCLayer._messenger.sendNotification(onDownloadProgress, { type: 'webview', webviewType: VisualizerWebview.viewType }, res);
            const releasesResponse = await axios.get(this.ballerinaKolaReleaseUrl);
            const releases = releasesResponse.data;
            const tags = releases.map((release: any) => release.tag_name).filter((tag: string) => tag.startsWith("v2201.11.0-bi-pack"));
            if (tags.length === 0) {
                throw new Error('No Kola distribution found in the releases');
            }
            const latestTag = tags[0];
            console.log(`Latest release tag: ${latestTag}`);

            // Get the latest successful daily build run and artifacts
            res = {
                downloadedSize: 0,
                message: "Fetching latest kola distribution details..",
                percentage: 0,
                success: false,
                totalSize: 0,
                step: 2
            };
            RPCLayer._messenger.sendNotification(onDownloadProgress, { type: 'webview', webviewType: VisualizerWebview.viewType }, res);
            const kolaReleaseResponse = await axios.get(`${this.ballerinaKolaReleaseUrl}/tags/${latestTag}`);
            const kolaRelease = kolaReleaseResponse.data;
            this.ballerinaKolaVersion = kolaRelease.tag_name.replace('v', '').split('-')[0];
            console.log(`Latest release version: ${this.ballerinaKolaVersion}`);

            const platform = os.platform();
            const asset = kolaRelease.assets.find((asset: any) => {
                if (platform === 'win32') {
                    return asset.name.endsWith('windows.zip');
                } else if (platform === 'linux') {
                    return asset.name.endsWith('linux.zip');
                } else if (platform === 'darwin') {
                    if (os.arch() === 'arm64') {
                        return asset.name.endsWith('macos-arm.zip');
                    } else {
                        return asset.name.endsWith('macos.zip');
                    }
                }
            });
            if (!asset) {
                throw new Error('No artifact found in the release ' + this.ballerinaKolaVersion);
            }
            const artifactUrl = asset.browser_download_url;

            // Create destination folder if it doesn't exist
            if (!fs.existsSync(this.getBallerinaUserHome())) {
                fs.mkdirSync(this.getBallerinaUserHome(), { recursive: true });
            }

            // Download the artifact and save it to the user home directory
            console.log(`Downloading artifact from ${artifactUrl}`);
            let response;
            try {
                res = {
                    downloadedSize: 0,
                    message: "Download starting...",
                    percentage: 0,
                    success: false,
                    totalSize: 0,
                    step: 3
                };
                RPCLayer._messenger.sendNotification(onDownloadProgress, { type: 'webview', webviewType: VisualizerWebview.viewType }, res);
                const sizeMB = 1024 * 1024;
                await window.withProgress(
                    {
                        location: ProgressLocation.Notification,
                        title: `Downloading Kola distribution`,
                        cancellable: false,
                    },
                    async (progress) => {
                        let lastPercentageReported = 0;

                        response = await axios({
                            url: artifactUrl,
                            method: 'GET',
                            responseType: 'arraybuffer',
                            onDownloadProgress: (progressEvent) => {
                                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                                console.log(`Total Size: ${progressEvent.total / sizeMB}MB`);
                                console.log(`Download progress: ${percentCompleted}%`);

                                if (percentCompleted > lastPercentageReported) {
                                    progress.report({ increment: percentCompleted - lastPercentageReported, message: `${percentCompleted}% of ${Math.round(progressEvent.total / sizeMB)}MB` });
                                    lastPercentageReported = percentCompleted;
                                }

                                // Sizes will be sent as MB
                                res = {
                                    downloadedSize: progressEvent.loaded / sizeMB,
                                    message: "Downloading...",
                                    percentage: percentCompleted,
                                    success: false,
                                    totalSize: progressEvent.total / sizeMB,
                                    step: 2
                                };
                                RPCLayer._messenger.sendNotification(onDownloadProgress, { type: 'webview', webviewType: VisualizerWebview.viewType }, res);
                            }
                        });
                        if (restartWindow) {
                            window.showInformationMessage("Download complete. Please wait...");
                        }
                        return;
                    }
                );
                // ... existing code to handle the response ...
            } catch (error) {
                // Sizes will be sent as MB
                res = {
                    ...res,
                    message: `Failed: ${error}`,
                    success: false,
                    step: -1 // Error step
                };
                RPCLayer._messenger.sendNotification(onDownloadProgress, { type: 'webview', webviewType: VisualizerWebview.viewType }, res);
                console.error('Error downloading artifact:', error);
            }
            const zipFilePath = path.join(this.getBallerinaUserHome(), asset.name);
            await fs.writeFileSync(zipFilePath, response.data);
            console.log(`Downloaded artifact to ${zipFilePath}`);

            if (restartWindow) {
                window.showInformationMessage("Setting the Kola Home location...");
            }
            res = {
                ...res,
                message: `Setting the Kola Home location...`,
                success: false,
                step: 4
            };
            RPCLayer._messenger.sendNotification(onDownloadProgress, { type: 'webview', webviewType: VisualizerWebview.viewType }, res);
            // Unzip the artifact
            const zip = new AdmZip(zipFilePath);
            zip.extractAllTo(this.getBallerinaUserHome(), true);
            console.log(`Unzipped artifact to ${this.getBallerinaUserHome()}`);

            // Rename the root folder to the new name
            const tempRootPath = path.join(this.getBallerinaUserHome(), asset.name.replace('.zip', ''));
            fs.renameSync(tempRootPath, this.ballerinaKolaHome);

            if (restartWindow) {
                window.showInformationMessage("Cleaning up the temp files...");
            }
            res = {
                ...res,
                message: `Cleaning up the temp files...`,
                success: false,
                step: 5
            };
            RPCLayer._messenger.sendNotification(onDownloadProgress, { type: 'webview', webviewType: VisualizerWebview.viewType }, res);
            // Cleanup: Remove the downloaded zip file
            fs.rmSync(zipFilePath);

            console.log('Cleanup complete.');
        } catch (error) {
            console.error('Error downloading or unzipping Ballerina Kola version:', error);
            window.showErrorMessage('Error downloading or unzipping Ballerina Kola version:', error);
        }
    }

    private async setBallerinaHomeAndCommand() {
        let exeExtension = "";
        if (isWindows()) {
            exeExtension = ".bat";
        }

        // Set the Ballerina Home and Command
        this.ballerinaHome = this.ballerinaKolaHome;
        this.ballerinaCmd = join(this.ballerinaHome, "bin") + sep + "bal" + exeExtension;

        // Update the configuration with the new Ballerina Home
        let res: DownloadProgress = {
            message: `Setting the configurable values in vscode...`,
            success: false,
            step: 4
        };
        RPCLayer._messenger.sendNotification(onDownloadProgress, { type: 'webview', webviewType: VisualizerWebview.viewType }, res);
        workspace.getConfiguration().update(BALLERINA_HOME, this.ballerinaHome, ConfigurationTarget.Global);
        workspace.getConfiguration().update(OVERRIDE_BALLERINA_HOME, true, ConfigurationTarget.Global);
    }

    private async setExecutablePermissions() {
        try {
            let res: DownloadProgress = {
                message: `Setting the kola distribution permissions...`,
                success: false,
                step: 4
            };
            RPCLayer._messenger.sendNotification(onDownloadProgress, { type: 'webview', webviewType: VisualizerWebview.viewType }, res);

            // Set permissions for the ballerina command
            await fs.promises.chmod(this.getBallerinaCmd(), 0o555);

            // Set permissions for lib
            await this.setPermissionsForDirectory(path.join(this.getBallerinaHome(), 'lib'), 0o555);

            // Set permissions for all files in the distributions
            await this.setPermissionsForDirectory(path.join(this.getBallerinaHome(), 'distributions'), 0o555);

            // Set permissions for all files in the dependencies
            await this.setPermissionsForDirectory(path.join(this.getBallerinaHome(), 'dependencies'), 0o555);

            console.log('Command files are now executable.');
        } catch (error) {
            console.error('Failed to set executable permissions:', error);
        }
    }

    private async setPermissionsForDirectory(directory: string, permissions: number) {
        const files = fs.readdirSync(directory);
        for (const file of files) {
            const fullPath = path.join(directory, file);
            if (fs.statSync(fullPath).isDirectory()) {
                await fs.promises.chmod(fullPath, permissions);
                await this.setPermissionsForDirectory(fullPath, permissions);
            } else {
                await fs.promises.chmod(fullPath, permissions);
            }
        }
    }

    private getInstallerUrl(): string {
        const platform = os.platform();
        if (platform === 'win32') {
            return this.ballerinaLatestReleaseUrl + "/ballerina-" + this.ballerinaLatestVersion + "-swan-lake-windows-x64.msi";
        } else if (platform === 'linux') {
            return this.ballerinaLatestReleaseUrl + "/ballerina-" + this.ballerinaLatestVersion + "-swan-lake-linux-x64.deb";
        } else if (platform === 'darwin') {
            if (os.arch() === 'arm') {
                return this.ballerinaLatestReleaseUrl + "/ballerina-" + this.ballerinaLatestVersion + "-swan-lake-macos-arm-x64.pkg";
            } else {
                return this.ballerinaLatestReleaseUrl + "/ballerina-" + this.ballerinaLatestVersion + "-swan-lake-macos-x64.pkg";
            }
        }
        return null;
    }

    private getUserHomeDirectory(): string {
        return os.homedir();
    }

    getBallerinaUserHome(): string {
        return this.ballerinaUserHome;
    }

    showStatusBarItem() {
        this.sdkVersion = window.createStatusBarItem(StatusBarAlignment.Right, 100);
        this.updateStatusBar("Detecting");
        this.sdkVersion.command = "kolab.showLogs";
        this.sdkVersion.show();

        window.onDidChangeActiveTextEditor((editor) => {
            this.sdkVersion.text = this.sdkVersion.text.replace(SDK_PREFIX, '');
            if (!editor) {
                this.updateStatusBar(this.sdkVersion.text);
                this.sdkVersion.show();
            } else if (editor.document.uri.scheme === 'file' && editor.document.languageId === 'ballerina') {
                this.sdkVersion.show();
            } else {
                this.sdkVersion.hide();
            }
        });
    }

    updateStatusBar(text: string) {
        if (!window.activeTextEditor) {
            this.sdkVersion.text = `${SDK_PREFIX}${text}`;
        } else {
            this.sdkVersion.text = text;
        }
    }

    showPluginActivationError(): any {
        // message to display on Unknown errors.
        // ask to enable debug logs.
        // we can ask the user to report the issue.

        // HACK: Remove this for the Kola extension. This should handle with Ballerina setup page.
        // this.updateStatusBar("Error");
        // this.sdkVersion.backgroundColor = new ThemeColor("statusBarItem.errorBackground");
        // window.showErrorMessage(UNKNOWN_ERROR);
    }

    registerPreInitHandlers(): any {
        // We need to restart VSCode if we change plugin configurations.
        workspace.onDidChangeConfiguration((params: ConfigurationChangeEvent) => {
            if (params.affectsConfiguration(BALLERINA_HOME)
                || params.affectsConfiguration(OVERRIDE_BALLERINA_HOME)
                || params.affectsConfiguration(ENABLE_ALL_CODELENS)
                || params.affectsConfiguration(ENABLE_DEBUG_LOG)
                || params.affectsConfiguration(ENABLE_BALLERINA_LS_DEBUG)
                || params.affectsConfiguration(ENABLE_EXPERIMENTAL_FEATURES)
                || params.affectsConfiguration(ENABLE_NOTEBOOK_DEBUG)
                || params.affectsConfiguration(ENABLE_LIVE_RELOAD)) {
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

    showMissingBallerinaErrInStatusBar(): any {
        this.updateStatusBar("Not Found");
        this.sdkVersion.backgroundColor = new ThemeColor("statusBarItem.errorBackground");
        this.sdkVersion.command = showMessageInstallBallerinaCommand;
    }

    showMessageInstallBallerina(): any {
        const download: string = 'Download';
        const viewLogs: string = 'View Logs';
        window.showWarningMessage(INSTALL_BALLERINA, download, viewLogs).then((selection) => {
            if (download === selection) {
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

    showCookieConsentMessage(): any {
        const go: string = 'Go to console';
        window.showInformationMessage(COOKIE_SETTINGS, go).then(async (selection) => {
            const url = process.env.VSCODE_CHOREO_DEPLOY_URI;
            if (go === selection && url) {
                const callbackUri = await env.asExternalUri(Uri.parse(url));
                commands.executeCommand("vscode.open", callbackUri);
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

    getPersistDiagramStatus(): boolean {
        return this.isPersist;
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
            const args = ['home'];
            let response;
            if (isWindows()) {
                // On Windows, use cmd.exe to run .bat files
                response = spawnSync('cmd.exe', ['/c', this.ballerinaCmd, ...args], { shell: true });
            } else {
                // On other platforms, use spawnSync directly
                response = spawnSync(this.ballerinaCmd, args, { shell: false });
            }
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

    public isCodeServerEnv(): boolean {
        return process.env.CODE_SERVER_ENV === 'true';
    }

    public enableLSDebug(): boolean {
        return this.overrideBallerinaHome() && <boolean>workspace.getConfiguration().get(ENABLE_BALLERINA_LS_DEBUG);
    }

    public enabledLiveReload(): boolean {
        return isSupportedSLVersion(this, 2201100) && workspace.getConfiguration().get(ENABLE_LIVE_RELOAD);
    }

    public enabledPerformanceForecasting(): boolean {
        return <boolean>workspace.getConfiguration().get(ENABLE_PERFORMANCE_FORECAST);
    }

    public enabledExperimentalFeatures(): boolean {
        return <boolean>workspace.getConfiguration().get(ENABLE_EXPERIMENTAL_FEATURES);
    }

    public enabledNotebookDebugMode(): boolean {
        return <boolean>workspace.getConfiguration().get(ENABLE_NOTEBOOK_DEBUG);
    }

    public enabledRunFast(): boolean {
        return <boolean>workspace.getConfiguration().get(ENABLE_RUN_FAST);
    }

    public getFileDownloadPath(): string {
        return <string>workspace.getConfiguration().get(FILE_DOWNLOAD_PATH);
    }

    public async updatePerformanceForecastSetting(status: boolean) {
        await workspace.getConfiguration().update(ENABLE_PERFORMANCE_FORECAST, status);
    }

    public enableSequenceDiagramView(): boolean {
        return <boolean>workspace.getConfiguration().get(ENABLE_SEQUENCE_DIAGRAM_VIEW);
    }

    public enableAiSuggestions(): boolean {
        return <boolean>workspace.getConfiguration().get(ENABLE_AI_SUGGESTIONS);
    }

    public getDocumentContext(): DocumentContext {
        return this.documentContext;
    }

    public setDiagramActiveContext(value: boolean) {
        commands.executeCommand('setContext', 'isBallerinaDiagram', value);
        this.documentContext.setActiveDiagram(value);
    }

    public setPersistStatusContext(textEditor: TextEditor) {
        if (textEditor?.document) {
            const fileUri: Uri = textEditor.document.uri;
            if (checkIsPersistModelFile(fileUri)) {
                this.isPersist = true;
                commands.executeCommand('setContext', 'isPersistModelActive', true);
                return;
            } else {
                this.isPersist = false;
            }
        }
        commands.executeCommand('setContext', 'isPersistModelActive', false);
    }

    public setChoreoAuthEnabled(value: boolean) {
        commands.executeCommand('setContext', 'isChoreoAuthEnabled', value);
    }
    public getChoreoSession(): ChoreoSession {
        return {
            loginStatus: false
        };
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

    public getIsOpenedOnce(): boolean {
        return this.isOpenedOnce;
    }

    public setIsOpenedOnce(state: boolean) {
        this.isOpenedOnce = state;
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
    private ballerinProject: BallerinaProject;

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

    public setCurrentProject(ballerinProject: BallerinaProject) {
        commands.executeCommand('setContext', 'isBallerinaProject', true);
        this.ballerinProject = ballerinProject;
    }

    public getCurrentProject(): BallerinaProject {
        return this.ballerinProject;
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
