/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { Progress, window, ProgressLocation, commands, workspace, Uri, TextEditorRevealType, Selection, Range as VSCodeRange } from "vscode";
import * as fs from 'fs';
import * as os from 'os';
import axios from "axios";
import * as path from 'path';
import { XMLParser, XMLBuilder } from "fast-xml-parser";
import { COMMANDS } from "../constants";
import * as unzipper from 'unzipper';
import { ListRegistryArtifactsResponse, Range, RegistryArtifact } from "@wso2-enterprise/mi-core";
import { rm } from 'node:fs/promises';
import { existsSync } from "fs";

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
    const rawFileLink = repoUrl + sampleName + '/' + sampleName + '.zip';
    const defaultDownloadsPath = path.join(os.homedir(), 'Downloads'); // Construct the default downloads path
    const pathFromDialog = await selectFileDownloadPath();
    const selectedPath = pathFromDialog === "" ? defaultDownloadsPath : pathFromDialog;
    const filePath = path.join(selectedPath, sampleName + '.zip');
    let isSuccess = false;

    if (fs.existsSync(filePath)) {
        // already downloaded
        isSuccess = true;
    } else {
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
    }

    if (isSuccess) {
        const successMsg = `The Integration sample file has been downloaded successfully to the following directory: ${filePath}.`;
        const zipReadStream = fs.createReadStream(filePath);
        if (fs.existsSync(path.join(selectedPath, sampleName))) {
            // already extracted
            let uri = Uri.file(path.join(selectedPath, sampleName));
            commands.executeCommand("vscode.openFolder", uri, true);
            return;
        }
        zipReadStream.pipe(unzipper.Parse()).on("entry", function (entry) {
            var isDir = entry.type === "Directory";
            var fullpath = path.join(selectedPath, entry.path);
            var directory = isDir ? fullpath : path.dirname(fullpath);
            if (!fs.existsSync(directory)) {
                fs.mkdirSync(directory, { recursive: true });
            }
            if (!isDir) {
                entry.pipe(fs.createWriteStream(fullpath));
            }
        }).on("close", () => {
            console.log("Extraction complete!");
            let uri = Uri.file(path.join(selectedPath, sampleName));
            commands.executeCommand("vscode.openFolder", uri, true);
        });
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
export async function addNewEntryToArtifactXML(projectDir: string, artifactName: string, file: string,
    artifactPath: string, mediaType: string, isCollection: boolean): Promise<boolean> {
    return new Promise(async (resolve) => {
        const options = {
            ignoreAttributes: false,
            attributeNamePrefix: "@",
            parseTagValue: true,
            format: true,
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
        if (isCollection) {
            artifactXMLData.artifacts.artifact.push({
                '@name': artifactName,
                '@groupId': mvnInfo.groupId,
                '@version': mvnInfo.version,
                '@type': 'registry/resource',
                '@serverRole': 'EnterpriseIntegrator',
                collection: {
                    directory: file,
                    path: artifactPath,
                    properties: null,
                }
            });
        } else {
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
        }
        const builder = new XMLBuilder(options);
        const updatedXmlString = builder.build(artifactXMLData);
        fs.writeFileSync(artifactXMLPath, updatedXmlString);
        resolve(true);
    });
}

/**
 * Remove the entry from the artifact.xml file if exists.
 * @param projectDir    The project directory.
 * @param artifactPath  The path of the artifact.
 * @param isCollection  The type of the artifact.
 * @returns             The status of the removal.
 */
export async function removeEntryFromArtifactXML(projectDir: string, artifactPath: string, fileName: string): Promise<boolean> {
    return new Promise(async (resolve) => {
        const options = {
            ignoreAttributes: false,
            attributeNamePrefix: "@",
            parseTagValue: true,
            format: true,
        };
        const parser = new XMLParser(options);
        const artifactXMLPath = path.join(projectDir, 'src', 'main', 'wso2mi', 'resources', 'registry', 'artifact.xml');
        if (!fs.existsSync(artifactXMLPath)) {
            resolve(false);
        }
        const artifactXML = fs.readFileSync(artifactXMLPath, "utf8");
        const artifactXMLData = parser.parse(artifactXML);
        var removed = false;
        if (Array.isArray(artifactXMLData.artifacts.artifact)) {
            const startCount = artifactXMLData.artifacts.artifact.length;
            var artifacts = artifactXMLData.artifacts.artifact;
            if (fileName) {
                artifacts = artifacts.filter((artifact) => {
                    return artifact.collection || (artifact.item && artifact.item.file !== fileName && artifact.item.path !== artifactPath);
                });
            } else {
                artifacts = artifactXMLData.artifacts.artifact.filter((artifact) => {
                    return (artifact.item && !(artifact.item.path === artifactPath || (artifact.item.path.startsWith(artifactPath)
                        && artifact.item.path.replace(artifactPath, '').startsWith('/'))))
                        || (artifact.collection && !(artifact.collection.path === artifactPath || (artifact.collection.path.startsWith(artifactPath)
                            && artifact.collection.path.replace(artifactPath, '').startsWith('/'))));
                });
            }
            const endCount = artifacts.length;
            artifactXMLData.artifacts.artifact = artifacts;
            if (endCount < startCount) {
                removed = true;
            }
        } else {
            if (fileName) {
                // if file name present do the exact match
                if (artifactXMLData.artifacts.artifact.item && artifactXMLData.artifacts.artifact.item.file === fileName
                    && artifactXMLData.artifacts.artifact.item.path === artifactPath) {
                    removed = true;
                    artifactXMLData.artifacts.artifact = [];
                }
            } else {
                if (artifactXMLData.artifacts.artifact.collection && (artifactXMLData.artifacts.artifact.collection.path === artifactPath
                    || (artifactXMLData.artifacts.artifact.collection.path.startsWith(artifactPath)
                        && artifactXMLData.artifacts.artifact.collection.path.replace(artifactPath, '').startsWith('/')))) {
                    artifactXMLData.artifacts.artifact = [];
                    removed = true;
                }
                if (artifactXMLData.artifacts.artifact.item && (artifactXMLData.artifacts.artifact.item.path === artifactPath
                    || (artifactXMLData.artifacts.artifact.item.path.startsWith(artifactPath)
                        && artifactXMLData.artifacts.artifact.item.path.replace(artifactPath, '').startsWith('/')))) {
                    artifactXMLData.artifacts.artifact = [];
                    removed = true;
                }
            }
        }
        if (removed) {
            const builder = new XMLBuilder(options);
            const updatedXmlString = builder.build(artifactXMLData);
            fs.writeFileSync(artifactXMLPath, updatedXmlString);
        }
        resolve(removed);
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

/**
 * Method to detect the media type of the imported registry resource.
 * @param filePath  The file path of the registry resource.
 * @returns         The media type of the registry resource.
 */
export async function detectMediaType(filePath: string): Promise<string> {
    return new Promise((resolve) => {
        var mediaType = '';
        if (fs.existsSync(filePath)) {
            if (filePath.endsWith('.xml')) {
                const pomXML = fs.readFileSync(filePath, "utf8");
                const options = {
                    ignoreAttributes: false,
                    attributeNamePrefix: "@",
                };
                const parser = new XMLParser(options);
                const resourceXMLData = parser.parse(pomXML);
                const template = resourceXMLData["template"];
                if (resourceXMLData["endpoint"]) {
                    mediaType = 'application/vnd.wso2.esb.endpoint';
                } else if (template) {
                    if (template["endpoint"]) {
                        mediaType = 'application/vnd.wso2.template.endpoint';
                    } else if (template["sequence"]) {
                        mediaType = 'application/vnd.wso2.template';
                    }
                } else if (resourceXMLData["localEntry"]) {
                    mediaType = 'application/vnd.wso2.esb.localentry';
                } else if (resourceXMLData["sequence"]) {
                    mediaType = 'application/vnd.wso2.sequence';
                } else if (resourceXMLData["wsp:Policy"]) {
                    mediaType = 'application/wspolicy+xml';
                } else {
                    mediaType = 'application/xml';
                }
            } else if (filePath.endsWith('.xslt') || filePath.endsWith('.xsl')) {
                mediaType = 'application/xslt+xml';
            } else if (filePath.endsWith('.xsd')) {
                mediaType = 'application/x-xsd+xml';
            } else if (filePath.endsWith('.yaml')) {
                mediaType = 'application/yaml';
            } else if (filePath.endsWith('.json')) {
                mediaType = 'application/json';
            } else if (filePath.endsWith('.js')) {
                mediaType = 'application/javascript';
            } else if (filePath.endsWith('.sql')) {
                mediaType = '';
            } else if (filePath.endsWith('.wsdl')) {
                mediaType = 'application/wsdl+xml';
            } else if (filePath.endsWith('.dmc')) {
                mediaType = 'application/datamapper';
            }
        }
        resolve(mediaType);
    });
}

/**
 *  Delete the registry resource folder and the recursively delete the artifacts from the artifact.xml file.
 * @param filePath  The file path of the registry resource folder.
 * @returns         The status of the deletion.
 */
export async function deleteRegistryResource(filePath: string): Promise<{ status: boolean, info: string }> {
    return new Promise(async (resolve) => {
        const workspaceFolder = workspace.getWorkspaceFolder(Uri.file(filePath))?.uri.fsPath;
        if (workspaceFolder) {
            var tempPath = filePath.replace(workspaceFolder, '');
            const platform = os.platform();
            if (platform === 'win32') {
                tempPath = tempPath.replace(/\\/g, '/');
            }
            tempPath = tempPath.replace('/src/main/wso2mi/resources/registry/', '');
            var regPath = "";
            if (tempPath.startsWith('gov')) {
                regPath = '/_system/governance/';
                regPath = regPath + tempPath.replace('gov/', '');
            } else {
                regPath = '/_system/config/';
                regPath = regPath + tempPath.replace('conf/', '');
            }
            if (fs.lstatSync(filePath).isDirectory()) {
                removeEntryFromArtifactXML(workspaceFolder, regPath, "");
                await rm(filePath, { recursive: true, force: true });
            } else {
                const fileName = path.basename(filePath);
                regPath = regPath.replace('/' + fileName, '');
                removeEntryFromArtifactXML(workspaceFolder, regPath, fileName);
                fs.unlinkSync(filePath);
            }
            resolve({ status: true, info: "Registry resource removed" });
        } else {
            resolve({ status: false, info: "Workspace not found" });
        }
    });
}

/**
 * Create meta data files for the registry collection.
 * @param collectionRoot root folder of the collection.
 * @param regPath        registry path of the collection.
 */
export async function createMetadataFilesForRegistryCollection(collectionRoot: string, regPath: string) {
    return new Promise(async (resolve) => {
        const metaFolder = path.join(collectionRoot, '.meta');
        const folderName = path.basename(collectionRoot);
        var folderRegPath = regPath.slice(0, regPath.length - folderName.length - 1);
        fs.mkdirSync(metaFolder);
        const initialMetaFile = path.join(metaFolder, '~.xml');
        var content = '<?xml version="1.0" encoding="UTF-8"?><resource name="' + folderName + '" isCollection="true" path="'
            + folderRegPath + '" registryUrl="https://localhost:9443/registry" status="added"/>';
        fs.writeFileSync(initialMetaFile, content);
        const files = fs.readdirSync(collectionRoot);
        files.forEach(async (file) => {
            const curPath = path.join(collectionRoot, file);
            if (fs.lstatSync(curPath).isDirectory()) {
                if (file !== '.meta') {
                    const newRegPath = regPath + '/' + file;
                    await createMetadataFilesForRegistryCollection(curPath, newRegPath);
                }
            } else {
                if (file !== '.DS_Store') {
                    const mediaType = await detectMediaType(curPath);
                    const newRegPath = regPath + '/' + file;
                    const newMetaFile = path.join(metaFolder, '~' + file + '.xml');
                    var content = '<?xml version="1.0" encoding="UTF-8"?><resource name="' + file + '" isCollection="false" path="'
                        + newRegPath + '" registryUrl="https://localhost:9443/registry" status="added"><mediaType>'
                        + mediaType + '</mediaType></resource>';
                    fs.writeFileSync(newMetaFile, content);
                }
            }
        });
        resolve(true);
    });
}

/**
 * Get a list of currently available registry resources.
 * @param projectDir    The project directory.
 * @returns             The list of available registry resources.
 */
export async function getAvailableRegistryResources(projectDir: string): Promise<ListRegistryArtifactsResponse> {
    return new Promise(async (resolve) => {
        const result: RegistryArtifact[] = [];
        var artifactXMLPath = path.join(projectDir, 'artifact.xml');
        if (!projectDir.endsWith('registry')) {
            const fileUri = Uri.file(projectDir);
            const workspaceFolder = workspace.getWorkspaceFolder(fileUri);
            if (workspaceFolder) {
                projectDir = path.join(workspaceFolder.uri.fsPath, 'src', 'main', 'wso2mi', 'resources', 'registry');
                artifactXMLPath = path.join(projectDir, 'artifact.xml');
            }
        }
        if (fs.existsSync(artifactXMLPath)) {
            const artifactXML = fs.readFileSync(artifactXMLPath, "utf8");
            const options = {
                ignoreAttributes: false,
                attributeNamePrefix: "@",
                parseTagValue: true,
                format: true,
            };
            const parser = new XMLParser(options);
            const artifactXMLData = parser.parse(artifactXML);
            if (!artifactXMLData.artifacts) {
                return resolve({ artifacts: [] });
            }
            if (!Array.isArray(artifactXMLData.artifacts.artifact)) {
                artifactXMLData.artifacts.artifact = [artifactXMLData.artifacts.artifact];
            }
            for (const artifact of artifactXMLData.artifacts.artifact) {
                if (artifact.collection) {
                    const registryArtifact: RegistryArtifact = {
                        name: artifact["@name"],
                        path: artifact.collection.path,
                        file: artifact.collection.directory,
                        isCollection: true
                    };
                    result.push(registryArtifact);
                } else if (artifact.item) {
                    const registryArtifact: RegistryArtifact = {
                        name: artifact["@name"],
                        path: artifact.item.path,
                        file: artifact.item.file,
                        isCollection: false
                    };
                    result.push(registryArtifact);
                }
            }
            resolve({ artifacts: result });
        } else {
            resolve({ artifacts: [] });
        }
    });
}

export function findJavaFiles(folderPath): Map<string, string> {
    const results = new Map();
    function traverse(currentPath) {
        const files = fs.readdirSync(currentPath);
        for (const file of files) {
            const filePath = path.join(currentPath, file);
            const stats = fs.statSync(filePath);

            if (stats.isDirectory()) {
                traverse(filePath);
            } else if (stats.isFile() && path.extname(filePath) === '.java') {
                const fileContents = fs.readFileSync(filePath, 'utf8');
                const extendsPattern = /class\s+\w+\s+extends\s+AbstractMediator\b/g;
                const matches = fileContents.match(extendsPattern);
                if (matches) {
                    const packagePath = path.dirname(filePath).replace(folderPath, '');
                    const packageName = packagePath.split(path.sep).filter(part => part);
                    results.set(filePath, packageName.join('.'));
                }
            }
        }
    }

    traverse(folderPath);
    return results;
}

/**
 * Change the packaging of the root pom.xml file to the given value.
 * @param projectDir project directory.     
 */
export function changeRootPomPackaging(projectDir: string, packaging: string) {
    const pomXMLPath = path.join(projectDir, 'pom.xml');
    if (fs.existsSync(pomXMLPath)) {
        const pomXML = fs.readFileSync(pomXMLPath, "utf8");
        const options = {
            ignoreAttributes: false,
            format: true,
        };
        const parser = new XMLParser(options);
        const pomXMLData = parser.parse(pomXML);
        pomXMLData["project"]["packaging"] = packaging;
        const builder = new XMLBuilder(options);
        const updatedXmlString = builder.build(pomXMLData);
        fs.writeFileSync(pomXMLPath, updatedXmlString);
    }
}

/**
 * Focus on the source file at the given position in the editor.
 * @param filePath   path of the file.
 * @param position     position to be focused.
 */
export function goToSource(filePath: string, position: Range) {
    if (!existsSync(filePath)) {
        return;
    }

    const { start : { line, column } } = position;
    const range: VSCodeRange = new VSCodeRange(line, column, line!, column!);
    const openedDocument = window.visibleTextEditors.find((editor) => editor.document.fileName === filePath);
    
    if (openedDocument) {
        focusTextEditor(openedDocument, range);
    } else {
        openAndFocusTextDocument(filePath, range);
    }

    function focusTextEditor(editor, range) {
        window.visibleTextEditors[0].revealRange(range, TextEditorRevealType.InCenter);
        window.showTextDocument(editor.document, { preview: false, preserveFocus: false, viewColumn: editor.viewColumn })
            .then(textEditor => updateEditor(textEditor, range));
    }
    
    function openAndFocusTextDocument(filePath, range) {
        workspace.openTextDocument(filePath).then(sourceFile => {
            window.showTextDocument(sourceFile, { preview: false, preserveFocus: false })
                .then(textEditor => updateEditor(textEditor, range));
        });
    }

    function updateEditor(textEditor, range) {
        textEditor.revealRange(range, TextEditorRevealType.InCenter);
        textEditor.selection = new Selection(range.start, range.start);
    }
}
