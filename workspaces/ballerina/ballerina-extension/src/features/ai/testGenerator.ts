/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com).
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { ballerinaExtInstance } from '../../core';
import { DiagnosticEntry, Diagnostics, GeneratedTestSource, GenerateTestRequest, OpenAPISpec, ProjectDiagnostics, ProjectModule, ProjectSource, SyntaxTree } from '@wso2-enterprise/ballerina-core';
import { ErrorCode } from "@wso2-enterprise/ballerina-core";
import { ModulePart, ServiceDeclaration, STKindChecker } from "@wso2-enterprise/syntax-tree";
import { Uri, workspace } from "vscode";
import { PARSING_ERROR, TIMEOUT, UNKNOWN_ERROR, USER_ABORTED, ENDPOINT_REMOVED } from '../../views/ai-panel/errorCodes';
import { langClient } from './activator';
import * as yaml from 'js-yaml';
import * as fs from 'fs';
import * as path from 'path';
import * as child_process from 'child_process';
import * as os from 'os';
import { writeBallerinaFileDidOpen } from '../../utils/modification';

const balVersionRegex = new RegExp("^[0-9]{4}.[0-9]+.[0-9]+");

let hasStopped: boolean = false;
let abortController = new AbortController();
const config = workspace.getConfiguration('ballerina');
const BAL_HOME = config.get('home') as string;
const PLUGIN_DEV_MODE = config.get('pluginDevMode') as boolean;
const TEST_GEN_REQUEST_TIMEOUT = 100000;

interface TestGenAPIRequest {
    backendUri: string;
    token: string;
    serviceName?: string;
    project: ProjectSource;
    openApiSpec: string;
    testSource?: string;
    projectDiagnostics?: ProjectDiagnostics;
}

// ----------- TEST GENERATOR -----------
export async function generateTest(
    projectRoot: string,
    generateTestRequest: GenerateTestRequest
): Promise<GeneratedTestSource> {
    const projectSource = await getProjectSource(projectRoot);
    if (!projectSource) {
        throw new Error("The current project is not recognized as a valid Ballerina project. Please ensure you have opened a Ballerina project.");
    }

    const targetServiceName = generateTestRequest.serviceName;
    if (!targetServiceName) {
        throw new Error("Service name is missing in the test request. Please provide a valid service name to generate tests.");
    }

    let serviceDeclaration: ServiceDeclaration | null = null;
    let serviceDocFilePath = "";

    for (const sourceFile of projectSource.sourceFiles) {
        serviceDocFilePath = sourceFile.filePath;
        const fileUri = Uri.file(serviceDocFilePath).toString();
        const syntaxTree = await langClient.getSyntaxTree({
            documentIdentifier: {
                uri: fileUri
            }
        }) as SyntaxTree;
        const matchedService = findMatchingServiceDeclaration(syntaxTree, targetServiceName);
        if (matchedService) {
            serviceDeclaration = matchedService;
            break;
        }
    }

    if (!serviceDeclaration) {
        throw new Error(`Couldn't find any services matching the service you provided, which is "${generateTestRequest.serviceName}". Please recheck if the provided service name is correct.`);
    }

    const backendUri = generateTestRequest.backendUri;
    const token = generateTestRequest.token;

    const serviceName = generateTestRequest.serviceName;
    const openApiSpec = await getOpenAPISpecification(serviceDocFilePath);

    if (typeof generateTestRequest.existingSource === 'undefined' || typeof generateTestRequest.diagnostics === 'undefined') {
        const code: string | ErrorCode = await getUnitTests({ backendUri: backendUri, token: token, serviceName: serviceName, project: projectSource, openApiSpec: openApiSpec });
        if (isErrorCode(code)) {
            throw new Error((code as ErrorCode).message);
        }
        return {
            testContent: code as string,
            configContent: ""
        };
    } else {
        const updatedCode: string | ErrorCode = await getUnitTests({ backendUri: backendUri, token: token, project: projectSource, openApiSpec: openApiSpec, testSource: generateTestRequest.existingSource.testContent, projectDiagnostics: generateTestRequest.diagnostics });
        if (isErrorCode(updatedCode)) {
            throw new Error((updatedCode as ErrorCode).message);
        }
        return {
            testContent: updatedCode as string,
            configContent: ""
        };
    }
}

export async function getDiagnostics(
    projectRoot: string,
    testSource: GeneratedTestSource
): Promise<ProjectDiagnostics> {
    const ballerinaProjectRoot = await findBallerinaProjectRoot(projectRoot);
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'temp-bal-test-gen-'));
    fs.cpSync(ballerinaProjectRoot, tempDir, { recursive: true });
    const tempTestFolderPath = path.join(tempDir, 'tests');
    if (!fs.existsSync(tempTestFolderPath)) {
        fs.mkdirSync(tempTestFolderPath, { recursive: true });
    }
    const tempTestFilePath = path.join(tempTestFolderPath, 'test.bal');
    writeBallerinaFileDidOpen(tempTestFilePath, testSource.testContent);

    const diagnosticsResult = await langClient.getDiagnostics({ documentIdentifier: { uri: Uri.file(tempTestFilePath).toString() } });
    fs.rmSync(tempDir, { recursive: true, force: true });
    if (Array.isArray(diagnosticsResult)) {
        const errorDiagnostics = getErrorDiagnostics(diagnosticsResult, tempTestFilePath);
        return errorDiagnostics;
    }
    return {
        diagnostics: []
    };
}

async function getProjectSource(dirPath: string): Promise<ProjectSource | null> {
    const projectRoot = await findBallerinaProjectRoot(dirPath);

    if (!projectRoot) {
        return null;
    }

    const projectSource: ProjectSource = {
        sourceFiles: [],
        projectModules: [],
    };

    // Read root-level .bal files
    const rootFiles = fs.readdirSync(projectRoot);
    for (const file of rootFiles) {
        if (file.endsWith('.bal')) {
            const filePath = path.join(projectRoot, file);
            const content = await fs.promises.readFile(filePath, 'utf-8');
            projectSource.sourceFiles.push({ filePath, content });
        }
    }

    // Read modules
    const modulesDir = path.join(projectRoot, 'modules');
    if (fs.existsSync(modulesDir)) {
        const modules = fs.readdirSync(modulesDir, { withFileTypes: true });
        for (const moduleDir of modules) {
            if (moduleDir.isDirectory()) {
                const projectModule: ProjectModule = {
                    moduleName: moduleDir.name,
                    sourceFiles: [],
                };

                const moduleFiles = fs.readdirSync(path.join(modulesDir, moduleDir.name));
                for (const file of moduleFiles) {
                    if (file.endsWith('.bal')) {
                        const filePath = path.join(modulesDir, moduleDir.name, file);
                        const content = await fs.promises.readFile(filePath, 'utf-8');
                        projectModule.sourceFiles.push({ filePath, content });
                    }
                }

                projectSource.projectModules.push(projectModule);
            }
        }
    }

    return projectSource;
}

const findMatchingServiceDeclaration = (syntaxTree: SyntaxTree, targetServiceName: string): ServiceDeclaration | null => {
    const serviceDeclarations = findServiceDeclarations(syntaxTree);

    for (const serviceDecl of serviceDeclarations) {
        const serviceName = constructServiceName(serviceDecl);
        if (serviceName === targetServiceName) {
            return serviceDecl;
        }
    }

    return null;
};

const findServiceDeclarations = (syntaxTree: SyntaxTree): ServiceDeclaration[] => {
    const serviceDeclarations: ServiceDeclaration[] = [];

    const modulePartNode = syntaxTree.syntaxTree as ModulePart;
    for (const member of modulePartNode.members) {
        if (STKindChecker.isServiceDeclaration(member)) {
            serviceDeclarations.push(member);
        }
    }
    return serviceDeclarations;
};

function constructServiceName(targetNode: ServiceDeclaration): string {
    return targetNode.absoluteResourcePath.map(item => {
        if ('value' in item) { return item.value; }
        if ('literalToken' in item) { return item.literalToken.value; }
        return '';
    }).join('');
}

async function getOpenAPISpecification(documentFilePath: string): Promise<string> {
    if (isLatestTestGenSupported()) {
        return await getOpenAPISpec(documentFilePath);
    } else {
        const response = await langClient.convertToOpenAPI({ documentFilePath }) as OpenAPISpec;
        if (response.error) {
            throw new Error(response.error);
        }
        return yaml.dump(response.content[0].spec);
    }
}

async function getUnitTests(request: TestGenAPIRequest): Promise<string | ErrorCode> {
    try {
        let response = await sendTestGeneRequest(request);
        if (isErrorCode(response)) {
            return (response as ErrorCode);
        }
        response = (response as Response);
        return await filterTestGenResponse(response);
    } catch (error) {
        return UNKNOWN_ERROR;
    }
}

async function sendTestGeneRequest(request: TestGenAPIRequest): Promise<Response | ErrorCode> {
    const getFileName = (filePath: string): string => {
        return filePath.split('/').pop() || filePath.split('\\').pop() || filePath;
    };

    const modules = request.project.projectModules?.map((module) => ({
        moduleName: module.moduleName,
        sources: module.sourceFiles.reduce(
            (acc, file) => ({
                ...acc,
                [getFileName(file.filePath)]: file.content,
            }),
            {} as { [key: string]: string }
        ),
    }));

    const sources = request.project.sourceFiles.reduce(
        (acc, file) => ({
            ...acc,
            [getFileName(file.filePath)]: file.content,
        }),
        {} as { [key: string]: string }
    );

    const body =
        (typeof request.testSource === "undefined" ||
            typeof request.projectDiagnostics === "undefined")
            ? {
                serviceName: request.serviceName,
                project: {
                    modules,
                    sources,
                },
                openApiSpec: request.openApiSpec
            }
            : {
                project: {
                    modules,
                    sources,
                },
                openApiSpec: request.openApiSpec,
                testSource: request.testSource,
                diagnostics: request.projectDiagnostics.diagnostics
            };

    const response = await fetchWithTimeout(request.backendUri + "/tests", {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'User-Agent': 'Ballerina-VSCode-Plugin',
            'Authorization': `Bearer ${request.token}`,
        },
        body: JSON.stringify(body)
    }, TEST_GEN_REQUEST_TIMEOUT);
    return response;
}

async function getOpenAPISpec(serviceFilePath: string): Promise<string> {
    const tempDir = os.tmpdir();

    return new Promise<string>((resolve, reject) => {
        const balExec = PLUGIN_DEV_MODE ? BAL_HOME + '/bin/bal' : 'bal';
        const command = `${balExec} openapi -i ${serviceFilePath} -o ${tempDir} --json --with-bal-ext`;

        child_process.exec(command, (err, stdout, stderr) => {
            if (err) {
                reject(new Error(`Failed to extract the OpenAPI specification: ${err.message}`));
            } else {
                // Extract filename from stdout
                const match = stdout.match(/-- (.+\.json)/);
                if (!match) {
                    reject(new Error('Failed to extract the OpenAPI specification.'));
                    return;
                }

                const filename = match[1];
                const filePath = path.join(tempDir, filename);

                // Read the content of the file
                fs.readFile(filePath, 'utf8', (readErr, data) => {
                    if (readErr) {
                        reject(new Error(`Failed to extract the OpenAPI specification: ${readErr.message}`));
                    } else {
                        resolve(data);
                    }
                });
            }
        });
    });
}

function isLatestTestGenSupported(): boolean {
    const balVersion = ballerinaExtInstance.ballerinaVersion;
    const versionStr = balVersion.match(balVersionRegex);
    const splittedVersions = versionStr[0]?.split(".");
    if ((parseInt(splittedVersions[0], 10) === 2201) && (parseInt(splittedVersions[1], 10) >= 10)) {
        return true;
    }
    return false;
}

function getErrorDiagnostics(diagnostics: Diagnostics[], filePath: string): ProjectDiagnostics {
    const errorDiagnostics: DiagnosticEntry[] = [];

    diagnostics.forEach(diagParam => {
        if (diagParam.uri === Uri.file(filePath).toString()) {
            diagParam.diagnostics.forEach(diag => {
                if (diag.severity === 1) {
                    errorDiagnostics.push({
                        line: diag.range.start.line + 1,
                        message: diag.message
                    });
                }
            });
        }
    });

    return {
        diagnostics: errorDiagnostics
    };
}

async function filterTestGenResponse(resp: Response): Promise<string | ErrorCode> {
    if (resp.status == 200 || resp.status == 201) {
        const data = (await resp.json()) as any;
        return data.code;
    }
    if (resp.status == 404) {
        return ENDPOINT_REMOVED;
    }
    if (resp.status == 400) {
        const data = (await resp.json()) as any;
        return PARSING_ERROR;
    }
    else {
        //TODO: Handle more error codes
        return { code: 4, message: `An unknown error occured. ${resp.statusText}.` };
    }
}

// ----------- HEALPER FUNCTIONS -----------
async function findBallerinaProjectRoot(dirPath: string): Promise<string | null> {
    if (dirPath === null) {
        return null;
    }

    const workspaceFolders = workspace.workspaceFolders;
    if (!workspaceFolders) {
        return null;
    }

    // Check if the directory is within any of the workspace folders
    const workspaceFolder = workspaceFolders.find(folder => dirPath.startsWith(folder.uri.fsPath));
    if (!workspaceFolder) {
        return null;
    }

    let currentDir = dirPath;

    while (currentDir.startsWith(workspaceFolder.uri.fsPath)) {
        const ballerinaTomlPath = path.join(currentDir, 'Ballerina.toml');
        if (fs.existsSync(ballerinaTomlPath)) {
            return currentDir;
        }
        currentDir = path.dirname(currentDir);
    }

    return null;
}

const fetchWithTimeout = async (url, options, timeout = 100000): Promise<Response | ErrorCode> => {
    abortController = new AbortController();
    const id = setTimeout(() => abortController.abort(), timeout);
    try {
        const response = await fetch(url, { ...options, signal: abortController.signal });
        clearTimeout(id);
        return response;
    } catch (error: any) {
        if (error.name === 'AbortError' && !hasStopped) {
            return TIMEOUT;
        } else if (error.name === 'AbortError' && hasStopped) {
            return USER_ABORTED;
        } else {
            return UNKNOWN_ERROR;
        }
    }
};

function isErrorCode(error: any): boolean {
    return error.hasOwnProperty("code") && error.hasOwnProperty("message");
}
