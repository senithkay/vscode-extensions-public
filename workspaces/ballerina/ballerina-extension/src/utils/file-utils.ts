/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { window, Uri, workspace, ProgressLocation, ConfigurationTarget, MessageItem, Progress, commands, StatusBarAlignment, languages } from "vscode";
import { GetSyntaxTreeResponse } from "@wso2-enterprise/ballerina-languageclient";
import axios from "axios";
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { FILE_DOWNLOAD_PATH, BallerinaExtension, ExtendedLangClient } from "../core";
import {
    CMP_OPEN_VSCODE_URL,
    TM_EVENT_OPEN_FILE_CANCELED,
    TM_EVENT_OPEN_FILE_CHANGE_PATH,
    TM_EVENT_OPEN_FILE_NEW_FOLDER,
    TM_EVENT_OPEN_FILE_SAME_FOLDER,
    TM_EVENT_OPEN_REPO_CANCELED,
    TM_EVENT_OPEN_REPO_CHANGE_PATH,
    TM_EVENT_OPEN_REPO_CLONE_NOW,
    TM_EVENT_OPEN_REPO_NEW_FOLDER,
    TM_EVENT_OPEN_REPO_SAME_FOLDER,
    sendTelemetryEvent
} from "../telemetry";
interface ProgressMessage {
    message: string;
    increment?: number;
}

const allowedOrgList = ['ballerina-platform', 'ballerina-guides', 'ballerinax', 'wso2'];
const gitDomain = "github.com";
const gistOwner = "ballerina-github-bot";
const tempStartingFile = "tempStartingFile";
const ballerinaToml = "Ballerina.toml";

const buildStatusItem = window.createStatusBarItem(StatusBarAlignment.Left, 100);

export async function handleOpenFile(ballerinaExtInstance: BallerinaExtension, gist: string, file: string, repoFileUrl?: string) {

    const defaultDownloadsPath = path.join(os.homedir(), 'Downloads'); // Construct the default downloads path
    const selectedPath = ballerinaExtInstance.getFileDownloadPath() || defaultDownloadsPath;
    await updateDirectoryPath(selectedPath);
    let validDomain = false;
    let validGist = false;
    let validRepo = false;
    // Domain verification for git file download
    if (repoFileUrl) {
        const url = new URL(repoFileUrl);
        const mainDomain = url.hostname;
        validDomain = mainDomain === gitDomain;
        if (validDomain) {
            const username = getGithubUsername(repoFileUrl);
            if (allowedOrgList.includes(username)) {
                validRepo = true;
            }
        }
    }
    const fileName = file || path.basename(new URL(repoFileUrl).pathname);
    const filePath = path.join(selectedPath, fileName);
    let isSuccess = false;

    await window.withProgress({
        location: ProgressLocation.Notification,
        title: 'Opening file',
        cancellable: true
    }, async (progress, cancellationToken) => {

        let cancelled: boolean = false;
        cancellationToken.onCancellationRequested(async () => {
            cancelled = true;
        });

        try {
            if (fileName.endsWith('.bal')) {
                let rawFileLink = repoFileUrl && getGitHubRawFileUrl(repoFileUrl);
                if (gist) {
                    const response = await axios.get(`https://api.github.com/gists/${gist}`);
                    const gistDetails = response.data;
                    rawFileLink = gistDetails.files[fileName].raw_url;
                    const responseOwner = gistDetails.owner.login;
                    validGist = gistOwner === responseOwner;
                }
                if (validGist || validRepo) {
                    await handleDownloadFile(rawFileLink, filePath, progress, cancelled);
                    isSuccess = true;
                    return;
                } else {
                    window.showErrorMessage(`File url is not valid.`);
                    return;
                }
            } else {
                window.showErrorMessage(`Not a ballerina file.`);
                return;
            }
        } catch (error) {
            window.showErrorMessage(`The given file is not valid.`, error);
        }
    });

    if (isSuccess) {
        const successMsg = `The Ballerina sample file has been downloaded successfully to the following directory: ${filePath}.`;
        const changePath: MessageItem = { title: 'Change Directory' };
        openFileInVSCode(ballerinaExtInstance, filePath);
        const success = await window.showInformationMessage(
            successMsg,
            changePath
        );
        if (success === changePath) {
            sendTelemetryEvent(ballerinaExtInstance, TM_EVENT_OPEN_FILE_CHANGE_PATH, CMP_OPEN_VSCODE_URL);
            await selectFileDownloadPath();
        }
    }
}

export async function handleOpenRepo(ballerinaExtInstance: BallerinaExtension, repoUrl: string, specificFileName?: string) {
    try {
        const defaultDownloadsPath = path.join(os.homedir(), 'Downloads'); // Construct the default downloads path
        const selectedPath = ballerinaExtInstance.getFileDownloadPath() || defaultDownloadsPath;
        const username = getGithubUsername(repoUrl);
        if (allowedOrgList.includes(username)) {
            const message = `Repository will be cloned to the following directory.`;
            const cloneAnyway: MessageItem = { title: "Clone Now" };
            const changePath: MessageItem = { title: 'Change Directory' };
            const result = await window.showInformationMessage(message, { detail: `${selectedPath}`, modal: true }, cloneAnyway, changePath);
            if (result === cloneAnyway) {
                sendTelemetryEvent(ballerinaExtInstance, TM_EVENT_OPEN_REPO_CLONE_NOW, CMP_OPEN_VSCODE_URL);
                cloneRepo(repoUrl, selectedPath, specificFileName, ballerinaExtInstance);
            } else if (result === changePath) {
                sendTelemetryEvent(ballerinaExtInstance, TM_EVENT_OPEN_REPO_CHANGE_PATH, CMP_OPEN_VSCODE_URL);
                const newPath = await selectFileDownloadPath();
                cloneRepo(repoUrl, newPath, specificFileName, ballerinaExtInstance);
            } else {
                sendTelemetryEvent(ballerinaExtInstance, TM_EVENT_OPEN_REPO_CANCELED, CMP_OPEN_VSCODE_URL);
                window.showErrorMessage(`Repository clone canceled.`);
                return;
            }
        } else {
            window.showErrorMessage(`Unauthorized repository.`);
            return;
        }
    } catch (error: any) {
        const errorMsg = `Repository cloning error: ${error.message}`;
        await window.showErrorMessage(errorMsg);
    }
}

async function cloneRepo(repoUrl: string, selectedPath: string, specificFileName: string, ballerinaExtInstance: BallerinaExtension) {
    const repoFolderName = path.basename(new URL(repoUrl).pathname).replace(".git", "");
    const repoPath = path.join(selectedPath, repoFolderName);
    if (specificFileName) {
        const filePath = path.join(repoPath, specificFileName);
        writeClonedFilePathToTemp(ballerinaExtInstance, filePath);
    }
    if (folderExists(repoPath)) {
        openRepoInVSCode(ballerinaExtInstance, repoPath);
    } else {
        await commands.executeCommand('git.clone', repoUrl, selectedPath);
    }
}

async function downloadFile(url, filePath, progressCallback) {
    const writer = fs.createWriteStream(filePath);
    let totalBytes = 0;
    try {
        const response = await axios.get(url, {
            responseType: 'stream',
            onDownloadProgress: (progressEvent) => {
                totalBytes = progressEvent.total;
                const progress = (progressEvent.loaded / totalBytes) * 100;
                if (progressCallback) {
                    progressCallback(progress);
                }
            }
        });
        response.data.pipe(writer);
        await new Promise<void>((resolve, reject) => {
            writer.on('finish', () => {
                writer.close();
                resolve();
            });

            writer.on('error', (error) => {
                reject(error);
            });
        });
    } catch (error) {
        window.showErrorMessage(`File download failed.`, error);
        throw error;
    }
}

async function selectFileDownloadPath() {
    const folderPath = await window.showOpenDialog({ title: 'Ballerina samples download directory', canSelectFolders: true, canSelectFiles: false, openLabel: 'Select Folder' });
    if (folderPath && folderPath.length > 0) {
        const newlySelectedFolder = folderPath[0].fsPath;
        try {
            await updateDirectoryPath(newlySelectedFolder);
            return newlySelectedFolder;
        } catch (error) {
            window.showErrorMessage(`Directory update failed.`, error);
        }
    }
    return;
}

async function updateDirectoryPath(newlySelectedFolder) {
    const config = workspace.getConfiguration();
    await config.update(FILE_DOWNLOAD_PATH, newlySelectedFolder, ConfigurationTarget.Global);
}

async function handleDownloadFile(rawFileLink: string, defaultDownloadsPath: string, progress: Progress<ProgressMessage>, cancelled: boolean) {
    const handleProgress = (progressPercentage) => {
        progress.report({ message: "Downloading file...", increment: progressPercentage });
    };

    progress.report({ message: "Downloading file..." });
    try {
        await downloadFile(rawFileLink, defaultDownloadsPath, handleProgress);
    } catch (error) {
        window.showErrorMessage(`Failed to download file: ${error}`);
    }
    progress.report({ message: "Download finished" });
}

async function openFileInVSCode(ballerinaExtInstance: BallerinaExtension, filePath: string): Promise<void> {
    const uri = Uri.file(filePath);
    const message = `Would you like to open the downloaded file?`;
    const newWindow: MessageItem = { title: "Open in New Window" };
    const sameWindow: MessageItem = { title: 'Open' };
    const result = await window.showInformationMessage(message, { modal: true }, sameWindow, newWindow);
    if (!result) {
        sendTelemetryEvent(ballerinaExtInstance, TM_EVENT_OPEN_FILE_CANCELED, CMP_OPEN_VSCODE_URL);
        return; // User cancelled
    }
    try {
        switch (result) {
            case newWindow:
                await commands.executeCommand('vscode.openFolder', uri, { forceNewWindow: true });
                sendTelemetryEvent(ballerinaExtInstance, TM_EVENT_OPEN_FILE_NEW_FOLDER, CMP_OPEN_VSCODE_URL);
                break;
            case sameWindow:
                const document = await workspace.openTextDocument(uri);
                await window.showTextDocument(document, { preview: false });
                sendTelemetryEvent(ballerinaExtInstance, TM_EVENT_OPEN_FILE_SAME_FOLDER, CMP_OPEN_VSCODE_URL);
                break;
            default:
                break;
        }
    } catch (error) {
        window.showErrorMessage(`Failed to open file: ${error}`);
    }
}

async function openRepoInVSCode(ballerinaExtInstance: BallerinaExtension, filePath: string): Promise<void> {
    const uri = Uri.file(`${filePath}`);
    const message = `Repository already exists. Would you like to open the existing repository folder?`;
    const newWindow: MessageItem = { title: "Open in New Window" };
    const sameWindow: MessageItem = { title: 'Open' };
    const result = await window.showInformationMessage(message, { modal: true }, sameWindow, newWindow);
    if (!result) {
        sendTelemetryEvent(ballerinaExtInstance, TM_EVENT_OPEN_REPO_CANCELED, CMP_OPEN_VSCODE_URL);
        return; // User cancelled
    }
    handleSameWorkspaceFileOpen(ballerinaExtInstance, filePath); // If opened workspace is same open the file
    try {
        switch (result) {
            case newWindow:
                await commands.executeCommand('vscode.openFolder', uri, { forceNewWindow: true });
                sendTelemetryEvent(ballerinaExtInstance, TM_EVENT_OPEN_REPO_NEW_FOLDER, CMP_OPEN_VSCODE_URL);
                break;
            case sameWindow:
                await commands.executeCommand('vscode.openFolder', uri);
                sendTelemetryEvent(ballerinaExtInstance, TM_EVENT_OPEN_REPO_SAME_FOLDER, CMP_OPEN_VSCODE_URL);
                break;
            default:
                break;
        }
    } catch (error) {
        window.showErrorMessage(`Failed to open folder: ${error}`);
    }
}

function handleSameWorkspaceFileOpen(ballerinaExtInstance: BallerinaExtension, filePath: string) {
    const workspaceFolders = workspace.workspaceFolders;
    if (workspaceFolders && workspaceFolders.length > 0) {
        const workspaceFolder = workspaceFolders[0];
        const workspaceFolderPath = workspaceFolder.uri.fsPath;
        if (filePath === workspaceFolderPath) {
            readStoredClonedFilePathFromTemp(ballerinaExtInstance);
        }
    }
}

function writeClonedFilePathToTemp(ballerinaExtInstance: BallerinaExtension, selectedPath) {
    ballerinaExtInstance.context.globalState.update(tempStartingFile, selectedPath);
}

// Function to open the stored cloned file path from the global state
export async function readStoredClonedFilePathFromTemp(ballerinaExtInstance: BallerinaExtension) {
    const pathValue = ballerinaExtInstance.context.globalState.get(tempStartingFile) as string;
    if (pathValue) {
        try {
            // Open the specific file
            const document = await workspace.openTextDocument(pathValue);
            await window.showTextDocument(document);
            ballerinaExtInstance.setVscodeUrlCommandState(true);
        } catch (error) {
            window.showErrorMessage(`Error opening ${pathValue}: ${error}`);
        }
        writeClonedFilePathToTemp(ballerinaExtInstance, "");
    }
}

// Function to check if a folder with the given name exists
function folderExists(folderPath) {
    try {
        const stats = fs.statSync(folderPath);
        return stats.isDirectory();
    } catch (error) {
        return false;
    }
}

// Function to extract the organization/username
function getGithubUsername(url) {
    const urlParts = url.split('/');
    const username = urlParts[3];
    return username;
}

function getGitHubRawFileUrl(githubFileUrl) {
    const urlParts = githubFileUrl.split('/');
    const username = urlParts[3];
    const repository = urlParts[4];
    const branch = urlParts[6];
    const filePath = urlParts.slice(7).join('/');

    const rawFileUrl = `https://raw.githubusercontent.com/${username}/${repository}/${branch}/${filePath}`;
    return rawFileUrl;
}

async function resolveModules(langClient: ExtendedLangClient, pathValue) {
    const isBallerinProject = findBallerinaTomlFile(pathValue);
    if (isBallerinProject) {
        // Create a status bar item for the build notification
        buildStatusItem.text = "$(sync~spin) Pulling modules...";
        buildStatusItem.tooltip = "Pulling the missing ballerina modules.";
        const uriString = Uri.file(pathValue).toString();
        buildStatusItem.show();
        // Show the progress bar.
        await window.withProgress({
            location: ProgressLocation.Notification,
            title: `Pulling all missing ballerina modules...`,
            cancellable: false
        }, async (progress) => {
            progress.report({ increment: 30 });
            // Resolve missing dependencies.
            const dependenciesResponse = await langClient.resolveMissingDependencies({
                documentIdentifier: {
                    uri: uriString
                }
            });
            const response = dependenciesResponse as GetSyntaxTreeResponse;
            if (response.parseSuccess) {
                progress.report({ increment: 60 });
                // Rebuild the file to update the LS.
                await langClient.didChange({
                    contentChanges: [{ text: "" }],
                    textDocument: {
                        uri: uriString,
                        version: 1
                    }
                });
                progress.report({ increment: 100 });
            } else {
                window.showErrorMessage("Failed to pull modules");
            }
            buildStatusItem.hide();
        });
    }
}

function findBallerinaTomlFile(filePath) {
    let currentFolderPath = path.dirname(filePath);

    while (currentFolderPath !== path.sep) {
        const tomlFilePath = path.join(currentFolderPath, ballerinaToml);
        if (fs.existsSync(tomlFilePath)) {
            return currentFolderPath;
        }

        currentFolderPath = path.dirname(currentFolderPath);
    }

    return null; // Ballerina.toml not found in any parent folder
}

export function handleResolveMissingDependencies(ballerinaExtInstance: BallerinaExtension) {
    const langClient = ballerinaExtInstance.langClient;
    // Listen for diagnostic changes
    languages.onDidChangeDiagnostics(async (e) => {
        const activeEditor = window.activeTextEditor;
        if (activeEditor && activeEditor.document.languageId === 'ballerina') {
            const uri = activeEditor.document.uri;
            const diagnostics = languages.getDiagnostics(uri);
            if (diagnostics.length > 0 && diagnostics.filter(diag => diag.code === "BCE2003").length > 0) {
                if (ballerinaExtInstance.getIsVscodeUrlCommand()) {
                    resolveModules(langClient, uri.fsPath);
                    ballerinaExtInstance.setVscodeUrlCommandState(false);
                } else {
                    const message = `Unresolved modules found.`;
                    const pullModules: MessageItem = { title: "Pull Modules" };
                    const result = await window.showInformationMessage(message, pullModules);
                    if (result === pullModules) {
                        resolveModules(langClient, uri.fsPath);
                    }
                }
            }
        }
    });
}
