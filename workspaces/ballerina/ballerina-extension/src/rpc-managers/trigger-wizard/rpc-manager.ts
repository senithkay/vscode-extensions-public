/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 * 
 * THIS FILE INCLUDES AUTO GENERATED CODE
 */
import {
    ListenerService,
    NodePosition,
    ReferenceLSRequest,
    ServicesByListenerRequest,
    ServicesByListenerResponse,
    SyntaxTree,
    Trigger,
    TriggerParams,
    TriggerWizardAPI,
    Triggers,
    TriggersParams
} from "@wso2-enterprise/ballerina-core";
import { StateMachine } from "../../stateMachine";
import { URI } from "vscode-uri";
import { ListenerDeclaration, ModulePart, ServiceDeclaration, STKindChecker } from "@wso2-enterprise/syntax-tree";

export class TriggerWizardRpcManager implements TriggerWizardAPI {
    async getTriggers(params: TriggersParams): Promise<Triggers> {
        return new Promise(async (resolve) => {
            const context = StateMachine.context();
            const res: Triggers = await context.langClient.getTriggers(params) as Triggers;
            resolve(res);
        });
    }

    async getTrigger(params: TriggerParams): Promise<Trigger> {
        return new Promise(async (resolve) => {
            const context = StateMachine.context();
            try {
                const res: Trigger = await context.langClient.getTrigger(params) as Trigger;
                resolve(res);
            } catch (error) {
                console.log(error);
            }
        });
    }

    async getServicesByListener(params: ServicesByListenerRequest): Promise<ServicesByListenerResponse> {
        return new Promise(async (resolve) => {
            const services: ListenerService[] = [];
            const position: NodePosition = params.position ? params.position : StateMachine.context().position;
            const listenerUri = URI.file(StateMachine.context().documentUri).toString();
            const refReq: ReferenceLSRequest = {
                textDocument: { uri: listenerUri },
                position: {
                    character: position.endColumn - 1,
                    line: position.endLine
                },
                context: {
                    includeDeclaration: false
                }
            }
            const references = await StateMachine.langClient().getReferences(refReq);

            for (const res of references) {
                try {
                    const refSt = await StateMachine.langClient().getSTByRange({ documentIdentifier: { uri: res.uri }, lineRange: res.range }) as SyntaxTree;
                    if (STKindChecker.isSimpleNameReference(refSt.syntaxTree)) {
                        const nameRef = refSt.syntaxTree;
                        console.log(refSt);
                        const st = await StateMachine.langClient().getSyntaxTree({ documentIdentifier: { uri: res.uri } }) as SyntaxTree;
                        const filePath = URI.parse(res.uri).fsPath;
                        const modulePart = st.syntaxTree as ModulePart;
                        modulePart.members.forEach(member => {
                            if (STKindChecker.isServiceDeclaration(member) && member.expressions && member.expressions.length > 0) {
                                const expression = member.expressions[0];
                                if (JSON.stringify(expression.position) === JSON.stringify(nameRef.position)) {
                                    services.push({ name: getServiceName(member), service: member, filePath })
                                }
                            }
                        })
                    }
                } catch (error) {
                    console.log(error);
                }
            }

            const listenerST = await StateMachine.langClient().getSTByRange({
                documentIdentifier: { uri: listenerUri },
                lineRange: {
                    start: { line: position.startLine, character: position.startColumn },
                    end: { line: position.endLine, character: position.endColumn }
                }
            }) as SyntaxTree;

            const listener = listenerST.syntaxTree as ListenerDeclaration;
            let trigger: Trigger = null;
            if (STKindChecker.isQualifiedNameReference(listener.typeDescriptor)) {
                const module = listener.typeDescriptor.typeData?.typeSymbol?.moduleID;
                const orgName = module.orgName;
                const packageName = module.packageName;
                trigger = await StateMachine.langClient().getTrigger({ orgName, packageName }) as Trigger;
            }
            resolve({ listener, services, trigger });
        });
    }
}

function getServiceName(parent: ServiceDeclaration): string {
    let servicePath = "";
    parent.absoluteResourcePath.forEach(item => {
        servicePath += item.source.trim();
    });
    return servicePath;
}
