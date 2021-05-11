/*
 * Copyright (c) 2020, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 Inc. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
 */
import { ActionStatement, CaptureBindingPattern, CheckAction, ElseBlock, FunctionDefinition, IfElseStatement, LocalVarDecl, ModulePart, QualifiedNameReference, RemoteMethodCallAction, ResourceKeyword, SimpleNameReference, STKindChecker, STNode, traversNode, TypeCastExpression, VisibleEndpoint } from '@ballerina/syntax-tree';
import cloneDeep from "lodash.clonedeep";
import { Diagnostic } from 'monaco-languageclient/lib/monaco-language-client';

import { initVisitor, positionVisitor, sizingVisitor } from '../..';
import { FunctionDefinitionInfo } from "../../ConfigurationSpec/types";
import { STSymbolInfo } from '../../Definitions';
import { BallerinaConnectorsInfo, BallerinaRecord, Connector } from '../../Definitions/lang-client-extended';
import { CLIENT_SVG_HEIGHT, CLIENT_SVG_WIDTH } from "../../Diagram/components/Connector/ConnectorHeader/ConnectorClientSVG";
import * as formFieldDatabase from "../../utils/idb";
import { IFELSE_SVG_HEIGHT, IFELSE_SVG_WIDTH } from "../components/IfElse/IfElseSVG";
import { PROCESS_SVG_HEIGHT, PROCESS_SVG_WIDTH } from "../components/Processor/ProcessSVG";
import { RESPOND_SVG_HEIGHT, RESPOND_SVG_WIDTH } from "../components/Respond/RespondSVG";
import { TriggerType } from '../models';
import { EndpointViewState, PlusViewState, StatementViewState } from "../view-state";
import { ActionInvocationFinder } from '../visitors/action-invocation-finder';
import { BlockStatementFinder } from '../visitors/block-statement-finder';
import { DefaultConfig } from "../visitors/default";
import { clearAllDiagnostics, getAllDiagnostics, visitor as DiagnosticVisitor } from '../visitors/diagnostics-collector';

import * as defaultFormCache from "./form-field-cache.json";

export interface Endpoint {
    visibleEndpoint: VisibleEndpoint;
    actions?: StatementViewState[];
    firstAction?: StatementViewState;
}

export function getPlusViewState(index: number, viewStates: PlusViewState[]): PlusViewState {
    let matchingPlusViewState: PlusViewState;
    for (const plusViewState of viewStates) {
        if (plusViewState.index === index) {
            matchingPlusViewState = plusViewState
            break;
        }
    }
    return matchingPlusViewState;
}

export const MAIN_FUNCTION = "main";

const findResourceIndex = (resourceMembers: any, targetResource: any) => {
    const index = resourceMembers.findIndex(
        (m: any) => {
            const currentPath = m?.relativeResourcePath[0]?.value;
            const currentMethodType = m?.functionName?.value;
            const targetPath = targetResource?.relativeResourcePath[0]?.value;
            const targetMethodType = targetResource?.functionName?.value;

            return currentPath === targetPath && currentMethodType === targetMethodType;
        }
    );
    return index || 0;
};

const findServiceForGivenResource = (serviceMembers: any, targetResource: any) => {
    const { functionName: tFunctionName, relativeResourcePath: tRelativeResourcePath } = targetResource;
    const targetMethod = tFunctionName?.value;
    const targetPath = tRelativeResourcePath[0]?.value;

    let service = serviceMembers[0];
    serviceMembers.forEach((m: any) => {
        const resources = m.members;
        const found = resources?.find((r: any) => {
            const { functionName, relativeResourcePath } = r;
            const method = functionName?.value;
            const path = relativeResourcePath[0]?.value;
            return method === targetMethod && path === targetPath;
        });
        if (found) service = m;
    });

    return service;
}

export function getLowCodeSTFnSelected(mp: ModulePart, fncOrResource: any = null, fn: boolean = false) {
    // TODO: Simplify this code block.

    const modulePart: ModulePart = mp;
    let functionDefinition: FunctionDefinition;
    const members: STNode[] = modulePart?.members || [];

    if (fn) {
        // FunctionDefinition
        const fnMembers = members.filter((m: any) => (m.kind === "FunctionDefinition"));
        for (const node of fnMembers) {
            if (STKindChecker.isFunctionDefinition(node) && node.functionName.value === fncOrResource.functionName.value) {
                functionDefinition = node as FunctionDefinition;
                functionDefinition.configurablePosition = node.position;
                break;
            }
        }
    } else {
        const serviceMembers = members.filter((m: any) => (STKindChecker.isServiceDeclaration(m)));

        if (fncOrResource) {
            const serviceMember: STNode = findServiceForGivenResource(serviceMembers, fncOrResource);
            if (STKindChecker.isServiceDeclaration(serviceMember)) {
                const resourceMembers: STNode[] = serviceMember.members;

                let resourceIndex = 0;
                if (fncOrResource) {
                    const foundResourceIndex = findResourceIndex(resourceMembers, fncOrResource);
                    resourceIndex = foundResourceIndex > 0 ? foundResourceIndex : 0;
                }

                const resourceMember = resourceMembers[resourceIndex];

                if (resourceMember.kind === "ResourceAccessorDefinition"
                    || resourceMember.kind === "ObjectMethodDefinition"
                    || resourceMember.kind === "FunctionDefinition") {
                    const functionDef = resourceMember as FunctionDefinition;
                    functionDef.configurablePosition = serviceMember.position;
                    let isRemoteOrResource: boolean = false;

                    functionDef?.qualifierList?.forEach(qualifier => {
                        if (qualifier.kind === "ResourceKeyword"
                            || qualifier.kind === "RemoteKeyword") {
                            isRemoteOrResource = true;
                        }
                    });

                    if (isRemoteOrResource) {
                        functionDefinition = resourceMember as FunctionDefinition;
                        functionDefinition.kind = "FunctionDefinition";
                    }
                }
            }
        } else {
            for (const node of serviceMembers) {
                if (STKindChecker.isServiceDeclaration(node)) {
                    // TODO: Fix with the ST interface generation.
                    const serviceDec = node as any;
                    const resourceMembers: STNode[] = serviceDec.members;

                    for (const resourceMember of resourceMembers) {
                        if (resourceMember.kind === "ResourceAccessorDefinition"
                            || resourceMember.kind === "ObjectMethodDefinition"
                            || resourceMember.kind === "FunctionDefinition") {
                            const functionDef = resourceMember as FunctionDefinition;
                            functionDef.configurablePosition = node.position;
                            let isRemoteOrResource: boolean = false;

                            functionDef?.qualifierList?.forEach(qualifier => {
                                if (qualifier.kind === "ResourceKeyword"
                                    || qualifier.kind === "RemoteKeyword") {
                                    isRemoteOrResource = true;
                                }
                            });

                            if (isRemoteOrResource) {
                                functionDefinition = resourceMember as FunctionDefinition;
                                functionDefinition.kind = "FunctionDefinition";
                                break;
                            }
                        }
                    }
                    break;
                }
            }
        }
    }

    return functionDefinition ? functionDefinition : mp;
}

export function getLowCodeSTFn(mp: ModulePart) {
    const modulePart: ModulePart = mp;
    const members: STNode[] = modulePart.members;
    let functionDefinition: FunctionDefinition;
    for (const node of members) {
        if (STKindChecker.isFunctionDefinition(node) && node.functionName.value === MAIN_FUNCTION) {
            functionDefinition = node as FunctionDefinition;
            functionDefinition.configurablePosition = node.position;
            break;
        } else if (STKindChecker.isServiceDeclaration(node)) {
            // TODO: Fix with the ST interface generation.
            const serviceDec = node as any;
            const serviceMembers: STNode[] = serviceDec.members;
            for (const serviceMember of serviceMembers) {
                if (serviceMember.kind === "ResourceAccessorDefinition"
                    || serviceMember.kind === "ObjectMethodDefinition"
                    || serviceMember.kind === "FunctionDefinition") {
                    const functionDef = serviceMember as FunctionDefinition;
                    functionDef.configurablePosition = node.position;
                    let isRemoteOrResource: boolean = false;

                    functionDef?.qualifierList?.forEach(qualifier => {
                        if (qualifier.kind === "ResourceKeyword"
                            || qualifier.kind === "RemoteKeyword") {
                            isRemoteOrResource = true;
                        }
                    });

                    if (isRemoteOrResource) {
                        functionDefinition = serviceMember as FunctionDefinition;
                        functionDefinition.kind = "FunctionDefinition";
                        break;
                    }
                }
            }
            break;
        }
    }
    return functionDefinition ? functionDefinition : mp;
}

export function getDiagnosticsFromVisitor(st: ModulePart): Diagnostic[] {
    clearAllDiagnostics()
    traversNode(st, DiagnosticVisitor);
    const allDiagnostics = getAllDiagnostics();
    return allDiagnostics;
}

export function updateConnectorCX(maxContainerRightWidth: number, containerCX: number, allEndpoints: Map<string, Endpoint>) {
    const containerRightMostConerCX = maxContainerRightWidth + containerCX;
    let prevX = 0;
    let index: number = 0;

    allEndpoints.forEach((value: Endpoint, key: string) => {
        const visibleEndpoint: VisibleEndpoint = value.visibleEndpoint;
        const mainEp: EndpointViewState = visibleEndpoint.viewState;
        mainEp.collapsed = value.firstAction?.collapsed;

        if (index === 0) {
            if (mainEp.lifeLine.cx <= containerRightMostConerCX) {
                mainEp.lifeLine.cx = containerRightMostConerCX + (mainEp.bBox.w / 2) + DefaultConfig.epGap;
            } else if (mainEp.lifeLine.cx > containerRightMostConerCX) {
                const diff = mainEp.lifeLine.cx - containerRightMostConerCX;
                if (diff < DefaultConfig.epGap) {
                    mainEp.lifeLine.cx = mainEp.lifeLine.cx + (mainEp.bBox.w / 2) + (DefaultConfig.epGap - diff);
                }
            }
            prevX = mainEp.lifeLine.cx;
        } else {
            mainEp.lifeLine.cx = prevX + (mainEp.bBox.w / 2) + DefaultConfig.epGap;
            prevX = mainEp.lifeLine.cx;
        }

        updateActionTriggerCx(mainEp.lifeLine.cx, value.actions);
        ++index;
    });
}

export function updateActionTriggerCx(connectorCX: number, actions: StatementViewState[]) {
    actions.forEach((action) => {
        action.action.trigger.cx = connectorCX;
    });
}

export function getMaXWidthOfConnectors(allEndpoints: Map<string, Endpoint>): number {
    let prevCX: number = 0;
    allEndpoints.forEach((value: Endpoint, key: string) => {
        const visibleEndpoint: VisibleEndpoint = value.visibleEndpoint;
        const mainEp: EndpointViewState = visibleEndpoint.viewState;
        mainEp.collapsed = value.firstAction?.collapsed;
        if ((prevCX < (mainEp.lifeLine.cx + (mainEp.bBox.w / 2)))) {
            prevCX = mainEp.lifeLine.cx + (mainEp.bBox.w / 2);
        }
    });

    return prevCX;
}

export function getDraftComponentSizes(type: string, subType: string): { h: number, w: number } {
    let h: number = 0;
    let w: number = 0;

    switch (type) {
        case "APIS":
            h = CLIENT_SVG_HEIGHT;
            w = CLIENT_SVG_WIDTH;
            break;
        case "STATEMENT":
            switch (subType) {
                case "If":
                case "ForEach":
                case "While":
                    h = IFELSE_SVG_HEIGHT;
                    w = IFELSE_SVG_WIDTH;
                    break;
                case "Log":
                    h = PROCESS_SVG_HEIGHT;
                    w = PROCESS_SVG_WIDTH;
                    break;
                case "Variable":
                    h = PROCESS_SVG_HEIGHT;
                    w = PROCESS_SVG_WIDTH;
                    break;
                case "Custom":
                    h = PROCESS_SVG_HEIGHT;
                    w = PROCESS_SVG_WIDTH;
                    break;
                case "Respond":
                    h = RESPOND_SVG_HEIGHT;
                    w = RESPOND_SVG_WIDTH;
                    break;
                case "Return":
                    h = RESPOND_SVG_HEIGHT;
                    w = RESPOND_SVG_WIDTH;
                    break;
            }
            break;
        default:
            break;
    }

    return {
        h,
        w
    }
}

export async function getConnectorDefFromCache(connector: Connector) {
    const { org, module: mod, version, name } = connector;
    let connectorDef;
    try {
        const resp = await fetch(`/connectors/cache/${org}/${mod}/${version}/${name}/st.json`);
        connectorDef = resp && resp.status === 200 ? resp.json() : undefined;
    } catch (error) {
        // IGNORE
    }
    return connectorDef;
}

export async function getRecordDefFromCache(record: BallerinaRecord) {
    const { org, module: mod, version, name } = record;
    let recordDef;
    try {
        const resp = await fetch(`/records/cache/${org}/${mod}/${version}/${name}/st.json`);
        recordDef = resp && resp.status === 200 ? resp.json() : undefined;
    } catch (error) {
        // IGNORE
    }
    return recordDef;
}

export async function getFormFieldFromFileCache(connector: Connector): Promise<Map<string, FunctionDefinitionInfo>> {
    const { org, module, version, name, cacheVersion} = connector;
    const functionDef: Map<string, FunctionDefinitionInfo> = new Map();
    try {
        await fetch(`/connectors/cache/${org}/${module}/${version}/${name}/${cacheVersion || "0"}/fields.json`)
        .then(response => response.json())
        .then(data => {
            if (data) {
                for (const [key, fieldsInfo] of Object.entries(data)) {
                    functionDef.set(key, fieldsInfo as FunctionDefinitionInfo);
                }
            }
        });
    } catch (error) {
        // IGNORE
    }
    return functionDef.size > 0 ? functionDef : undefined;
}

export interface FormFieldCache {
    [key: string]: FormFiledCacheEntry
}

export interface FormFiledCacheEntry {
    [key: string]: FunctionDefinitionInfo,
}

export const FORM_FIELD_CACHE = "FORM_FIELD_CACHE";

export async function addToFormFieldCache(connector: Connector, fields: Map<string, FunctionDefinitionInfo>) {
    const { org, module: mod, version, name, cacheVersion } = connector;
    const cacheId = `${org}_${mod}_${name}_${version}_${cacheVersion || "0"}`;
    const formFieldJsonObject: any = {};
    fields.forEach((value, key) => {
        formFieldJsonObject[ key ] = value;
    });
    formFieldDatabase.put(cacheId, formFieldJsonObject);
}

export async function getFromFormFieldCache(connector: Connector): Promise<Map<string, FunctionDefinitionInfo>> {
    const { org, module: mod, version, name, cacheVersion } = connector;
    const cacheId = `${org}_${mod}_${name}_${version}_${cacheVersion || "0"}`;
    const formFieldCache = await formFieldDatabase.get(cacheId);
    if (formFieldCache) {
        const functionDef: Map<string, FunctionDefinitionInfo> = new Map();
        for (const [ key, fieldsInfo ] of Object.entries(formFieldCache)) {
            functionDef.set(key, fieldsInfo as FunctionDefinitionInfo);
        }
        return functionDef.size > 0 ? functionDef : undefined;
    }
    return undefined;
}

export function findActualEndPositionOfIfElseStatement(ifNode: IfElseStatement): any {
    let position: any;
    if (ifNode.elseBody) {
        const elseStmt: ElseBlock = ifNode.elseBody;
        if (STKindChecker.isIfElseStatement(elseStmt?.elseBody)) {
            position = findActualEndPositionOfIfElseStatement(elseStmt.elseBody as IfElseStatement);
        } else if (STKindChecker.isBlockStatement(elseStmt?.elseBody)) {
            position = elseStmt.elseBody.position;
        }
    }
    return position;
}

export function getMatchingConnector(actionInvo: STNode, connectors: BallerinaConnectorsInfo[], stSymbolInfo: STSymbolInfo): BallerinaConnectorsInfo {
    let connector: BallerinaConnectorsInfo;
    const variable = actionInvo as LocalVarDecl;
    const viewState: StatementViewState = variable.viewState as StatementViewState;
    let actionVariable: RemoteMethodCallAction;
    let remoteMethodCallAction: RemoteMethodCallAction;
    let matchModule: boolean = false;
    let matchName: boolean = false;

    // if (variable.initializer) {
        if (viewState.isAction) {
            switch (actionInvo.kind) {
                case "LocalVarDecl":
                    switch (variable.initializer.kind) {
                        case 'TypeCastExpression':
                            const initializer: TypeCastExpression = variable.initializer as TypeCastExpression;
                            actionVariable = (initializer.expression as CheckAction).expression as RemoteMethodCallAction;
                            break;
                        case 'RemoteMethodCallAction':
                            actionVariable = variable.initializer as RemoteMethodCallAction;
                            break;
                        default:
                            actionVariable = (variable.initializer as CheckAction).expression;
                    }
                    break;

                case "ActionStatement":
                    const statement = actionInvo as ActionStatement;
                    actionVariable = (statement.expression as CheckAction).expression;
                    break;

                default:
                    // TODO: need to handle this flow
                    return undefined;
            }

            remoteMethodCallAction = isSTActionInvocation(actionVariable);

            if (remoteMethodCallAction && remoteMethodCallAction.methodName &&
                remoteMethodCallAction.methodName.typeData) {
                const endPointName = actionVariable.expression.value ? actionVariable.expression.value : (actionVariable.expression as any)?.name.value;
                const endPoint = stSymbolInfo.endpoints.get(endPointName);
                const typeData: any = remoteMethodCallAction.methodName.typeData;
                if (typeData?.symbol?.moduleID) {
                    const moduleId: any = typeData?.symbol?.moduleID;
                    for (const connectorInfo of connectors) {
                        if (connectorInfo.module === moduleId.moduleName) {
                            matchModule = true;
                        }
                        if (connectorInfo.name ===
                            ((endPoint as LocalVarDecl).typedBindingPattern.typeDescriptor as QualifiedNameReference)
                                .identifier.value) {
                            matchName = true;
                        }

                        if (matchModule && matchName) {
                            connector = connectorInfo;
                            break;
                        }
                    }
                }
            }
        } else if (viewState.isEndpoint) {
            if (STKindChecker.isCaptureBindingPattern(variable.typedBindingPattern.bindingPattern)) {
                const captureBindingPattern = variable.typedBindingPattern.bindingPattern as CaptureBindingPattern;
                const endpointName: string = captureBindingPattern.variableName.value;
                const typeData: any = variable.typedBindingPattern.typeDescriptor.typeData;
                if (typeData?.symbol?.moduleID) {
                    const moduleId: any = typeData?.symbol?.moduleID;
                    for (const connectorInfo of connectors) {
                        if (connectorInfo.module === moduleId.moduleName) {
                            matchModule = true;
                        }
                        if (connectorInfo.name ===
                            ((variable as LocalVarDecl).typedBindingPattern.typeDescriptor as QualifiedNameReference)
                                .identifier.value) {
                            matchName = true;
                        }
                        if (matchModule && matchName) {
                            connector = connectorInfo;
                            break;
                        }
                    }
                }
            }
        }
    // }
    return connector;
}

export function isSTActionInvocation(node: STNode): RemoteMethodCallAction {
    const actionFinder: ActionInvocationFinder = new ActionInvocationFinder();
    traversNode(node, actionFinder);
    return actionFinder.getIsAction();
}

export function haveBlockStatement(node: STNode): boolean {
    const blockStatementFinder: BlockStatementFinder = new BlockStatementFinder();
    traversNode(node, blockStatementFinder);
    return blockStatementFinder.getHaveBlockStatement();
}

export function isSTResourceFunction(node: FunctionDefinition): boolean {
    const qualifierList: ResourceKeyword[] = node.qualifierList ?
        node.qualifierList as ResourceKeyword[] : [];
    let resourceKeyword: ResourceKeyword;
    qualifierList.forEach((qualifier: STNode) => {
        if (qualifier.kind === "ResourceKeyword") {
            resourceKeyword = qualifier as ResourceKeyword;
        }
    });

    return (resourceKeyword !== undefined);
}

export function getConfigDataFromSt(triggerType: TriggerType, model: any): any {
    const scheduleRegex = /\/\/ Schedule: (Minute|Hourly|Daily|Monthly|Weekly): ((\*\/)?[1-5]?[0-9]|\*) ((\*\/)?2[0-3]|(\*\/)?[1]?[0-9]|\*) (3[0-1]|2[0-9]|[1]?[0-9]|\*) (1[0-2]|[0-9]|\*) ((Sun|Mon|Tue|Wed|Thu|Fri|Sat)((Sun)?(,)?(Mon)?(,)?(Tue)?(,)?(Wed)?(,)?(Thu)?(,)?(Fri)?(,)?(Sat)?)?|\*)\n/g;
    switch (triggerType) {
        case "API":
        case "Webhook":
            let resourcePath = "";
            if (model?.relativeResourcePath?.length > 0) {
                for (const relativeResourcePath of model?.relativeResourcePath) {
                    resourcePath += relativeResourcePath.value && relativeResourcePath.kind !== "DotToken" ?
                        relativeResourcePath.value : (relativeResourcePath.source || "");
                }
            }
            return {
                method: model?.functionName?.value,
                path: resourcePath
            }
        case "Schedule":
            return {
                cron: model?.source?.match(scheduleRegex)[0].split(":")[2].replace("\n", "").trim(),
                schType: model?.source?.match(scheduleRegex)[0].split(":")[1].trim()
            }
        default:
            return undefined;
    }
}

export function sizingAndPositioningST(st: STNode): STNode {
    traversNode(st, initVisitor);
    traversNode(st, sizingVisitor);
    traversNode(st, positionVisitor);
    const clone = { ...st };
    return clone;
}

export function recalculateSizingAndPositioningST(st: STNode): STNode {
    traversNode(st, sizingVisitor);
    traversNode(st, positionVisitor);
    const clone = { ...st };
    return clone;
}
