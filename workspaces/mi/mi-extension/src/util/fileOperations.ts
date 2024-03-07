/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { Progress, window, ProgressLocation, MessageItem, workspace } from "vscode";
import * as fs from 'fs';
import * as os from 'os';
import axios from "axios";
import * as path from 'path';
import { XMLBuilder } from "fast-xml-parser";
import { XMLParser } from "fast-xml-parser";

interface ProgressMessage {
    message: string;
    increment?: number;
}

async function selectFileDownloadPath(): Promise<string> {
    const folderPath = await window.showOpenDialog({ title: 'Sample download directory', canSelectFolders: true, canSelectFiles: false, openLabel: 'Select Folder' });
    if (folderPath && folderPath.length > 0) {
        const newlySelectedFolder = folderPath[0].fsPath;
        return newlySelectedFolder;
    }
    return "";
}

async function downloadFile(url, filePath, progressCallback) {
    const writer = fs.createWriteStream(filePath);
    let totalBytes = 0;
    try {
        const response = await axios.get(url, {
            responseType: 'stream',
            onDownloadProgress: (progressEvent) => {
                totalBytes = progressEvent.total!;
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
        window.showErrorMessage(`Error while downloading the file: ${error}`);
        throw error;
    }
}

async function handleDownloadFile(rawFileLink: string, defaultDownloadsPath: string, progress: Progress<ProgressMessage>, cancelled: boolean) {
    const handleProgress = (progressPercentage) => {
        progress.report({ message: "Downloading file...", increment: progressPercentage });
    };
    try {
        await downloadFile(rawFileLink, defaultDownloadsPath, handleProgress);
    } catch (error) {
        window.showErrorMessage(`Failed to download file: ${error}`);
    }
    progress.report({ message: "Download finished" });
}

export async function handleOpenFile(sampleName: string, repoUrl: string) {

    const rawFileLink = repoUrl + sampleName + '/IS_SAMPLE.zip';
    const defaultDownloadsPath = path.join(os.homedir(), 'Downloads'); // Construct the default downloads path
    const pathFromDialog = await selectFileDownloadPath();
    const selectedPath = pathFromDialog === "" ? defaultDownloadsPath : pathFromDialog;
    const filePath = path.join(selectedPath, sampleName + '.zip');
    let isSuccess = false;

    await window.withProgress({
        location: ProgressLocation.Notification,
        title: 'Downloading file',
        cancellable: true
    }, async (progress, cancellationToken) => {

        let cancelled: boolean = false;
        cancellationToken.onCancellationRequested(async () => {
            cancelled = true;
        });

        try {
            await handleDownloadFile(rawFileLink, filePath, progress, cancelled);
            isSuccess = true;
            return;
        } catch (error) {
            window.showErrorMessage(`Error while downloading the file: ${error}`);
        }
    });

    if (isSuccess) {
        const successMsg = `The Integration sample file has been downloaded successfully to the following directory: ${filePath}.`;
        const document = await workspace.openTextDocument(filePath);
        window.showTextDocument(document, { preview: true });
        window.showInformationMessage(
            successMsg,
        );
    }
}

/**
    * Add new entry to artifact.xml in registry resources folder.
    * @param artifactName  The name of the artifact.
    * @param file          The file name of the artifact.
    * @param artifactPath  The path of the artifact.
    * @param mediaType     The media type of the artifact.
    */
export async function addNewEntryToArtifactXML(projectDir: string, artifactName: string, file: string, artifactPath: string, mediaType: string) {
    return new Promise(async (resolve) => {
        const options = {
            ignoreAttributes: false,
            attributeNamePrefix: "@",
            parseTagValue: true
        };
        const parser = new XMLParser(options);
        const artifactXMLPath = path.join(projectDir, 'src', 'main', 'wso2mi', 'resources', 'registry', 'artifact.xml');
        if (!fs.existsSync(artifactXMLPath)) {
            fs.writeFileSync(artifactXMLPath, `<?xml version="1.0" encoding="UTF-8"?><artifacts></artifacts>`);
        }
        const mvnInfo = await getMavenInfoFromRootPom(projectDir);
        const artifactXML = fs.readFileSync(artifactXMLPath, "utf8");
        const artifactXMLData = parser.parse(artifactXML);
        if (artifactXMLData.artifacts === '') {
            artifactXMLData.artifacts = {};
            artifactXMLData.artifacts.artifact = [];
        } else if (!Array.isArray(artifactXMLData.artifacts.artifact)) {
            const temp = artifactXMLData.artifacts.artifact;
            artifactXMLData.artifacts.artifact = [];
            artifactXMLData.artifacts.artifact.push(temp);
        }
        artifactXMLData.artifacts.artifact.push({
            '@name': artifactName,
            '@groupId': mvnInfo.groupId,
            '@version': mvnInfo.version,
            '@type': 'registry/resource',
            '@serverRole': 'EnterpriseIntegrator',
            item: {
                file: file,
                path: artifactPath,
                mediaType: mediaType,
                properties: null,
            }
        });
        const builder = new XMLBuilder(options);
        const updatedXmlString = builder.build(artifactXMLData);
        fs.writeFileSync(artifactXMLPath, updatedXmlString);
    });
}

/**
 * Get the maven information from the root pom.xml file.
 * @returns The maven information.
 */
export async function getMavenInfoFromRootPom(projectDir: string): Promise<{ groupId: string, artifactId: string, version: string }> {
    return new Promise(async (resolve) => {
        const pomXMLPath = path.join(projectDir, 'pom.xml');
        if (fs.existsSync(pomXMLPath)) {
            const pomXML = fs.readFileSync(pomXMLPath, "utf8");
            const options = {
                ignoreAttributes: true
            };
            const parser = new XMLParser(options);
            const pomXMLData = parser.parse(pomXML);
            const artifactId = pomXMLData["project"]["artifactId"];
            const groupId = pomXMLData["project"]["groupId"];
            const version = pomXMLData["project"]["version"];
            const response = {
                groupId: groupId,
                artifactId: artifactId,
                version: version
            };
            resolve(response);
        }

    });
}

/**
 * Get media type and file extension of the registry resource for the given template type.
 * @param templateType  The template type of the registry resource.
 * @returns             The media type and file extension of the registry resource.
 */
export function getMediatypeAndFileExtension(templateType: string): { mediaType: string, fileExtension: string } {
    let mediaType = 'application/vnd.wso2.esb.endpoint';
    let fileExtension = 'xml';
    switch (templateType) {
        case "Address endpoint":
        case "Default Endpoint":
        case "Failover Endpoint":
        case "HTTP Endpoint":
        case "Load Balance Endpoint":
        case "Recipient List Endpoint":
        case "Template Endpoint":
        case "WSDL Endpoint":
            break;
        case "Default Endpoint Template":
        case "HTTP Endpoint Template":
        case "WSDL Endpoint Template":
        case "Address endpoint template":
            mediaType = 'application/vnd.wso2.template.endpoint';
            break;
        case "XSLT File":
            mediaType = 'application/xslt+xml';
            fileExtension = 'xslt';
            break;
        case "XSD File":
            mediaType = 'application/x-xsd+xml';
            fileExtension = 'xsd';
            break;
        case "XSL File":
            mediaType = 'application/xsl+xml';
            fileExtension = 'xsl';
            break;
        case "WSDL File":
            mediaType = 'application/wsdl+xml';
            fileExtension = 'wsdl';
            break;
        case "Data Mapper":
            mediaType = 'application/datamapper';
            fileExtension = 'dmc';
            break;
        case "Javascript File":
            mediaType = 'application/javascript';
            fileExtension = 'js';
            break;
        case "SQL Script File":
            mediaType = '';
            fileExtension = 'sql';
            break;
        case "JSON File":
            mediaType = 'application/json';
            fileExtension = 'json';
            break;
        case "YAML File":
            mediaType = 'application/yaml';
            fileExtension = 'yaml';
            break;
        case "Local Entry":
            mediaType = 'application/vnd.wso2.esb.localentry';
            break;
        case "Sequence":
            mediaType = 'application/vnd.wso2.sequence';
            break;
        case "Sequence Template":
            mediaType = 'application/vnd.wso2.template';
            break;
        case "WS-Policy":
            mediaType = 'application/wspolicy+xml';
            break;
        default:
            break;
    }
    return { mediaType, fileExtension };
}