/**
 * Copyright (c) 2022, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */

import { GetSyntaxTreeResponse } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { BallerinaExtension, CodeServerContext, ExtendedLangClient } from "src/core";
import { PALETTE_COMMANDS } from "../project";
import { commands, Uri } from "vscode";
import { createGraphqlView } from "./graphql";
import { createSwaggerView } from "./swagger";
import { Position } from "src/forecaster";
import { STKindChecker } from "@wso2-enterprise/syntax-tree";

export async function activate(ballerinaExtInstance: BallerinaExtension) {
    const langClient = <ExtendedLangClient>ballerinaExtInstance.langClient;
    const codeServerContext: CodeServerContext = ballerinaExtInstance.getCodeServerContext();

    commands.registerCommand(PALETTE_COMMANDS.TRY_IT, async (docUri: string, serviceName: string, range: Position) => {
        if (!docUri) {
            return;
        }

        const fileUri: Uri = Uri.parse(docUri);

        await langClient.getSyntaxTree({
            documentIdentifier: {
                uri: fileUri.toString()
            }
        }).then(stResponse => {

            const response = stResponse as GetSyntaxTreeResponse;
            if (response.parseSuccess && response.syntaxTree) {
                response.syntaxTree.members.forEach(async member => {
                    if (STKindChecker.isServiceDeclaration(member)) {

                        const position = member.position;
                        const servicePosition = member.serviceKeyword.position;

                        if (((position.startLine == range.startLine && position.startColumn == range.startColumn) ||
                            (servicePosition.startLine == range.startLine && servicePosition.startColumn == range.startColumn)) &&
                            position.endLine == range.endLine &&
                            position.endColumn == range.endColumn) {

                            const expression = member.expressions[0];
                            if (STKindChecker.isExplicitNewExpression(expression) &&
                                STKindChecker.isQualifiedNameReference(expression.typeDescriptor) &&
                                expression.typeDescriptor.modulePrefix.value === 'graphql') {

                                const port = expression.parenthesizedArgList.arguments[0].source;
                                let path = "";
                                member.absoluteResourcePath.forEach(pathElement => {
                                    path += pathElement.value;
                                });

                                await createGraphqlView(langClient, `http://localhost:${port}${path}`);
                            } else {
                                await createSwaggerView(langClient, fileUri.fsPath, serviceName, codeServerContext);
                            }
                        }
                    }
                });
            }
        });
    });
}
