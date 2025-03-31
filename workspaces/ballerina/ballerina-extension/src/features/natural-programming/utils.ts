/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import * as fs from 'fs';
import * as path from 'path';
import vscode, { Diagnostic, Uri } from 'vscode';
import { extension } from "../../BalExtensionContext";
import { ReadableStream } from 'stream/web';
import { CustomDiagnostic } from './custom-diagnostics';
import { requirementsSpecification, refreshAccessToken, isErrorCode } from "../../rpc-managers/ai-panel/utils";
import { UNKNOWN_ERROR } from '../../views/ai-panel/errorCodes';
import { BallerinaPluginConfig, ResultItem, DriftResponseData, DriftResponse } from "./interfaces";
import {
    PROJECT_DOCUMENTATION_DRIFT_CHECK_ENDPOINT, API_DOCS_DRIFT_CHECK_ENDPOINT,
    DEVELOPER_OVERVIEW_FILENAME, NATURAL_PROGRAMMING_PATH, DEVELOPER_OVERVIEW_RELATIVE_PATH,
    REQUIREMENT_DOC_PREFIX, REQUIREMENT_TEXT_DOCUMENT, REQUIREMENT_MD_DOCUMENT,
    README_FILE_NAME_LOWERCASE, DRIFT_DIAGNOSTIC_ID,
    LACK_OF_API_DOCUMENTATION_WARNING, LACK_OF_API_DOCUMENTATION_WARNING_2,
    NO_DOCUMENTATION_WARNING, CONFIG_FILE_NAME,
    MISSING_README_FILE_WARNING, MISSING_README_FILE_WARNING_2,
    MISSING_REQUIREMENT_FILE, MISSING_API_DOCS, MISSING_API_DOCS_2
} from "./constants";
import { isError, isNumber } from 'lodash';
import { HttpStatusCode } from 'axios';
import { BACKEND_URL } from '../ai/utils';

let controller = new AbortController();

export async function getLLMDiagnostics(projectUri: string, diagnosticCollection: vscode.DiagnosticCollection): Promise<number | null> {
    const sources = await getBallerinaSourceFiles(projectUri);
    const backendurl = await getBackendURL();
    const token = await getAccessToken();

    const responses = await getLLMResponses(sources, token, backendurl);

    if (responses == null) {
        return;
    }

    if (isNumber(responses)) {
        return responses;
    }

    await createDiagnosticCollection(responses, projectUri, diagnosticCollection);
}

async function getLLMResponses(sources: { balFiles: string; readme: string; requirements: string; developerOverview: string; }, token: string, backendurl: string): Promise<any[] | number> {
    const commentResponsePromise = fetchWithToken(
        backendurl + API_DOCS_DRIFT_CHECK_ENDPOINT,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify([sources.balFiles]),
            signal: controller.signal,
        },
    );

    const documentationSourceResponsePromise = fetchWithToken(
        backendurl + PROJECT_DOCUMENTATION_DRIFT_CHECK_ENDPOINT,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify([sources.balFiles, sources.requirements, sources.readme, sources.developerOverview]),
            signal: controller.signal,
        },
    );

    const [commentResponse, documentationSourceResponse] = await Promise.all([commentResponsePromise, documentationSourceResponsePromise]);

    if (isError(commentResponse) || isError(documentationSourceResponse)) {
        return HttpStatusCode.InternalServerError;
    }

    if (!commentResponse.ok) {
        return commentResponse.status;
    }

    if (!documentationSourceResponse.ok) {
        return documentationSourceResponse.status;
    }

    const extractedcommentResponse = extractResponseAsJsonFromString(await streamToString(commentResponse.body));
    const extracteddocumentationSourceResponse = extractResponseAsJsonFromString(await streamToString(documentationSourceResponse.body));
    return [extractedcommentResponse, extracteddocumentationSourceResponse];
}

async function createDiagnosticCollection(responses: any[], projectUri: string, diagnosticCollection: vscode.DiagnosticCollection) {
    let diagnosticsMap = new Map<string, vscode.Diagnostic[]>();

    if (responses[0] != null) {
        diagnosticsMap = await createDiagnosticsResponse(responses[0], projectUri, diagnosticsMap);
    }

    if (responses[1] != null) {
        diagnosticsMap = await createDiagnosticsResponse(responses[1], projectUri, diagnosticsMap);
    }

    // Set diagnostics in VS Code
    diagnosticCollection.clear();
    diagnosticsMap.forEach((diagnostics, filePath) => {
        const uri = vscode.Uri.file(filePath);
        diagnosticCollection.set(uri, diagnostics);
    });
}

async function createDiagnosticsResponse(data: DriftResponseData, projectPath: string,
    diagnosticsMap: Map<string, vscode.Diagnostic[]>): Promise<Map<string, vscode.Diagnostic[]>> {
    for (const result of data.results) {
        let fileName = result.fileName;

        if (isSkippedDiagnostic(result)) {
            continue;
        }

        if (result.codeFileName != undefined && result.codeFileName != null && result.codeFileName != "") {
            fileName = result.codeFileName;
        }

        const uri = vscode.Uri.file(path.join(projectPath, fileName));
        const diagnostic = await createDiagnostic(result, uri);

        // Store diagnostics per file
        if (!diagnosticsMap.has(uri.path)) {
            diagnosticsMap.set(uri.path, []);
        }
        diagnosticsMap.get(uri.path)!.push(diagnostic);
    }

    return diagnosticsMap;
}

async function createDiagnostic(result: ResultItem, uri: Uri): Promise<CustomDiagnostic> {
    function hasCodeChangedRows(item: Partial<ResultItem>): boolean {
        return isValidRow(item.startRowforImplementationChangedAction) && isValidRow(item.endRowforImplementationChangedAction);
    }

    function hasDocChangedRows(item: Partial<ResultItem>): boolean {
        return isValidRow(item.startRowforDocChangedAction) && isValidRow(item.endRowforDocChangedAction);
    }

    function isValidRow(row: number) {
        return row != undefined && row != null && row >= 1;
    }

    const isSolutionsAvailable = hasCodeChangedRows(result);
    const isDocChangeSolutionsAvailable: boolean = hasDocChangedRows(result);
    let codeChangeEndPosition = isSolutionsAvailable
        ? new vscode.Position(result.endRowforImplementationChangedAction - 1, 0)
        : new vscode.Position(0, 0);
    let docChangeEndPosition = isDocChangeSolutionsAvailable
        ? new vscode.Position(result.endRowforDocChangedAction - 1, 0)
        : new vscode.Position(0, 0);

    let range = new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, 0));
    const filePath = uri.fsPath;
    let document = null;
    if ((isSolutionsAvailable || isDocChangeSolutionsAvailable) && fs.existsSync(filePath)) {
        document = await vscode.workspace.openTextDocument(uri);
    }

    try {
        if (document != null) {
            if (isSolutionsAvailable) {
                codeChangeEndPosition = document.lineAt(result.endRowforImplementationChangedAction - 1).range.end;
                if (isDocChangeSolutionsAvailable) {
                    docChangeEndPosition = document.lineAt(result.endRowforDocChangedAction - 1).range.end;
                }
                range = new vscode.Range(
                    new vscode.Position(result.startRowforImplementationChangedAction - 1, 0),
                    codeChangeEndPosition
                );
            } else if (isDocChangeSolutionsAvailable) {
                docChangeEndPosition = document.lineAt(result.endRowforDocChangedAction - 1).range.end;
                range = new vscode.Range(
                    new vscode.Position(result.startRowforDocChangedAction - 1, 0),
                    docChangeEndPosition
                );
            }
        }
    } catch (error) {
        // ignore
    }

    const diagnostic = new CustomDiagnostic(
        range,
        result.cause,
        vscode.DiagnosticSeverity.Warning,
        {
            implementationChangeSolution: result.implementationChangeSolution,
            docChangeSolution: result.docChangeSolution,
            fileName: result.fileName,
            id: DRIFT_DIAGNOSTIC_ID,
            docRange: isDocChangeSolutionsAvailable ? new vscode.Range(
                new vscode.Position(result.startRowforDocChangedAction - 1, 0),
                docChangeEndPosition
            ) : null
        }
    );

    diagnostic.code = {
        value: DRIFT_DIAGNOSTIC_ID,
        target: uri
    };

    return diagnostic;
}

export async function getLLMDiagnosticArrayAsString(projectUri: string): Promise<string | number> {
    const sources = await getBallerinaSourceFiles(projectUri);
    const backendurl = await getBackendURL();
    const token = await getAccessToken();

    const responses = await getLLMResponses(sources, token, backendurl);

    if (isNumber(responses)) {
        return responses;
    }

    if (responses == null) {
        return "";
    }

    let diagnosticArray = (await createDiagnosticArray(responses, projectUri)).map(diagnostic => {
        return `${diagnostic.message}`;
    })
        .join("\n\n");

    return diagnosticArray;
}

async function createDiagnosticArray(responses: any[], projectUri: string): Promise<Diagnostic[]> {
    const diagnostics = [];

    if (responses[0] != null) {
        await createDiagnosticList(responses[0], projectUri, diagnostics);
    }

    if (responses[1] != null) {
        await createDiagnosticList(responses[1], projectUri, diagnostics);
    }

    function filterUniqueDiagnostics(diagnostics: vscode.Diagnostic[]): vscode.Diagnostic[] {
        const messageCount = new Map<string, number>();

        diagnostics.forEach(diagnostic => {
            const message = diagnostic.message;
            messageCount.set(message, (messageCount.get(message) || 0) + 1);
        });

        return diagnostics.filter(diagnostic => messageCount.get(diagnostic.message) === 1);
    }

    return filterUniqueDiagnostics(diagnostics);
}

export function extractResponseAsJsonFromString(jsonString: string): any {
    try {
        const driftResponse: DriftResponse = JSON.parse(jsonString);
        const drift = driftResponse.drift;
        if (drift == null) {
            return null;
        }

        const jsonRegex = /\{\s*"results":\s*\[[\s\S]*?\]\s*\}/g;
        const jsonMatches = drift.match(jsonRegex);
        if (!jsonMatches || jsonMatches.length === 0) {
            return null;
        }

        for (let i = jsonMatches.length - 1; i >= 0; i--) {
            try {
                const extractedJson = jsonMatches[i];
                const parsedJson: DriftResponseData = JSON.parse(extractedJson);
                if (parsedJson && parsedJson.results && Array.isArray(parsedJson.results)) {
                    return parsedJson;
                }
            } catch (error) {
                console.log(error);
                // Ignore parsing errors and continue checking earlier JSON objects
            }
        }
        return null;
    } catch (error) {
        return null;
    }
}

export async function createDiagnosticList(data: DriftResponseData, projectPath: string, diagnostics: Diagnostic[]) {
    for (const result of data.results) {
        let fileName = result.fileName;

        if (isSkippedDiagnostic(result)) {
            continue;
        }

        if (result.codeFileName != undefined && result.codeFileName != null && result.codeFileName != "") {
            fileName = result.codeFileName;
        }

        const uri = vscode.Uri.file(path.join(projectPath, fileName));
        const diagnostic = await createDiagnostic(result, uri);  // Wait for each createDiagnostic call to complete
        diagnostics.push(diagnostic);  // Push the diagnostic result after it's created
    }

    return diagnostics;
}

export async function getBallerinaSourceFiles(folderPath: string): Promise<{ balFiles: string; readme: string; requirements: string; developerOverview: string; }> {
    let balFiles = "<project>\n";
    let readmeContent = "";

    function formatWithLineNumbers(content: string): string {
        return content
            .split("\n")
            .map((line, index) => `${index + 1}|${line}`)
            .join("\n");
    }

    function getBalFiles(dir: string) {
        if (!fs.existsSync(dir)) { return; }
        const files = fs.readdirSync(dir);
        for (const file of files) {
            const fullPath = path.join(dir, file);
            if (fs.statSync(fullPath).isFile() && file.endsWith(".bal")) {
                const content = fs.readFileSync(fullPath, "utf8");
                const formattedContent = formatWithLineNumbers(content);
                balFiles += `  <file filename=\"${file}\">\n    ${formattedContent}\n  </file>\n`;
            }
        }
    }

    function getModuleBalFiles(modulesDir: string) {
        if (!fs.existsSync(modulesDir)) { return; }
        const moduleDirs = fs.readdirSync(modulesDir).filter(dir =>
            fs.statSync(path.join(modulesDir, dir)).isDirectory()
        );

        for (const moduleName of moduleDirs) {
            const modulePath = path.join(modulesDir, moduleName);
            const files = fs.readdirSync(modulePath);
            for (const file of files) {
                const fullPath = path.join(modulePath, file);
                if (fs.statSync(fullPath).isFile() && file.endsWith(".bal")) {
                    const content = fs.readFileSync(fullPath, "utf8");
                    const formattedContent = formatWithLineNumbers(content);
                    balFiles += `  <program filename=\"modules/${moduleName}/${file}\">\n    ${formattedContent}\n  </program>\n`;
                }
            }
        }
    }

    async function getRequirementAndDeveloperOverviewFiles(naturalLangDir: string): Promise<[string, string]> {
        if (!fs.existsSync(naturalLangDir)) { return ["", ""]; }

        const files = fs.readdirSync(naturalLangDir);
        let requirementsContent = "";
        let developerContent = "";

        for (const file of files) {
            const fullPath = path.join(naturalLangDir, file);

            if (file.toLowerCase().startsWith(DEVELOPER_OVERVIEW_FILENAME)) {
                developerContent = `<developer_documentation filename=\"${DEVELOPER_OVERVIEW_RELATIVE_PATH}\">\n${fs.readFileSync(fullPath, "utf8")}\n</developer_documentation>\n`;
            }

            if (file.toLowerCase().startsWith(REQUIREMENT_DOC_PREFIX)) {
                let content = "";
                if (file.toLowerCase().startsWith(REQUIREMENT_TEXT_DOCUMENT) || file.toLowerCase().startsWith(REQUIREMENT_MD_DOCUMENT)) {
                    content = fs.readFileSync(fullPath, "utf8");
                } else {
                    const requirementContent = await requirementsSpecification(fullPath);
                    if (!isErrorCode(requirementContent)) {
                        content = requirementContent.toString();
                    } else {
                        content = "";
                    }
                }
                requirementsContent += `<requirement_specification filename=\"${NATURAL_PROGRAMMING_PATH}/${file}\">\n${content}\n</requirement_specification>\n`;
            }
        }
        return [requirementsContent, developerContent];
    }

    function getReadmeContent(folderPath: string): string {
        if (!fs.existsSync(folderPath)) { return ""; }

        const files = fs.readdirSync(folderPath);
        const readmeFile = files.find(file => file.toLowerCase() === README_FILE_NAME_LOWERCASE);

        if (!readmeFile) { return ""; }

        const readmePath = path.join(folderPath, readmeFile);
        const content = fs.readFileSync(readmePath, "utf8");

        return `<readme filename="${readmeFile}">\n${content}\n</readme>\n`;
    }

    getBalFiles(folderPath);
    getModuleBalFiles(path.join(folderPath, "modules"));
    const nlContent = await getRequirementAndDeveloperOverviewFiles(path.join(folderPath, NATURAL_PROGRAMMING_PATH));
    readmeContent = getReadmeContent(folderPath);

    balFiles += "</project>";

    return {
        balFiles,
        readme: readmeContent.trim(),
        requirements: nlContent[0].trim(),
        developerOverview: nlContent[1].trim()
    };
}

export async function fetchWithToken(url: string, options: RequestInit) {
    try {
        let response = await fetch(url, options);
        console.log("Response status: ", response.status);
        if (response.status === 401) {
            console.log("Token expired. Refreshing token...");
            const newToken = await refreshAccessToken();
            if (newToken) {
                options.headers = {
                    ...options.headers,
                    'Authorization': `Bearer ${newToken}`,
                };
                response = await fetch(url, options);
            }
        }
        return response;
    } catch (error) {
        return Error("Error occured while sending the request");
    }
}

export function getPluginConfig(): BallerinaPluginConfig {
    return vscode.workspace.getConfiguration('ballerina');
}

export async function getBackendURL(): Promise<string> {
    return new Promise(async (resolve) => {
        resolve(BACKEND_URL);
    });
}

export async function getAccessToken(): Promise<string> {
    return new Promise(async (resolve) => {
        const token = await extension.context.secrets.get('BallerinaAIUser');
        resolve(token as string);
    });
}

export async function streamToString(stream: ReadableStream<Uint8Array>): Promise<string> {
    const reader = stream.getReader();
    const decoder = new TextDecoder("utf-8");
    let result = "";

    while (true) {
        const { done, value } = await reader.read();
        if (done) {
            break;
        }
        result += decoder.decode(value, { stream: true });
    }

    return result;
}

// Function to find a file in a case-insensitive way
function findFileCaseInsensitive(directory, fileName) {
    const files = fs.readdirSync(directory);
    const targetFile = files.find(file => file.toLowerCase() === fileName.toLowerCase());
    const file = targetFile ? targetFile: fileName;
    return path.join(directory, file);
}

export function addDefaultModelConfigForNaturalFunctions(projectPath: string, token: string, backendUrl: string) {
    const targetTable = '[ballerinax.np.defaultModelConfig]';
    const urlLine = `url = "${backendUrl}"`;
    const accessTokenLine = `accessToken = "${token}"`;
    const configFilePath = findFileCaseInsensitive(projectPath, CONFIG_FILE_NAME);

    let fileContent = '';

    if (fs.existsSync(configFilePath)) {
        fileContent = fs.readFileSync(configFilePath, 'utf-8');
    }

    const tableStartIndex = fileContent.indexOf(targetTable);

    if (tableStartIndex === -1) {
        // Table doesn't exist, create it
        if (fileContent.length > 0 && !fileContent.endsWith('\n')) {
            fileContent += '\n\n';
        }
        fileContent += `\n${targetTable}\n${urlLine}\n${accessTokenLine}\n`;
        fs.writeFileSync(configFilePath, fileContent);
        return;
    } 

    // Table exists, update it
    const tableEndIndex = fileContent.indexOf('\n', tableStartIndex);

    let updatedTableContent = `${targetTable}\n${urlLine}\n${accessTokenLine}`;

    let urlLineIndex = fileContent.indexOf('url =', tableStartIndex);
    let accessTokenLineIndex = fileContent.indexOf('accessToken =', tableStartIndex);

    if (urlLineIndex !== -1 && accessTokenLineIndex !== -1) {
        // url and accessToken lines exist, replace them
        const existingUrlLineEnd = fileContent.indexOf('\n', urlLineIndex);
        const existingAccessTokenLineEnd = fileContent.indexOf('\n', accessTokenLineIndex);

        fileContent =
            fileContent.substring(0, urlLineIndex) +
            urlLine +
            fileContent.substring(existingUrlLineEnd, accessTokenLineIndex) +
            accessTokenLine +
            fileContent.substring(existingAccessTokenLineEnd);
        fs.writeFileSync(configFilePath, fileContent);
        return;
    }

    // If url or accessToken line does not exist, just replace the entire table
    let nextTableStartIndex = fileContent.indexOf('[', tableEndIndex + 1);
    if (nextTableStartIndex === -1) {
        fileContent = fileContent.substring(0, tableStartIndex) 
                + updatedTableContent + fileContent.substring(tableEndIndex + 1);
    } else {
        let nextLineBreakIndex = fileContent.substring(tableEndIndex + 1).indexOf('\n');
        if (nextLineBreakIndex === -1) {
            fileContent = fileContent.substring(0, tableStartIndex) + updatedTableContent;
        } else {
            fileContent = fileContent.substring(0, tableStartIndex) 
                + updatedTableContent + fileContent.substring(tableEndIndex + 1);
        }
    }
    fs.writeFileSync(configFilePath, fileContent);
}

export function getTokenForNaturalFunction() {
    try {
        return refreshAccessToken();
    } catch (error) {
        throw error;
    }
}

function isSkippedDiagnostic(result: ResultItem) {
    const cause = result.cause.toLowerCase();
    if (cause.includes(LACK_OF_API_DOCUMENTATION_WARNING) || cause.includes(LACK_OF_API_DOCUMENTATION_WARNING_2) || cause.includes(MISSING_API_DOCS_2)
        || cause.includes(MISSING_API_DOCS) || cause.includes(NO_DOCUMENTATION_WARNING) || cause.includes(MISSING_README_FILE_WARNING)
        || cause.includes(MISSING_REQUIREMENT_FILE) || cause.includes(MISSING_README_FILE_WARNING_2)) {
        return true;
    }
    return false;
}
