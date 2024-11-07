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
    request: GenerteMappingsFromRecordRequest
): Promise<GenerateMappingFromRecordResponse> {
    const source = createDataMappingFunctionSource(request.inputRecordTypes, request.outputRecordType, request.functionName);
    const updatedSource = await getUpdatedFunctionSource(projectRoot, source);
    return Promise.resolve({mappingCode: updatedSource});
}

async function getUpdatedFunctionSource(
    projectRoot: string,
    funcSource: string
): Promise<string> {
    const tempDir = fs.mkdtempSync(
      path.join(os.tmpdir(), "ballerina-data-mapping-temp-")
    );
    fs.cpSync(projectRoot, tempDir, { recursive: true });
    const tempTestFilePath = path.join(tempDir, "temp.bal");
    fs.writeFileSync(tempTestFilePath, funcSource.trim(), "utf8");

    const fileUri = Uri.file(tempTestFilePath).toString();
  
    langClient.didOpen({
      textDocument: {
        uri: fileUri,
        languageId: "ballerina",
        version: 1,
        text: funcSource,
      },
    });
  
    const st = (await langClient.getSyntaxTree({
      documentIdentifier: {
        uri: fileUri,
      },
    })) as SyntaxTree;
  
    let funcDefinitionNode: FunctionDefinition = null;
    const modulePart = st.syntaxTree as ModulePart;
  
    modulePart.members.forEach((member) => {
      if (STKindChecker.isFunctionDefinition(member)) {
        funcDefinitionNode = member;
      }
    });
  
    if (!funcDefinitionNode) {
      throw new Error("Function definition not found in syntax tree");
    }
  
    const processedST = await processMappings(
      funcDefinitionNode,
      fileUri
    );
    if (isErrorCode(processedST)) {
      throw new Error((processedST as ErrorCode).message);
    }
  
    const { parseSuccess, source, syntaxTree } = processedST as SyntaxTree;
    if (!parseSuccess) {
      throw new Error("Error modifying syntax tree");
    }
  
    const fn = getFunction(
      syntaxTree as ModulePart,
      funcDefinitionNode.functionName.value
    );
  
    return fn.source;
}

function createDataMappingFunctionSource(inputParams: DataMappingRecord[], outputParam: DataMappingRecord, functionName: string): string {
    const finalFunctionName = functionName || "transform";
    const parametersStr = inputParams
        .map((item) => `${item.type}${item.isArray ? '[]' : ''} ${camelCase(item.type)}`)
        .join(",");

    const returnTypeStr = `returns ${outputParam.type}${outputParam.isArray ? '[]' : ''}`;

    const modification = createFunctionSignature(
        "",
        finalFunctionName,
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
