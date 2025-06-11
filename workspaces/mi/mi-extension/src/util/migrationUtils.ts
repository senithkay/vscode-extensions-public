/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { FileStructure, ImportProjectRequest, ImportProjectResponse } from '@wso2-enterprise/mi-core';
import * as fs from 'fs';
import * as path from 'path';
import { parseString, Builder } from 'xml2js';
import { v4 as uuidv4 } from 'uuid';
import { dockerfileContent, rootPomXmlContent } from './templates';
import { createFolderStructure, copyDockerResources } from '.';
import { commands, Uri, window, workspace } from 'vscode';
import { extension } from '../MIExtensionContext';
import { XMLParser, XMLBuilder } from "fast-xml-parser";
import { updatePomForClassMediator, LATEST_MI_VERSION } from './onboardingUtils';
import { SELECTED_JAVA_HOME, SELECTED_SERVER_PATH } from '../debugger/constants';
import { config } from 'process';

enum Nature {
    MULTIMODULE,
    ESB,
    DS,
    DATASOURCE,
    CONNECTOR,
    REGISTRY,
    CLASS,
    LEGACY,
    DISTRIBUTION
}

interface ArtifactItem {
  file: string;
  path: string;
  mediaType: string;
  properties: any;
}

interface ArtifactCollection {
  directory: string;
  path: string;
  properties: any;
}

interface Dependency {
  groupId: string;
  artifactId: string;
  version: string;
}

interface Artifact {
  '@_name': string;
  '@_groupId': string;
  '@_version': string;
  '@_type': string;
  '@_serverRole': string;
  file: string;
  item: ArtifactItem | ArtifactItem[];
  collection: ArtifactCollection | ArtifactCollection[];
}

type FileInfo = {
    path: string;
    artifact: Artifact | null;
    projectType?: Nature;
};

interface ArtifactsRoot {
  artifacts: {
    artifact?: Artifact | Artifact[];
  };
}

const xmlParserOptions = {
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  parseAttributeValue: true,
  trimValues: true,
  parseTrueNumberOnly: false,
  arrayMode: false,
  parseTagValue: false,
  parseNodeValue: false
};

const xmlBuilderOptions = {
  ignoreAttributes: false,
  format: true,
  indentBy: '  ',
  suppressEmptyNode: true,
  suppressBooleanAttributes: false,
  attributeNamePrefix: '@_',
  textNodeName: '#text'
};

const SRC = 'src';
const MAIN = 'main';
const WSO2MI = 'wso2mi';
const RESOURCES = 'resources';
const ARTIFACTS = 'artifacts';
const REGISTRY = 'registry';
const METADATA = 'metadata';
const DATA_SOURCES = 'data-sources';
const DATA_SERVICES = 'data-services';
const CONNECTORS = 'connectors';

const SYNAPSE_TO_MI_ARTIFACT_FOLDER_MAP: Record<string, string> = {
    'api': 'apis',
    'endpoints': 'endpoints',
    'inbound-endpoints': 'inbound-endpoints',
    'local-entries': 'local-entries',
    'message-processors': 'message-processors',
    'message-stores': 'message-stores',
    'proxy-services': 'proxy-services',
    'sequences': 'sequences',
    'tasks': 'tasks',
    'templates': 'templates'
};

export async function importProject(params: ImportProjectRequest): Promise<ImportProjectResponse> {
    const { source, directory, open } = params;
    const projectUri = workspace.getWorkspaceFolder(Uri.file(source))?.uri?.fsPath;
    if (!projectUri) {
        window.showErrorMessage('Please select a valid project directory');
        throw new Error('Invalid project directory');
    }

    const projectUuid = uuidv4();

    let { projectName, groupId, artifactId, version, runtimeVersion } = getProjectDetails(source);

    if (projectName && groupId && artifactId && version) {
        // Need to close all the opened editors before migrating the project
        // if not, it will cause issues with the file operations
        await commands.executeCommand('workbench.action.closeAllEditors');

        const destinationFolderPath = path.join(source, ".backup");
        moveFiles(source, destinationFolderPath);
        deleteEmptyFoldersInPath(source);

        const items = fs.readdirSync(destinationFolderPath, { withFileTypes: true });
        let folderStructureCreated = false;
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (item.isDirectory()) {
                const projectPath = path.join(destinationFolderPath, item.name);
                const projectType = determineProjectType(projectPath);
                // Only create folder structure for composite exporter (distribution) projects
                if (projectType === Nature.DISTRIBUTION) {
                    let { projectName, groupId, artifactId, version, runtimeVersion } = getProjectDetails(projectPath);
                    if (projectName && groupId && artifactId && version) {
                        const newFolderStructure = getFolderStructure(projectName, groupId, artifactId, projectUuid, version, runtimeVersion ?? LATEST_MI_VERSION);
                        const newProjectDir = path.join(directory, item.name);
                        fs.mkdirSync(newProjectDir);
                        await createFolderStructure(newProjectDir, newFolderStructure);
                        copyDockerResources(extension.context.asAbsolutePath(path.join('resources', 'docker-resources')), newProjectDir);
                        folderStructureCreated = true;
                    }
                }
            }
        }
        // If no folder structure was created, create one in the given directory
        if (!folderStructureCreated) {
            const folderStructure = getFolderStructure(projectName, groupId, artifactId, projectUuid, version, runtimeVersion ?? LATEST_MI_VERSION);
            await createFolderStructure(directory, folderStructure);
            copyDockerResources(extension.context.asAbsolutePath(path.join('resources', 'docker-resources')), directory);
        }

        console.log("Created project structure for project: " + projectName);
        await migrateConfigs(path.join(source, ".backup"), directory);

        window.showInformationMessage(`Successfully imported ${projectName} project`);

        if (open) {
            commands.executeCommand("workbench.action.reloadWindow");
            return { filePath: directory };
        }

        return { filePath: directory };
    } else {
        window.showErrorMessage('Could not find the project details from the provided project: ', source);
        return { filePath: "" };
    }
}

export function getProjectDetails(filePath: string) {
    let projectName: string | undefined;
    let groupId: string | undefined;
    let artifactId: string | undefined;
    let version: string | undefined;
    let runtimeVersion: string | undefined;

    const pomPath = path.join(filePath, "pom.xml");

    if (fs.existsSync(pomPath)) {
        const pomContent = fs.readFileSync(pomPath, 'utf8');

        parseString(pomContent, { explicitArray: false, ignoreAttrs: true }, (err, result) => {
            if (err) {
                console.error('Error parsing pom.xml:', err);
                return;
            }

            projectName = result?.project?.name;
            groupId = result?.project?.groupId;
            artifactId = result?.project?.artifactId;
            version = result?.project?.version;
            runtimeVersion = result?.project?.properties["project.runtime.version"];
        });
    }
    return { projectName, groupId, artifactId, version, runtimeVersion };
}

/**
 * Captures the project directory from a given file path which is in ".bakcup" dir.
 * If filePath contains ".backup", extract the segment after the last ".backup" and keep only the next directory name
 *
 * @param filePath - The absolute or relative file path to analyze.
 * @returns The project directory path, with special handling for ".backup" directories.
 */
export function getProjectDir(filePath: string): string {
    const normalizedPath = path.normalize(filePath);
    const backupIndex = normalizedPath.lastIndexOf('.backup');
    if (backupIndex !== -1) {
        // Find the next path segment after ".backup"
        const afterBackup = normalizedPath.substring(backupIndex + '.backup'.length);
        const match = afterBackup.match(/[/\\]([^/\\]+)/);
        if (match && match[1]) {
            // Reconstruct the path up to and including ".backup/<nextDir>"
            return normalizedPath.substring(0, backupIndex + '.backup'.length + match[0].length);
        }
        // If nothing after .backup, just return up to .backup
        return normalizedPath.substring(0, backupIndex + '.backup'.length);
    }
    return path.dirname(normalizedPath);
}

export async function migrateConfigs(projectUri: string, source: string, target: string) {
    // determine the project type here
    const projectType = determineProjectType(source);
    let hasClassMediatorModule = false;

    if (projectType === Nature.MULTIMODULE) {
        const items = fs.readdirSync(source, { withFileTypes: true });
        const artifactIdToFileInfoMap = generateArtifactIdToFileInfoMap(source, items);
        const { configToTests, configToMockServices } = buildConfigToTestAndMockServiceMaps(source, items);

        for (const item of items) {
            if (!item.isDirectory()) continue;

            const sourcePath = path.join(source, item.name);
            const targetPath = path.join(target, item.name);

            const moduleType = determineProjectType(sourcePath);

            if (moduleType === Nature.DISTRIBUTION && artifactIdToFileInfoMap) {
                await processCompositeExporterProject(sourcePath, targetPath, artifactIdToFileInfoMap, configToTests, configToMockServices);
                await commands.executeCommand('vscode.openFolder', Uri.file(targetPath), true);
            }
        }
        await commands.executeCommand('workbench.action.closeWindow');
    } else if (projectType === Nature.LEGACY) {
        const items = fs.readdirSync(source, { withFileTypes: true });
        items.forEach(item => {
            if (item.isDirectory()) {
                const sourceAbsolutePath = path.join(source, item.name);
                const moduleType = determineProjectType(path.join(source, item.name));
                if (moduleType === Nature.LEGACY) {
                    processArtifactsFolder(sourceAbsolutePath, target);
                    processMetaDataFolder(sourceAbsolutePath, target);
                    processTestsFolder(sourceAbsolutePath, target);
                }
            }
        });
    } else if (projectType === Nature.ESB || projectType === Nature.DS || projectType === Nature.DATASOURCE ||
        projectType === Nature.CONNECTOR || projectType === Nature.REGISTRY || projectType === Nature.CLASS) {
        copyConfigsToNewProjectStructure(projectType, source, target);
    }
    if (hasClassMediatorModule) {
        await updatePomForClassMediator(projectUri);
    }
}

/**
 * Generates a mapping between artifact identifiers and their corresponding file info objects.
 *
 * @param source - The root directory path containing the project directories.
 * @param items - An array of directory entries (`fs.Dirent[]`) representing the contents
 *                of the `source` directory.
 * @returns A `Map<string, FileInfo>` where the keys are artifact identifiers and the values
 *          are their corresponding file info objects.
 */
function generateArtifactIdToFileInfoMap(source: string, items: fs.Dirent[]): Map<string, FileInfo> {
    const artifactIdToFileInfoMap = new Map<string, FileInfo>();
    items.forEach(item => {
        if (item.isDirectory()) {
            const projectFilePath = path.join(source, item.name);
            const projectType = determineProjectType(projectFilePath);
            const projectPomFilePath = path.join(projectFilePath, 'pom.xml');
            const projectId = getPomIdentifier(projectPomFilePath);
            if (projectId) {
                artifactIdToFileInfoMap.set(projectId, { path: projectFilePath, artifact: null, projectType });
                // Try to get the artifact from the pom.xml's artifact.xml if exists
                let artifacts: Artifact[] = [];
                const artifactXmlPath = path.join(projectFilePath, 'artifact.xml');
                if (fs.existsSync(artifactXmlPath)) {
                    const xml = parseXmlFile(artifactXmlPath);
                    if (xml.artifacts && xml.artifacts.artifact) {
                        artifacts = normalizeArtifacts(xml.artifacts.artifact);
                    }
                }
                // For each artifact in artifacts, map its artifactId to its file path
                artifacts.forEach(artifact => {
                    const artifactId = getPomIdentifierStr(
                        artifact['@_groupId'],
                        artifact['@_name'],
                        artifact['@_version']
                    );
                    const fileInfo = getFileInfoForArtifact(artifact, projectFilePath, projectType);
                    if (fileInfo) {
                        artifactIdToFileInfoMap.set(artifactId, fileInfo);
                    }
                });
            }
        }
    });
    return artifactIdToFileInfoMap;
}

/**
 * Builds mappings from config files to their associated test files and mock service files.
 *
 * @param source - The root project directory.
 * @param items - Array of fs.Dirent representing directories in the project.
 * @returns An object with two maps:
 *   - configToTests: Map<string, string[]> mapping config file path to its test file paths.
 *   - configToMockServices: Map<string, string[]> mapping config file path to its mock service file paths.
 */
function buildConfigToTestAndMockServiceMaps(
    source: string,
    items: fs.Dirent[]
): {
    configToTests: Map<string, string[]>,
    configToMockServices: Map<string, string[]>
} {
    const configToTests = new Map<string, string[]>();
    const configToMockServices = new Map<string, string[]>();

    for (const item of items) {
        if (!item.isDirectory()) continue;
        const projectDir = path.join(source, item.name);
        // Only process if the project type is ESB
        const projectType = determineProjectType(projectDir);
        if (projectType !== Nature.ESB) continue;

        const testDir = path.join(projectDir, 'test');
        if (!fs.existsSync(testDir) || !fs.statSync(testDir).isDirectory()) continue;

        const testFiles = fs.readdirSync(testDir)
            .filter(f => f.endsWith('.xml'))
            .map(f => path.join(testDir, f));

        for (const testFile of testFiles) {
            const fileContent = fs.readFileSync(testFile, 'utf-8');
            let testArtifact: string | undefined;
            let mockServices: string[] = [];
            parseString(fileContent, { explicitArray: false, ignoreAttrs: false }, (err, result) => {
                if (err) return;
                testArtifact = result?.['unit-test']?.artifacts?.['test-artifact']?.artifact;
                const mocks = result?.['unit-test']?.['mock-services']?.['mock-service'];
                if (mocks) {
                    mockServices = Array.isArray(mocks) ? mocks : [mocks];
                }
            });
            if (testArtifact) {
                const configFile = path.join(source, testArtifact);
                if (!configToTests.has(configFile)) configToTests.set(configFile, []);
                configToTests.get(configFile)!.push(testFile);

                if (!configToMockServices.has(configFile)) configToMockServices.set(configFile, []);
                for (const mockService of mockServices) {
                    const firstSlash = mockService.indexOf('/');
                    const secondSlash = mockService.indexOf('/', firstSlash + 1);
                    let relativeMockServicePath = mockService;
                    if (secondSlash !== -1) {
                        relativeMockServicePath = mockService.substring(secondSlash);
                    }
                    const absoluteMockServicePath = path.join(source, relativeMockServicePath);
                    configToMockServices.get(configFile)!.push(absoluteMockServicePath);
                }
            }
        }
    }
    return { configToTests, configToMockServices };
}

/**
 * Given an artifact and its project path, returns a FileInfo object containing the absolute file path and the artifact.
 * @param artifact The artifact object from artifact.xml.
 * @param projectFilePath The absolute path to the project directory containing the artifact.xml.
 * @returns FileInfo object with the absolute file path and the artifact, or null if the file does not exist.
 */
function getFileInfoForArtifact(
    artifact: Artifact,
    projectFilePath: string,
    projectType: Nature | undefined
): FileInfo | null {
    if (artifact.file) {
        const artifactFilePath = path.join(projectFilePath, ...artifact.file.split('/'));
        if (fs.existsSync(artifactFilePath)) {
            return { path: artifactFilePath, artifact, projectType };
        }
    } else if (artifact.item) {
        // artifact.item can be an array or a single object
        const items = Array.isArray(artifact.item) ? artifact.item : [artifact.item];
        const firstItem = items[0];
        if (firstItem && firstItem.file) {
            const artifactFilePath = path.join(projectFilePath, ...firstItem.file.split('/'));
            if (fs.existsSync(artifactFilePath)) {
                return { path: artifactFilePath, artifact, projectType };
            }
        }
    } else if (artifact.collection) {
        // artifact.collection can be an array or a single object
        const collections = Array.isArray(artifact.collection) ? artifact.collection : [artifact.collection];
        const firstCollection = collections[0];
        if (firstCollection && firstCollection.directory) {
            const artifactPath = path.join(projectFilePath, ...firstCollection.directory.split('/'));
            if (fs.existsSync(artifactPath)) {
                return { path: artifactPath, artifact, projectType };
            }
        }
    }
    return null;
}

function getPomIdentifierStr(groupId: string, artifactId: string, version: string): string {
    return `${groupId}:${artifactId}:${version}`;
}

/**
 * Retrieves the Maven POM identifier from a specified `pom.xml` file.
 *
 * @param pomFilePath - The file path to the `pom.xml` file.
 * @returns The POM identifier as a string in the format `groupId:artifactId:version`, or `null` if the file
 *          does not exist or the required fields are not found.
 */
function getPomIdentifier(pomFilePath: string): string | null {
    if (!fs.existsSync(pomFilePath)) {
        return null;
    }
    const pomContent = fs.readFileSync(pomFilePath, 'utf-8');
    let groupId: string | undefined;
    let artifactId: string | undefined;
    let version: string | undefined;

    parseString(pomContent, { explicitArray: false, ignoreAttrs: true }, (err, result) => {
        if (err) {
            console.error('Error parsing pom.xml:', err);
            return;
        }
        groupId = result?.project?.groupId;
        artifactId = result?.project?.artifactId;
        version = result?.project?.version;
    });

    if (groupId && artifactId && version) {
        return `${groupId}:${artifactId}:${version}`;
    }
    return null;
}

function getFolderStructure(
    projectName: string,
    groupId: string,
    artifactId: string,
    projectUuid: string,
    version: string,
    runtimeVersion: string | undefined
): FileStructure {
    return {
        'pom.xml': rootPomXmlContent(projectName, groupId, artifactId.toLowerCase(), projectUuid, version, runtimeVersion ?? LATEST_MI_VERSION, ""),
        '.env': '',
        'src': {
            'main': {
                'java': '',
                'wso2mi': {
                    'artifacts': {
                        'apis': '',
                        'endpoints': '',
                        'inbound-endpoints': '',
                        'local-entries': '',
                        'message-processors': '',
                        'message-stores': '',
                        'proxy-services': '',
                        'sequences': '',
                        'tasks': '',
                        'templates': '',
                        'data-services': '',
                        'data-sources': '',
                    },
                    'resources': {
                        'registry': {
                            'gov': '',
                            'conf': '',
                        },
                        'metadata': '',
                        'connectors': '',
                        'conf': {
                            'config.properties': ''
                        }
                    },
                },
            },
            'test': {
                'wso2mi': '',
                'resources': {
                    "mock-services": '',
                }
            }
        },
        'deployment': {
            'docker': {
                'Dockerfile': dockerfileContent(),
                'resources': ''
            },
            'libs': '',
        },
    };
}

function determineProjectType(source: string): Nature | undefined {
    const rootMetaDataFilePath = path.join(source, '.project');
    let configType;
    if (fs.existsSync(rootMetaDataFilePath)) {
        const projectFileContent = fs.readFileSync(rootMetaDataFilePath, 'utf-8');
        parseString(projectFileContent, { explicitArray: false, ignoreAttrs: true }, (err, result) => {
            if (err) {
                console.error('Error occured while reading ' + rootMetaDataFilePath, err);
                return;
            }
            const projectDescription = result.projectDescription;
            if (projectDescription && projectDescription.natures && projectDescription.natures.nature) {
                let nature = projectDescription.natures.nature;
                if (Array.isArray(nature)) {
                    nature = nature.find(element => element.startsWith("org.wso2.developerstudio.eclipse"));
                }

                switch (nature) {
                    case 'org.wso2.developerstudio.eclipse.mavenmultimodule.project.nature':
                        configType = Nature.MULTIMODULE;
                        break;
                    case 'org.wso2.developerstudio.eclipse.esb.project.nature':
                        configType = Nature.ESB;
                        break;
                    case 'org.wso2.developerstudio.eclipse.ds.project.nature':
                        configType = Nature.DS;
                        break;
                    case 'org.wso2.developerstudio.eclipse.datasource.project.nature':
                        configType = Nature.DATASOURCE;
                        break;
                    case 'org.wso2.developerstudio.eclipse.artifact.connector.project.nature':
                        configType = Nature.CONNECTOR;
                        break;
                    case 'org.wso2.developerstudio.eclipse.general.project.nature':
                        configType = Nature.REGISTRY;
                        break;
                    case 'org.wso2.developerstudio.eclipse.artifact.mediator.project.nature':
                        configType = Nature.CLASS;
                        break;
                    case 'org.eclipse.m2e.core.maven2Nature':
                        configType = Nature.LEGACY;
                        break;
                    case 'org.wso2.developerstudio.eclipse.distribution.project.nature':
                        configType = Nature.DISTRIBUTION;
                        break;
                }
            }
        });
    }
    return configType;
}

function copyConfigToNewProjectStructure(nature: Nature, sourceFileInfo: FileInfo, target: string) {
    switch (nature) {
        case Nature.ESB:
            const artifactType = getArtifactType(sourceFileInfo.path);
            const subDir = SYNAPSE_TO_MI_ARTIFACT_FOLDER_MAP[artifactType ?? ''] ?? '';
            copyArtifactFileToTargetDir(sourceFileInfo.path, path.join(target, SRC, MAIN, WSO2MI, ARTIFACTS, subDir));
            // processMetaData(sourceFileInfo.path, target);
            // processTests(sourceFileInfo.path, target);
            break;
        case Nature.DATASOURCE:
            copyArtifactFileToTargetDir(sourceFileInfo.path, path.join(target, SRC, MAIN, WSO2MI, ARTIFACTS, DATA_SOURCES));
            break;
        case Nature.DS:
            copyArtifactFileToTargetDir(sourceFileInfo.path, path.join(target, SRC, MAIN, WSO2MI, ARTIFACTS, DATA_SERVICES));
            break;
        case Nature.CONNECTOR:
            copyArtifactFileToTargetDir(sourceFileInfo.path, path.join(target, SRC, MAIN, WSO2MI, RESOURCES, CONNECTORS));
            break;
        case Nature.REGISTRY:
            copyRegistryFile(sourceFileInfo, target);
            break;
        case Nature.CLASS:
            processClassMediators(sourceFileInfo.path, target);
            break;
    }
}

function copyConfigsToNewProjectStructure(nature: Nature, source: string, target: string) {
    switch (nature) {
        case Nature.ESB:
            processArtifactsFolder(source, target);
            processMetaDataFolder(source, target);
            processTestsFolder(source, target);
            break;
        case Nature.DATASOURCE:
            processDataSourcesFolder(source, target);
            break;
        case Nature.DS:
            processDataServicesFolder(source, target);
            break;
        case Nature.CONNECTOR:
            processConnectors(source, target);
            break;
        case Nature.REGISTRY:
            processRegistryResources(source, target);
            break;
        case Nature.CLASS:
            processClassMediators(source, target);
            break;
    }
}

/**
 * Extracts the artifact type (e.g., 'api', 'sequences', 'endpoints') from a given Synapse config file path.
 *
 * @param sourceFilePath Full file path to the artifact.
 * @returns The artifact folder name under synapse-config (e.g., 'api').
 */
export function getArtifactType(sourceFilePath: string): string | null {
    const normalizedPath = path.normalize(sourceFilePath);
    const parts = normalizedPath.split(path.sep);

    const synapseIndex = parts.indexOf('synapse-config');
    if (synapseIndex !== -1 && parts.length > synapseIndex + 1) {
        return parts[synapseIndex + 1];  // The folder name immediately under synapse-config
    }

    return null; // If synapse-config not found or no folder under it
}

function processArtifactsFolder(source: string, target: string) {
    const synapseConfigsPath = path.join(source, 'src', 'main', 'synapse-config');
    const artifactsPath = path.join(target, 'src', 'main', 'wso2mi', 'artifacts');
    const sourceFolders = [
        'api',
        'endpoints',
        'inbound-endpoints',
        'local-entries',
        'message-processors',
        'message-stores',
        'proxy-services',
        'sequences',
        'tasks',
        'templates',
    ];
    const targetFolders = [
        'apis',
        'endpoints',
        'inbound-endpoints',
        'local-entries',
        'message-processors',
        'message-stores',
        'proxy-services',
        'sequences',
        'tasks',
        'templates',
    ];

    sourceFolders.forEach((sourceFolder, index) => {
        const sourcePath = path.join(synapseConfigsPath, sourceFolder);
        const targetPath = path.join(artifactsPath, targetFolders[index]);

        copy(sourcePath, targetPath);
    });

}

/**
 * Copies metadata files associated with the given configuration files into a target directory.
 *
 * For each configuration file in `configFiles`, this function locates the corresponding project directory,
 * searches for metadata files in the standard metadata directory, and copies those whose filenames start
 * with the configuration file's base name to the destination metadata directory under `targetDir`.
 *
 * @param configFiles - An array of absolute paths to configuration files whose metadata should be copied.
 * @param targetDir - The absolute path to the target directory where metadata files will be copied.
 */
function copyMetaDataFor(configFiles: string[], targetDir: string) {
    const destDir = path.join(targetDir, SRC, MAIN, WSO2MI, RESOURCES, METADATA);
    const metaDataMap = new Map<string, string[]>();
    for (const configFile of configFiles) {
        const projectDir = getProjectDir(configFile);
        const metadataDir = path.join(projectDir, SRC, MAIN, RESOURCES, METADATA);
        if (!metaDataMap.has(projectDir) && fs.existsSync(metadataDir) && fs.statSync(metadataDir).isDirectory()) {
            const files = fs.readdirSync(metadataDir)
                .filter(file => fs.statSync(path.join(metadataDir, file)).isFile())
                .map(file => path.join(metadataDir, file));
            metaDataMap.set(projectDir, files);
        }
    }
    for (const configFile of configFiles) {
        const projectDir = getProjectDir(configFile);
        const metaFiles = metaDataMap.get(projectDir) || [];
        const configFileName = path.basename(configFile, path.extname(configFile));
        metaFiles.forEach(metaFile => {
            if (path.basename(metaFile).startsWith(configFileName)) {
                const destFile = path.join(destDir, path.basename(metaFile));
                copyFile(metaFile, destFile);
            }
        });
    }
}

function copyTestFor(
    configFiles: string[],
    targetDir: string,
    configToTests: Map<string, string[]>,
    configToMockServices: Map<string, string[]>
) {
    const testTargetDir = path.join(targetDir, 'src', 'test', 'wso2mi');
    const mockServicesTargetDir = path.join(targetDir, 'src', 'test', 'resources', 'mock-services');

    for (const configFile of configFiles) {
        const testFiles = configToTests.get(configFile) || [];
        for (const testFile of testFiles) {
            const fileName = path.basename(testFile);
            copyFile(testFile, path.join(testTargetDir, fileName));
        }

        const mockServiceFiles = configToMockServices.get(configFile) || [];
        for (const mockServiceFile of mockServiceFiles) {
            const fileName = path.basename(mockServiceFile);
            copyFile(mockServiceFile, path.join(mockServicesTargetDir, fileName));
        }
    }
}

function processMetaDataFolder(source: string, target: string) {
    const oldMetaDataPath = path.join(source, 'src', 'main', 'resources', 'metadata');
    const newMetaDataPath = path.join(target, 'src', 'main', 'wso2mi', 'resources', 'metadata');

    copy(oldMetaDataPath, newMetaDataPath);
}

/**
 * Copies a single artifact file to a specific subdirectory under the target project's artifacts directory.
 * @param sourceFilePath - The absolute path to the source artifact file.
 * @param targetProjectDir - The root directory of the target project.
 * @param artifactSubDir - The subdirectory under 'artifacts' (e.g., 'data-sources', 'data-services').
 */
function copyArtifactFileToTargetDir(sourceFilePath: string, targetDir: string) {
    if (!fs.statSync(sourceFilePath).isDirectory()) {
        const fileName = path.basename(sourceFilePath);
        copyFile(sourceFilePath, path.join(targetDir, fileName));
    }
}

function processDataSourcesFolder(source: string, target: string) {
    const oldDataSourcePath = path.join(source, 'datasource');
    const newDataSourcePath = path.join(target, 'src', 'main', 'wso2mi', 'artifacts', 'data-sources');

    copy(oldDataSourcePath, newDataSourcePath);
}

function processDataServicesFolder(source: string, target: string) {
    const oldDataServicePath = path.join(source, 'dataservice');
    const newDataServicePath = path.join(target, 'src', 'main', 'wso2mi', 'artifacts', 'data-services');

    copy(oldDataServicePath, newDataServicePath);
}

function processConnectors(source: string, target: string) {
    const newConnectorPath = path.join(target, 'src', 'main', 'wso2mi', 'resources', 'connectors');

    fs.readdir(source, { withFileTypes: true }, (err, files) => {
        if (err) {
            console.error(`Failed to list contents of the folder: ${source}`, err);
            return;
        }

        files.forEach(file => {
            if (file.isFile()) {
                if (path.extname(file.name).toLowerCase() === '.zip') {
                    copyFile(path.join(source, file.name), path.join(newConnectorPath, file.name));
                }
            }
        });
    });
}

function createInitialArtifactXml(): string {
    return `<?xml version="1.0" encoding="UTF-8"?><artifacts></artifacts>`;
}

function ensureRegistryDirectory(targetProjectDir: string): string {
    const registryPath = path.join(targetProjectDir, 'src', 'main', 'wso2mi', 'resources', 'registry');

    if (!fs.existsSync(registryPath)) {
        fs.mkdirSync(registryPath, { recursive: true });
    }

    return registryPath;
}

function ensureArtifactXmlExists(registryPath: string): string {
    const artifactXmlPath = path.join(registryPath, 'artifact.xml');

    if (!fs.existsSync(artifactXmlPath)) {
        fs.writeFileSync(artifactXmlPath, createInitialArtifactXml(), 'utf-8');
    }

    return artifactXmlPath;
}

function parseXmlFile(filePath: string): ArtifactsRoot {
    try {
        const xmlContent = fs.readFileSync(filePath, 'utf-8');
        const parser = new XMLParser(xmlParserOptions);
        const result = parser.parse(xmlContent);

        // Handle case where artifacts is empty and parsed as empty string
        if (!result.artifacts || typeof result.artifacts === 'string') {
            return {
                artifacts: {}
            };
        }

        return result as ArtifactsRoot;
    } catch (error) {
        throw new Error(`Failed to parse XML file ${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

function normalizeArtifacts(artifactsData: any): Artifact[] {
    if (!artifactsData) return [];
    return Array.isArray(artifactsData) ? artifactsData : [artifactsData];
}

function writeUpdatedArtifactXml(filePath: string, artifactsRoot: ArtifactsRoot): void {
    try {
        const builder = new XMLBuilder(xmlBuilderOptions);
        const updatedXml = builder.build(artifactsRoot);
        fs.writeFileSync(filePath, updatedXml, 'utf-8');
    } catch (error) {
        throw new Error(`Failed to write XML file ${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

function copyRegistryFile(sourceFileInfo: FileInfo, targetProjectDir: string): void {
    const registryPath = path.join(targetProjectDir, SRC, MAIN, WSO2MI, RESOURCES, REGISTRY);
    try {
        // Get the first item's path from the artifact
        const artifact = sourceFileInfo.artifact;
        if (artifact) {
            if (artifact.item) {
                const items = Array.isArray(artifact.item) ? artifact.item : [artifact.item];
                const firstItem = items[0];
                const relativePath = firstItem.path;
                const targetDir = getTargetPath(relativePath, registryPath);
                const targetFile = path.join(targetDir, firstItem.file.split('/').pop()!);
                fs.mkdirSync(targetDir, { recursive: true });
                copyFile(sourceFileInfo.path, targetFile);
            } else if (artifact.collection) {
                const collections = Array.isArray(artifact.collection) ? artifact.collection : [artifact.collection];
                const firstCollection = collections[0];
                const relativePath = firstCollection.path;
                const targetDir = getTargetPath(relativePath, registryPath);
                fs.mkdirSync(targetDir, { recursive: true });
                copy(sourceFileInfo.path, targetDir);
            } else {
                throw new Error('Artifact does not have item or collection for registry resource.');
            }
        }
    } catch (error) {
        console.error(`Failed to copy registry file: ${error instanceof Error ? error.message : error}`);
    }
}

function getTargetPath(relativePath: string, registryPath: string): string {
    if (relativePath.startsWith('/_system/governance')) {
        return path.join(registryPath, path.normalize(relativePath.replace(/^\/_system\/governance/, 'gov')));
    } else if (relativePath.startsWith('/_system/config')) {
        return path.join(registryPath, path.normalize(relativePath.replace(/^\/_system\/config/, 'conf')));
    } else {
        // For other paths, use them as-is under registry directory
        return path.join(registryPath, path.normalize(relativePath));
    }
}

function updateRegistryArtifactXml(projectDir: string, artifacts: Artifact[]) {
    const targetRegistryPath = ensureRegistryDirectory(projectDir);
    const targetArtifactXmlPath = ensureArtifactXmlExists(targetRegistryPath);

    // Parse the existing artifact.xml
    const targetXml = parseXmlFile(targetArtifactXmlPath);

    // Ensure artifacts structure exists
    if (!targetXml.artifacts || typeof targetXml.artifacts === 'string') {
        targetXml.artifacts = {};
    }
    if (!targetXml.artifacts.artifact) {
        targetXml.artifacts.artifact = [];
    } else if (!Array.isArray(targetXml.artifacts.artifact)) {
        targetXml.artifacts.artifact = [targetXml.artifacts.artifact];
    }

    // Process and add new artifacts
    artifacts.forEach(artifact => {
        processArtifactForWrite(artifact);
        (targetXml.artifacts.artifact as Artifact[]).push(artifact);
    });

    writeUpdatedArtifactXml(targetArtifactXmlPath, targetXml);
}

function processArtifactForWrite(artifact: Artifact): void {
    if (artifact) {
        if (artifact.item) {
            const items = Array.isArray(artifact.item) ? artifact.item : [artifact.item];
            items.forEach(item => {
            if (item.file && typeof item.file === 'string') {
                const parts = item.file.split('/');
                item.file = parts[parts.length - 1];
            }
            });
            artifact.item = Array.isArray(artifact.item) ? items : items[0];
        } else if (artifact.collection) {
            const collections = Array.isArray(artifact.collection) ? artifact.collection : [artifact.collection];
            collections.forEach(collection => {
            if (collection.directory && typeof collection.directory === 'string') {
                const parts = collection.directory.split('/');
                collection.directory = parts[parts.length - 1];
            }
            });
            collections.forEach(collection => {
                if (collection.path && typeof collection.path === 'string') {
                    const lastSlashIndex = collection.path.lastIndexOf('/');
                    if (lastSlashIndex !== -1) {
                        collection.path = collection.path.substring(0, lastSlashIndex);
                    }
                }
            });
            artifact.collection = Array.isArray(artifact.collection) ? collections : collections[0];
        }
    }
}

function processRegistryResources(source: string, target: string) {
    const artifactXMLPath = path.join(source, 'artifact.xml');
    const newRegistryPath = path.join(target, 'src', 'main', 'wso2mi', 'resources', 'registry');

    const xmlContent = fs.readFileSync(artifactXMLPath, 'utf-8');

    parseString(xmlContent, { explicitArray: false, ignoreAttrs: false }, (err, result) => {
        if (err) {
            console.error('Error parsing pom.xml:', err);
            return;
        }

        const artifactsData = result.artifacts.artifact;
        const artifacts = Array.isArray(artifactsData) ? artifactsData : [artifactsData];

        artifacts.forEach(artifact => {
            const fileName = artifact.item.file;
            const relativePath = artifact.item.path;
            let targetAbsolutePath;

            if (relativePath.startsWith('/_system/governance')) {
                targetAbsolutePath = path.join(newRegistryPath, path.normalize(relativePath.replace(/^\/_system\/governance/, 'gov')));
            } else if (relativePath.startsWith('/_system/config')) {
                targetAbsolutePath = path.join(newRegistryPath, path.normalize(relativePath.replace(/^\/_system\/config/, 'conf')));
            }
            const sourceFile = path.join(source, ...fileName.split("/"));
            const targetFile = path.join(targetAbsolutePath, fileName.split("/").pop());
            try {
                fs.mkdirSync(targetAbsolutePath, { recursive: true });
                copyFile(sourceFile, targetFile);
                artifact.item.file = artifact.item.file.split("/").pop();
            } catch (err) {
                console.error(`Failed to create folder structure ${targetAbsolutePath}`, err);
            }
        });
        const builder = new Builder({ headless: false });
        const updatedXml = builder.buildObject(result);
        fs.writeFileSync(path.join(newRegistryPath, 'artifact.xml'), updatedXml, 'utf-8');
    });
}

/**
 * Processes test files and associated mock services for a given artifact and target directory.
 *
 * This function scans the `test` directory within the source project directory (derived from the given artifact file path),
 * and for each XML test file, parses its contents to determine if it is associated with the provided artifact.
 * If so, the test file is copied to the target test directory. Additionally, if the test file references any mock services,
 * those mock service files are also copied to the appropriate mock services directory within the target.
 *
 * @param artifactFilePath - The file path to the artifact whose tests are to be processed.
 * @param target - The target directory where test files and mock services should be copied.
 *
 * @remarks
 * - Only XML files in the `test` directory are processed.
 * - Test files are copied if their `test-artifact` matches the artifact file path.
 * - Mock service files referenced in the test XML are also copied to the target mock services directory.
 */
function processTests(artifactFilePath: string, target: string) {
    const sourceProjectDir = getProjectDir(artifactFilePath);
    const rootDir = path.dirname(sourceProjectDir);
    const testDir = path.join(sourceProjectDir, 'test');
    const targetMockServicesDir = path.join(target, 'src', 'test', 'resources', 'mock-services');
    const targetTestDir = path.join(target, 'src', 'test', 'wso2mi');
    if (fs.existsSync(testDir) && fs.statSync(testDir).isDirectory()) {
        const files = fs.readdirSync(testDir);
        files.forEach(file => {
            const sourceFile = path.join(testDir, file);
            if (fs.statSync(sourceFile).isFile()) {
                if (path.extname(sourceFile).toLowerCase() === '.xml') {
                    const fileContent = fs.readFileSync(sourceFile, 'utf-8');
                    parseString(fileContent, { explicitArray: false, ignoreAttrs: false }, (err, result) => {
                        if (err) {
                            console.error(`Error parsing XML in file ${sourceFile}:`, err);
                            return;
                        }
                        const value = result?.['unit-test']?.artifacts?.['test-artifact']?.artifact;
                        const normalizedArtifactFilePath = artifactFilePath.split(path.sep).join('/');
                        if (typeof value === 'string' && normalizedArtifactFilePath.endsWith(value)) {
                            const destFile = path.join(targetTestDir, file);
                            copyFile(sourceFile, destFile);
                        }
                        const mockServices = result?.['unit-test']?.['mock-services']?.['mock-service'];
                        if (mockServices) {
                            const mockServiceFiles = Array.isArray(mockServices) ? mockServices : [mockServices];
                            mockServiceFiles.forEach((mockServicePath: string) => {
                                const firstSlash = mockServicePath.indexOf('/');
                                const secondSlash = mockServicePath.indexOf('/', firstSlash + 1);
                                let relativeMockServicePath = mockServicePath;
                                if (secondSlash !== -1) {
                                    relativeMockServicePath = mockServicePath.substring(secondSlash);
                                }
                                const absoluteMockServicePath = path.join(rootDir, relativeMockServicePath);
                                if (fs.existsSync(absoluteMockServicePath) && fs.statSync(absoluteMockServicePath).isFile()) {
                                    const destMockServiceFile = path.join(targetMockServicesDir, path.basename(mockServicePath));
                                    copyFile(absoluteMockServicePath, destMockServiceFile);
                                }
                            });
                        }
                    });
                }
            }
        });
    }
}

function processTestsFolder(source: string, target: string) {
    const oldTestPath = path.join(source, 'test');
    const newTestPath = path.join(target, 'src', 'test', 'wso2mi');
    copy(oldTestPath, newTestPath);
    const oldResPath = path.join(oldTestPath, 'resources', 'mock-services');
    const newResPath = path.join(target, 'src', 'test', 'resources', 'mock-services');
    copy(oldResPath, newResPath);
    fixTestFilePaths(target);
}

function processClassMediators(source: string, target: string) {
    const oldClassMediatorPath = path.join(source, 'src', 'main', 'java');
    const newClassMediatorPath = path.join(target, 'src', 'main', 'java');

    copyFilesAndDirectories();

    function copyFilesAndDirectories() {
        function copyRecursive(source: string, target: string) {
            if (!fs.existsSync(source)) {
                return;
            }
            const items = fs.readdirSync(source, { withFileTypes: true });
            items.forEach(item => {
                const sourceItemPath = path.join(source, item.name);
                const targetItemPath = path.join(target, item.name);
                if (item.isDirectory()) {
                    fs.mkdirSync(targetItemPath, { recursive: true });
                    copyRecursive(sourceItemPath, targetItemPath);
                } else {
                    fs.copyFileSync(sourceItemPath, targetItemPath);
                }
            });
        }

        copyRecursive(oldClassMediatorPath, newClassMediatorPath);
    }
}

/**
 * Processes a project dependency by determining its type and copying its configuration
 * to a new project structure if applicable.
 *
 * @param depId - The identifier of the dependency to process.
 * @param sourceFileInfo - Information about the source file associated with the dependency.
 * @param target - The target directory or path for the migrated configuration.
 */
function processDependency(depId: string, sourceFileInfo: FileInfo | undefined, target: string) {
    if (!sourceFileInfo) {
        console.warn(`Dependency '${depId}' selected for the composite exporter project was not found. Skipping migration for this dependency.`);
    } else {
        const sourceProjectDir = getProjectDir(sourceFileInfo.path);
        const projectType = determineProjectType(sourceProjectDir);

        if (projectType === Nature.ESB || projectType === Nature.DS || projectType === Nature.DATASOURCE ||
            projectType === Nature.CONNECTOR || projectType === Nature.REGISTRY || projectType === Nature.CLASS) {
            copyConfigToNewProjectStructure(projectType, sourceFileInfo, target);
        }
    }
}

function readPomDependencies(pomFilePath: string): Dependency[] {
    if (!fs.existsSync(pomFilePath)) {
        throw new Error(`pom.xml file not found: ${pomFilePath}`);
    }

    const pomContent = fs.readFileSync(pomFilePath, 'utf-8');
    const parser = new XMLParser({ ignoreAttributes: false });
    const parsed = parser.parse(pomContent);

    const deps = parsed?.project?.dependencies?.dependency;

    if (!deps) return [];
    return Array.isArray(deps) ? deps : [deps];
}

/**
 * Processes a composite exporter project by reading its `pom.xml` file, resolving dependencies,
 * and updating the target project accordingly. Specifically, it checks for class mediator modules
 * among the dependencies and updates the target project's `pom.xml` if any are found.
 * Also, it fixes test file paths in the target directory.
 *
 * @param source - The path to the source project directory containing the `pom.xml` file.
 * @param target - The path to the target project directory where updates will be applied.
 * @param artifactIdToFileInfoMap - A map of artifact IDs to their corresponding file information,
 *                                  used to resolve dependency source file paths.
 * @returns A promise that resolves when processing is complete.
 */
async function processCompositeExporterProject(
    source: string,
    target: string,
    artifactIdToFileInfoMap: Map<string, FileInfo>,
    configToTests: Map<string, string[]> = new Map(),
    configToMockServices: Map<string, string[]> = new Map()
) {
    const pomFilePath = path.join(source, 'pom.xml');
    if (!fs.existsSync(pomFilePath)) {
        console.error(`pom.xml file not found in the source directory: ${source}`);
        return;
    }
    const dependencies = readPomDependencies(pomFilePath);

    let hasClassMediatorModule = false;
    let registryArtifactsList: Artifact[] = [];
    let configFiles: string[] = [];
    for (const dependency of dependencies) {
        const depId = getPomIdentifierStr(dependency.groupId, dependency.artifactId, dependency.version);
        const sourceFileInfo = artifactIdToFileInfoMap.get(depId);
        processDependency(depId, sourceFileInfo, target);
        if (sourceFileInfo?.projectType === Nature.CLASS) {
            hasClassMediatorModule = true;
        }
        if (sourceFileInfo?.projectType === Nature.REGISTRY && sourceFileInfo.artifact) {
            registryArtifactsList.push(sourceFileInfo.artifact);
        }
        if (sourceFileInfo?.projectType === Nature.ESB) {
            configFiles.push(sourceFileInfo.path);
        }
    }
    if (hasClassMediatorModule) {
        await changeRootPomForClassMediator(target);
    }
    updateRegistryArtifactXml(target, registryArtifactsList);
    copyMetaDataFor(configFiles, target);
    copyTestFor(configFiles, target, configToTests, configToMockServices);
    fixTestFilePaths(target);
    logUnusedFiles(dependencies, artifactIdToFileInfoMap);
}

/**
 * Logs information about files that were not added to the project because they were not selected for the composite exporter.
 *
 * @param dependencies - An array of `Dependency` objects representing the selected dependencies.
 * @param artifactIdToFileInfoMap - A map where the key is an artifact ID string and the value is a `FileInfo` object.
 */
function logUnusedFiles(dependencies: Dependency[], artifactIdToFileInfoMap: Map<string, FileInfo>) {
    const foundDepIds = new Set<string>();
    for (const dependency of dependencies) {
        const depId = getPomIdentifierStr(dependency.groupId, dependency.artifactId, dependency.version);
        foundDepIds.add(depId);
    }
    const unusedFileInfos: FileInfo[] = [];
    for (const [artifactId, fileInfo] of artifactIdToFileInfoMap.entries()) {
        if (!foundDepIds.has(artifactId)) {
            unusedFileInfos.push(fileInfo);
        }
    }
    if (unusedFileInfos.length > 0) {
        console.log('The following files were not added to this project (if needed, they can be found in the ".backup" directory):');
        unusedFileInfos.forEach(info => {
            console.log(info.path);
        });
    }
}

function fixTestFilePaths(source: string) {
    const testPath = path.join(source, 'src', 'test', 'wso2mi');
    const items = fs.readdirSync(testPath, { withFileTypes: true });
    const options = {
        ignoreAttributes: false,
        attributeNamePrefix: "@",
        parseTagValue: true,
        format: true,
    };
    const parser = new XMLParser(options);
    items.forEach(item => {
        if (!item.isDirectory()) {
            const filePath = path.join(testPath, item.name);
            const fileContent = fs.readFileSync(filePath, 'utf-8');
            const jsonData = parser.parse(fileContent);
            if (jsonData['unit-test']['artifacts']) {
                let artifacts = jsonData['unit-test']['artifacts'];
                let testArtifact = artifacts['test-artifact']['artifact'];
                if (testArtifact) {
                    artifacts['test-artifact']['artifact'] = updateArtifactPath(testArtifact);
                }
                let supportArtifact = artifacts['supportive-artifacts'];
                if (supportArtifact) {
                    let supportArtifactArr = supportArtifact["artifact"];
                    if (supportArtifactArr && Array.isArray(supportArtifactArr)) {
                        supportArtifactArr.forEach((supportArtifact, index) => {
                            supportArtifactArr[index] = updateArtifactPath(supportArtifact);
                        });
                    } else if (supportArtifactArr) {
                        supportArtifact["artifact"] = updateArtifactPath(supportArtifactArr);
                    }
                }
                let registryResources = artifacts['registry-resources'];
                if (registryResources) {
                    const registryResourcesArr = registryResources["registry-resource"];
                    if (registryResourcesArr && Array.isArray(registryResourcesArr)) {
                        registryResourcesArr.forEach(registryResource => {
                            updateRegistryArtifactPath(registryResource);
                        });
                    } else if (registryResourcesArr) {
                        updateRegistryArtifactPath(registryResourcesArr);
                    }
                }
                let connectorResources = artifacts['connector-resources'];
                if (connectorResources) {
                    let connectorResourcesArr = connectorResources["connector-resource"];
                    if (connectorResourcesArr && Array.isArray(connectorResourcesArr)) {
                        connectorResourcesArr.forEach((connectorResource, index) => {
                            connectorResourcesArr[index] = updateConnectorPath(connectorResource);
                        });
                    } else if (connectorResourcesArr) {
                        connectorResources["connector-resource"] = updateConnectorPath(connectorResourcesArr);
                    }
                }
            }
            let mockServices = jsonData["unit-test"]["mock-services"]
            if (mockServices) {
                let mockServicesArr = mockServices["mock-service"];
                if (mockServicesArr && Array.isArray(mockServicesArr)) {
                    mockServicesArr.forEach((mockService, index) => {
                        mockServicesArr[index] = updateMockServicePath(mockService);
                    });
                } else if (mockServicesArr) {
                    mockServices["mock-service"] = updateMockServicePath(mockServicesArr);
                }
            }
            const builder = new XMLBuilder(options);
            const updatedXmlString = builder.build(jsonData);
            fs.writeFileSync(filePath, updatedXmlString);
        }
    });
}

function updateArtifactPath(artifact: any): string {
    let index = artifact.lastIndexOf("/src/main/synapse-config/");
    index += "/src/main/synapse-config/".length;
    artifact = artifact.substring(index);
    if (artifact.startsWith("api")) {
        artifact = artifact.substring("api".length);
        artifact = "apis" + artifact;
    }
    return `src/main/wso2mi/artifacts/${artifact}`;
}

function updateConnectorPath(connector: any): string {
    let index = connector.lastIndexOf("/");
    connector = connector.substring(index + 1);
    return `src/main/wso2mi/resources/connectors/${connector}`;
}

function updateMockServicePath(mockService: any): string {
    let index = mockService.lastIndexOf("/test/resources/mock-services/");
    index += "/test/resources/mock-services/".length;
    mockService = mockService.substring(index);
    return `src/test/resources/mock-services/${mockService}`;
}

function updateRegistryArtifactPath(registryResource: any) {
    let registryResourcePath = registryResource['registry-path'];
    const newRegPath = "src/main/wso2mi/resources/registry/";
    if (registryResourcePath.startsWith("/_system/governance")) {
        registryResourcePath = registryResourcePath.substring("/_system/governance".length);
        registryResourcePath = newRegPath + "gov" + registryResourcePath + "/" + registryResource['file-name'];
    } else if (registryResourcePath.startsWith("/_system/config")) {
        registryResourcePath = registryResourcePath.substring("/_system/config".length);
        registryResourcePath = newRegPath + "conf" + registryResourcePath + "/" + registryResource['file-name'];
    }
    registryResource['artifact'] = registryResourcePath;
}

function copy(source: string, target: string) {
    if (!fs.existsSync(source)) {
        return;
    }
    const files = fs.readdirSync(source);
    files.forEach(file => {
        const sourceItemPath = path.join(source, file);
        const destinationItemPath = path.join(target, file);
        if (!fs.statSync(sourceItemPath).isDirectory()) {
            copyFile(sourceItemPath, destinationItemPath);
        }
    });
}

function copyFile(sourcePath: string, targetPath: string) {
    try {
        fs.copyFileSync(sourcePath, targetPath);
    } catch (err) {
        console.error(`Failed to copy file from ${sourcePath} to ${targetPath}`, err);
    }
}

function moveFiles(sourcePath: string, destinationPath: string) {

    if (!fs.existsSync(destinationPath)) {
        fs.mkdirSync(destinationPath);
    }
    const items = fs.readdirSync(sourcePath);

    items.forEach(item => {
        if (item === '.backup' || item === '.git') {
            return;
        }
        const sourceItemPath = path.join(sourcePath, item);
        const destinationItemPath = path.join(destinationPath, item);
        const isDirectory = fs.statSync(sourceItemPath).isDirectory();

        if (isDirectory) {
            moveFiles(sourceItemPath, destinationItemPath);
            fs.rmSync(sourceItemPath, { recursive: true });
        } else {
            fs.renameSync(sourceItemPath, destinationItemPath);
        }
    });
}

function deleteEmptyFoldersInPath(basePath: string): void {

    if (!fs.existsSync(basePath)) {
        return;
    }
    const items = fs.readdirSync(basePath);
    for (const item of items) {
        const fullPath = path.join(basePath, item);
        if (fs.statSync(fullPath).isDirectory()) {
            const contents = fs.readdirSync(fullPath);
            if (contents.length === 0) {
                fs.rmdirSync(fullPath);
            }
        }
    }
}
