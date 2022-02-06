
import { ConfigOverlayFormStatus, ConfigPanelStatus, DiagramSize, STSymbolInfo, WizardType } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { FunctionDefinition, NodePosition, STKindChecker, STNode, traversNode } from "@wso2-enterprise/syntax-tree";

import { SelectedPosition } from "../../types";
import { ConditionConfig } from "../components/FormComponents/Types";
import { BlockViewState, FunctionViewState } from "../components/LowCodeDiagram/ViewState";
import { visitor as initVisitor } from "../components/LowCodeDiagram/Visitors/init-visitor";
import { visitor as positionVisitor } from "../components/LowCodeDiagram/Visitors/positioning-visitor";
import { visitor as sizingVisitor } from "../components/LowCodeDiagram/Visitors/sizing-visitor";
import { getVaribaleNamesFromVariableDefList } from "../components/Portals/utils";

export function calculateSize(st: STNode): DiagramSize {
    return {
        height: 1000,
        width: 1000
    }
}

export function sizingAndPositioning(st: STNode): STNode {
    traversNode(st, initVisitor);
    traversNode(st, sizingVisitor);
    traversNode(st, positionVisitor);
    positionVisitor.cleanMaps();
    if (STKindChecker.isFunctionDefinition(st) && st?.viewState?.onFail) {
        const viewState = st.viewState as FunctionViewState;
        traversNode(viewState.onFail, sizingVisitor);
        traversNode(viewState.onFail, positionVisitor);
    }
    const clone = { ...st };
    return clone;
}

export function recalculateSizingAndPositioning(st: STNode): STNode {
    traversNode(st, sizingVisitor);
    traversNode(st, positionVisitor);
    positionVisitor.cleanMaps();
    if (STKindChecker.isFunctionDefinition(st) && st?.viewState?.onFail) {
        const viewState = st.viewState as FunctionViewState;
        traversNode(viewState.onFail, sizingVisitor);
        traversNode(viewState.onFail, positionVisitor);
    }
    const clone = { ...st };
    return clone;
}

export function getOverlayFormConfig(
    type: string,
    targetPosition: NodePosition,
    wizardType: WizardType,
    blockViewState?: BlockViewState,
    config?: ConditionConfig,
    symbolInfo?: STSymbolInfo,
    model?: STNode
): Partial<ConfigOverlayFormStatus> {
    let scopeSymbols: string[] = []

    if (symbolInfo) {
        if (type === "If") {
            scopeSymbols = [...getVaribaleNamesFromVariableDefList(symbolInfo.variables.get("boolean"))];
        } else if (type === "ForEach") {
            scopeSymbols = [...getVaribaleNamesFromVariableDefList(symbolInfo.variables.get("map")),
            ...getVaribaleNamesFromVariableDefList(symbolInfo.variables.get("array"))];
        } else if (type === "Log" || type === "Return") {
            scopeSymbols = [...getVaribaleNamesFromVariableDefList(symbolInfo.variables.get("map")),
            ...getVaribaleNamesFromVariableDefList(symbolInfo.variables.get("array")),
            ...getVaribaleNamesFromVariableDefList(symbolInfo.variables.get("boolean")),
            ...getVaribaleNamesFromVariableDefList(symbolInfo.variables.get("int")),
            ...getVaribaleNamesFromVariableDefList(symbolInfo.variables.get("float")),
            ...getVaribaleNamesFromVariableDefList(symbolInfo.variables.get("var")),
            ...getVaribaleNamesFromVariableDefList(symbolInfo.variables.get("string"))
            ];
        } else if (type === "Respond") {
            scopeSymbols = [...getVaribaleNamesFromVariableDefList(symbolInfo.variables.get("string")),
            ...getVaribaleNamesFromVariableDefList(symbolInfo.variables.get("http:Response")),
            ...getVaribaleNamesFromVariableDefList(symbolInfo.variables.get("var"))
            ];
        }
        if (config && scopeSymbols) {
            config.scopeSymbols = scopeSymbols
        }
    }

    const configOverlayFormStatus: Partial<ConfigOverlayFormStatus> = {
        formType: type,
        formArgs: {
            type,
            targetPosition,
            wizardType,
            config,
            scopeSymbols
        },
        blockViewState,
    };
    if (wizardType === WizardType.EXISTING) {
        configOverlayFormStatus.formArgs = { ...configOverlayFormStatus.formArgs, model }
    }

    return configOverlayFormStatus;
}

export function getConditionConfig(
    type: string,
    targetPosition: NodePosition,
    wizardType: WizardType,
    blockViewState?: BlockViewState,
    config?: ConditionConfig,
    symbolInfo?: STSymbolInfo,
    model?: STNode
): Partial<ConfigOverlayFormStatus> {
    let scopeSymbols: string[] = [];

    if (symbolInfo) {
        if (type === "If") {
            scopeSymbols = [...getVaribaleNamesFromVariableDefList(symbolInfo.variables.get("boolean"))];
        } else if (type === "ForEach") {
            scopeSymbols = [...getVaribaleNamesFromVariableDefList(symbolInfo.variables.get("map")),
            ...getVaribaleNamesFromVariableDefList(symbolInfo.variables.get("array"))];
        } else if (type === "Log" || type === "Return") {
            scopeSymbols = [...getVaribaleNamesFromVariableDefList(symbolInfo.variables.get("map")),
            ...getVaribaleNamesFromVariableDefList(symbolInfo.variables.get("array")),
            ...getVaribaleNamesFromVariableDefList(symbolInfo.variables.get("boolean")),
            ...getVaribaleNamesFromVariableDefList(symbolInfo.variables.get("int")),
            ...getVaribaleNamesFromVariableDefList(symbolInfo.variables.get("float")),
            ...getVaribaleNamesFromVariableDefList(symbolInfo.variables.get("var")),
            ...getVaribaleNamesFromVariableDefList(symbolInfo.variables.get("string"))
            ];
        } else if (type === "Respond") {
            scopeSymbols = [...getVaribaleNamesFromVariableDefList(symbolInfo.variables.get("string")),
            ...getVaribaleNamesFromVariableDefList(symbolInfo.variables.get("http:Response")),
            ...getVaribaleNamesFromVariableDefList(symbolInfo.variables.get("var"))
            ];
        } else if (type === "While") {
            scopeSymbols = [...getVaribaleNamesFromVariableDefList(symbolInfo.variables.get("boolean"))];
        }
        if (config && scopeSymbols) {
            config.scopeSymbols = scopeSymbols
        }
    }

    const configPanelStatus: Partial<ConfigPanelStatus> = {
        formType: type,
        formArgs: {
            type,
            targetPosition,
            wizardType,
            config,
            scopeSymbols
        },
        blockViewState,
    };

    if (wizardType === WizardType.EXISTING) {
        return {
            ...configPanelStatus,
            formArgs: {
                ...configPanelStatus.formArgs,
                model
            }
        }
    }

    return configPanelStatus;
}

export function getRandomInt(max: number) {
    return Math.floor(Math.random() * Math.floor(max));
}

export function isVarTypeDescriptor(model: STNode): boolean {
    if (model && STKindChecker.isLocalVarDecl(model)) {
        return STKindChecker.isVarTypeDesc(model.typedBindingPattern?.typeDescriptor);
    } else {
        return false;
    }
}

