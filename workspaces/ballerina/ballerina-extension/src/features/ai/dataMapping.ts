/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com).
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { createFunctionSignature, DataMappingRecord, ErrorCode, GenerateMappingFromRecordResponse, GenerteMappingsFromRecordRequest, getSource, PartialST, ProjectSource, SyntaxTree } from "@wso2-enterprise/ballerina-core";
import { FunctionDefinition, ModulePart, RequiredParam, STKindChecker } from "@wso2-enterprise/syntax-tree";
import { camelCase, memoize } from "lodash";
import path from "path";
import * as fs from 'fs';
import * as os from 'os';
import { Uri, workspace } from "vscode";
import { langClient } from "./activator";
import { getFunction, isErrorCode, processMappings } from "../../rpc-managers/ai-panel/utils";
import { MODIFIYING_ERROR } from "../../views/ai-panel/errorCodes";


export async function generateDataMapping(
    projectRoot: string,
    projectSource: ProjectSource,
    request: GenerteMappingsFromRecordRequest
): Promise<GenerateMappingFromRecordResponse> {
    const source = createDataMappingFunctionSource(request.inputRecordTypes, request.outputRecordType);
    const updatedSource = await getUpdatedFunctionSource(projectRoot, projectSource, source);
    return Promise.resolve({mappingCode: updatedSource});
}

async function getUpdatedFunctionSource(
    projectRoot: string,
    projectSource: ProjectSource,
    funcSource: string
): Promise<string> {
    let documentFilePath = "";

    for (const sourceFile of projectSource.sourceFiles) {
        documentFilePath = path.join(projectRoot, sourceFile.filePath);
        break;
    }

    const projectFolderPath = await findBallerinaProjectRoot(documentFilePath);
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ballerina-data-mapping-temp-'));
    fs.cpSync(projectFolderPath, tempDir, { recursive: true });
    const tempTestFilePath = path.join(projectFolderPath, 'test.bal');
    fs.writeFileSync(tempTestFilePath, funcSource, 'utf8');

    const fileUri = Uri.file(tempTestFilePath).toString();

    const st = await langClient.getSyntaxTree({
        documentIdentifier: {
            uri: fileUri
        }
    }) as SyntaxTree;

    let funcDefinitionNode: FunctionDefinition = null;
    const modulePart = st.syntaxTree as ModulePart;
    modulePart.members.forEach((member) => {
        if (STKindChecker.isFunctionDefinition(member)) {
            funcDefinitionNode = member;
        }
    });

    const processedST = await processMappings(funcDefinitionNode, fileUri);
    if (isErrorCode(processedST)) {
        throw new Error((processedST as ErrorCode).message);
    }

    const { parseSuccess, source, syntaxTree } = processedST as SyntaxTree;

    if (!parseSuccess) {
        throw new Error(MODIFIYING_ERROR.message);
    }

    const fn = getFunction(syntaxTree as ModulePart, funcDefinitionNode.functionName.value);

    fs.rmSync(tempDir, { recursive: true, force: true });

    return fn.source;
}

function createDataMappingFunctionSource(inputParams: DataMappingRecord[], outputParam: DataMappingRecord): string {
    const parametersStr = inputParams
            .map((item) => `${item.type}${item.isArray ? '[]' : ''} ${camelCase(item.type)}`)
            .join(",");

    const returnTypeStr = `returns ${outputParam.type}${outputParam.isArray ? '[]' : ''}`;

    const modification = createFunctionSignature(
        "",
        "transform",
        parametersStr,
        returnTypeStr,
        {startLine: 0, startColumn: 0},
        false,
        true,
        outputParam.isArray ? '[]' : '{}'
    );
    const source = getSource(modification);
    return source;
}

async function findBallerinaProjectRoot(filePath: string): Promise<string | null> {
    const workspaceFolders = workspace.workspaceFolders;
    if (!workspaceFolders) {
        return null;
    }

    // Check if the file is within any of the workspace folders
    const workspaceFolder = workspaceFolders.find(folder => filePath.startsWith(folder.uri.fsPath));
    if (!workspaceFolder) {
        return null;
    }

    let currentDir = path.dirname(filePath);

    while (currentDir.startsWith(workspaceFolder.uri.fsPath)) {
        const ballerinaTomlPath = path.join(currentDir, 'Ballerina.toml');
        if (fs.existsSync(ballerinaTomlPath)) {
            return currentDir;
        }
        currentDir = path.dirname(currentDir);
    }

    return null;
}
