
import { STNode, traversNode } from "@ballerina/syntax-tree";

import { WizardType } from "../../ConfigurationSpec/types";
import { ConfigOverlayFormStatus, ConfigPanelStatus, DiagramSize, STSymbolInfo } from "../../Definitions";
import { ConditionConfig } from "../components/Portals/ConfigForm/types";
import { getVaribaleNamesFromVariableDefList } from "../components/Portals/utils";
import { BlockViewState } from "../view-state";
import { DraftInsertPosition } from "../view-state/draft";
import { visitor as initVisitor } from "../visitors/init-visitor";
import { visitor as positionVisitor } from "../visitors/positioning-visitor";
import { visitor as sizingVisitor } from "../visitors/sizing-visitor";

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
    const clone = { ...st };
    return clone;
}

export function recalculateSizingAndPositioning(st: STNode): STNode {
    traversNode(st, sizingVisitor);
    traversNode(st, positionVisitor);
    const clone = { ...st };
    return clone;
}

export function getOverlayFormConfig(
    type: string,
    targetPosition: DraftInsertPosition,
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
    targetPosition: DraftInsertPosition,
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
