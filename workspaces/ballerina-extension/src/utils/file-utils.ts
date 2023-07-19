/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { window, Uri, workspace, ProgressLocation, ConfigurationTarget, MessageItem, Progress, commands } from "vscode";
import axios from "axios";
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { FILE_DOWNLOAD_PATH, BallerinaExtension } from "../core";

interface ProgressMessage {
    message: string;
    increment?: number;
}

export async function handleOpenFile(ballerinaExtInstance: BallerinaExtension, gist: string, fileName: string) {
    await window.withProgress({
        location: ProgressLocation.Notification,
        title: 'Opening file',
        cancellable: true
    }, async (progress, cancellationToken) => {

        let cancelled: boolean = false;
        cancellationToken.onCancellationRequested(async () => {
            cancelled = true;
        });

        const gistOwner = "ballerina-github-bot";

        try {
            progress.report({ message: "Verifying the gist file." });
            const response = await axios.get(`https://api.github.com/gists/${gist}`);

            const gistDetails = response.data;
            const responseOwner = gistDetails.owner.login;
            const validGist = gistOwner === responseOwner;

            if (validGist && fileName.endsWith('.bal')) {
                const rawFileLink = `https://gist.githubusercontent.com/${gistOwner}/${gist}/raw/${fileName}`;
                const defaultDownloadsPath = path.join(os.homedir(), 'Downloads'); // Construct the default downloads path
                const selectedPath = ballerinaExtInstance.getFileDownloadPath() || defaultDownloadsPath;
                await updateDirectoryPath(selectedPath);
                const filePath = path.join(selectedPath, fileName);
                handleDownloadFile(rawFileLink, filePath, progress, cancelled);
            } else {
                window.showErrorMessage(`Gist or the file is not valid.`);
                return;
            }
        } catch (error) {
            window.showErrorMessage(`The given gist file is not valid.`, error);
        }


    })
}

export async function handleOpenRepo(ballerinaExtInstance: BallerinaExtension, repoUrl: string) {
    try {
        if (!repoUrl.includes("wso2")) {
            const errorMsg = `Not a valid repository.`;
            await window.showWarningMessage(errorMsg);
            return;
        }
        const defaultDownloadsPath = path.join(os.homedir(), 'Downloads'); // Construct the default downloads path
        const selectedPath = ballerinaExtInstance.getFileDownloadPath() || defaultDownloadsPath;
        await commands.executeCommand('git.clone', repoUrl, selectedPath);
    } catch (error: any) {
        const errorMsg = `Repository clonning error: ${error.message}`;
        await window.showErrorMessage(errorMsg);
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
};

async function selectFileDownloadPath() {
    const folderPath = await window.showOpenDialog({ title: 'Ballerina samples download directory', canSelectFolders: true, canSelectFiles: false, openLabel: 'Select Folder' })
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

    const successMsg = `The Ballerina sample file has been downloaded successfully to the following directory: ${defaultDownloadsPath}.`;
    const changePath: MessageItem = { title: 'Change Directory' };
    openFileInVSCode(defaultDownloadsPath);
    const success = await window.showInformationMessage(
        successMsg,
        changePath
    );
    if (success === changePath) {
        await selectFileDownloadPath();
    }
}


async function openFileInVSCode(filePath: string): Promise<void> {
    const uri = Uri.file(filePath);
    try {
        const document = await workspace.openTextDocument(uri);
        await window.showTextDocument(document);
    } catch (error) {
        window.showErrorMessage(`Failed to open file: ${error}`);
    }
}

function getProjectFolderName(repoUrl) {
    // Remove protocol, domain, and ".git" suffix
    const path = repoUrl.replace(/^https?:\/\/[^/]+\/|\.git$/g, '');

    // Extract the project folder
    const folders = path.split('/');
    const projectFolder = folders[folders.length - 1];

    return projectFolder;
}

async function openDirectory(directoryPath) {
    const uri = Uri.file(directoryPath);
    await commands.executeCommand('vscode.openFolder', uri, false);
}