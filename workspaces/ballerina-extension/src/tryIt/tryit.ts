/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { GetSyntaxTreeResponse } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { BallerinaExtension, CodeServerContext, ExtendedLangClient } from "src/core";
import { PALETTE_COMMANDS } from "../project";
import { commands, Uri, window } from "vscode";
import { createGraphqlView } from "./graphql";
import { createSwaggerView } from "./swagger";
import { Position } from "src/forecaster";
import { STKindChecker } from "@wso2-enterprise/syntax-tree";
import { Process, findRunningBallerinaServices } from "./serviceFinder";
import { dirname } from 'path';
import { debug } from "../utils";

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

                                let path = "";
                                member.absoluteResourcePath.forEach(pathElement => {
                                    path += pathElement.value;
                                });

                                let port: string | undefined;
                                try {
                                    const services = await findRunningBallerinaServices(dirname(fileUri.fsPath));
                                    if (services.length === 1) {
                                        port = services[0].port.toString();
                                    } else if (services.length > 1) {
                                        port = (await window.showQuickPick(services.map((service: Process) => {
                                            return {
                                                label: service.port.toString()
                                            };
                                        }), {
                                            placeHolder: "Select the GraphQL service port to try out",
                                            canPickMany: false
                                        })).label;
                                    }
                                } catch (e) {
                                    debug(`Error while finding running Ballerina services: ${e}`);
                                }
                                finally {
                                    if (!port) {
                                        port = await window.showInputBox({
                                            placeHolder: "Enter the port number of the GraphQL service",
                                            prompt: "Unable to find running Ballerina services. Please enter the port number of the service",
                                            validateInput: (port) => {
                                                if (isNaN(Number(port))) {
                                                    return "Port should be a number";
                                                }
                                                return null;
                                            }
                                        });
                                    }
                                }
                                if (!port) {
                                    window.showErrorMessage('GraphQL service port is required to use the `Try It` feature');
                                } else {

                                    const newPath = await window.showInputBox({
                                        placeHolder: "Enter the path of the GraphQL service",
                                        prompt: "Please enter the path of the GraphQL service",
                                        value: path
                                    });
                                    if (newPath) {
                                        path = newPath;
                                    }
                                    const service = `http://localhost:${port}${path}`;
                                    debug(`Trying out GraphQL service: ${service}`);
                                    await createGraphqlView(langClient, service);
                                }
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
