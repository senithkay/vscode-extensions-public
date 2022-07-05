import { RemoteMethodCallAction, STKindChecker, STNode, traversNode, VisibleEndpoint } from "@wso2-enterprise/syntax-tree";

import { CLIENT_SVG_HEIGHT, CLIENT_SVG_WIDTH } from "../Components/RenderingComponents/Connector/ConnectorHeader/ConnectorClientSVG";
import { CONNECTOR_PROCESS_SVG_HEIGHT } from "../Components/RenderingComponents/Connector/ConnectorProcess/ConnectorProcessSVG";
import { IFELSE_SVG_HEIGHT, IFELSE_SVG_WIDTH } from "../Components/RenderingComponents/IfElse/IfElseSVG";
import { PROCESS_SVG_HEIGHT, PROCESS_SVG_WIDTH } from "../Components/RenderingComponents/Processor/ProcessSVG";
import { RESPOND_SVG_HEIGHT, RESPOND_SVG_WIDTH } from "../Components/RenderingComponents/Respond/RespondSVG";
import { Endpoint } from "../Types/type";
import { EndpointViewState, PlusViewState, StatementViewState } from "../ViewState";

import { ActionInvocationFinder } from "./action-invocation-finder";
import { BlockStatementFinder } from "./block-statement-finder";
import { DefaultConfig } from "./default";

export function isSTActionInvocation(node: STNode): RemoteMethodCallAction {
    const actionFinder: ActionInvocationFinder = new ActionInvocationFinder();
    traversNode(node, actionFinder);
    return actionFinder.getIsAction();
}

export function isEndpointNode(node: STNode): boolean {
    if (node?.typeData?.isEndpoint) {
        return true;
    }
    // Check union type endpoints
    if (node && (STKindChecker.isLocalVarDecl(node) || STKindChecker.isModuleVarDecl(node))
        && node.typedBindingPattern?.typeDescriptor && STKindChecker.isUnionTypeDesc(node.typedBindingPattern.typeDescriptor)) {
        const unionNode = node.typedBindingPattern.typeDescriptor;
        if (isEndpointNode(unionNode.leftTypeDesc)) {
            return true;
        }
        if (isEndpointNode(unionNode.rightTypeDesc)) {
            return true;
        }
    }
    return false;
}

export function haveBlockStatement(node: STNode): boolean {
    const blockStatementFinder: BlockStatementFinder = new BlockStatementFinder();
    traversNode(node, blockStatementFinder);
    return blockStatementFinder.getHaveBlockStatement();
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

export function updateConnectorCX(maxContainerRightWidth: number, containerCX: number, allEndpoints: Map<string, Endpoint>, startCY?: number, haveParent?: boolean) {
    const containerRightMostConerCX = maxContainerRightWidth + containerCX;
    let prevX = 0;
    let foundFirst: boolean = false;

    allEndpoints.forEach((value: Endpoint, key: string) => {
        const visibleEndpoint: VisibleEndpoint = value.visibleEndpoint;
        const mainEp: EndpointViewState = visibleEndpoint.viewState;
        mainEp.collapsed = value.firstAction?.collapsed;

        if (haveParent || !value.isExpandedPoint) {
            if (!foundFirst) {
                if (mainEp.lifeLine.cx <= containerRightMostConerCX) {
                    mainEp.lifeLine.cx = containerRightMostConerCX + (mainEp.bBox.w / 2) + DefaultConfig.epGap;
                } else if (mainEp.lifeLine.cx > containerRightMostConerCX) {
                    const diff = mainEp.lifeLine.cx - containerRightMostConerCX;
                    if (diff < DefaultConfig.epGap) {
                        mainEp.lifeLine.cx = mainEp.lifeLine.cx + (mainEp.bBox.w / 2) + (DefaultConfig.epGap - diff);
                    }
                }
                foundFirst = true;
            } else {
                mainEp.lifeLine.cx = prevX + (mainEp.bBox.w / 2) + DefaultConfig.epGap;
            }

            prevX = mainEp.lifeLine.cx;

            if (mainEp.isExternal) { // Render external endpoints align with the start element
                mainEp.lifeLine.h += mainEp.lifeLine.cy - (startCY + (CONNECTOR_PROCESS_SVG_HEIGHT / 2));
                mainEp.lifeLine.cy = startCY + (CONNECTOR_PROCESS_SVG_HEIGHT / 2);
            }
            
            updateActionTriggerCx(mainEp.lifeLine.cx, value.actions, value.isExpandedPoint);
        }
    });
}

export function updateActionTriggerCx(connectorCX: number, actions: StatementViewState[], isExpanded: boolean) {
    actions.forEach((action) => {
        const offset = isExpanded && action.expandOffSet > 0 ? action.expandOffSet  + 170 + 11 + 50 + 24 : 0;
        action.action.trigger.cx = connectorCX - offset;
    });
}

export function getDraftComponentSizes(type: string, subType: string): { h: number, w: number } {
    let h: number = 0;
    let w: number = 0;

    switch (type) {
        case "APIS":
            h = CLIENT_SVG_HEIGHT;
            w = DefaultConfig.defaultBlockWidth;
            break;
        case "STATEMENT":
            switch (subType) {
                case "If":
                case "ForEach":
                case "While":
                    h = IFELSE_SVG_HEIGHT;
                    w = DefaultConfig.defaultBlockWidth;
                    break;
                case "Log":
                    h = PROCESS_SVG_HEIGHT;
                    w = DefaultConfig.defaultBlockWidth;
                    break;
                case "Worker":
                    h = PROCESS_SVG_HEIGHT;
                    w = DefaultConfig.defaultBlockWidth;
                    break;
                case "Variable":
                    h = PROCESS_SVG_HEIGHT;
                    w = DefaultConfig.defaultBlockWidth;
                    break;
                case "AssignmentStatement":
                    h = PROCESS_SVG_HEIGHT;
                    w = DefaultConfig.defaultBlockWidth;
                    break;
                case "Custom":
                    h = PROCESS_SVG_HEIGHT;
                    w = DefaultConfig.defaultBlockWidth;
                    break;
                case "HTTP":
                    h = PROCESS_SVG_HEIGHT;
                    w = DefaultConfig.defaultBlockWidth;
                    break;
                case "Respond":
                    h = RESPOND_SVG_HEIGHT;
                    w = DefaultConfig.defaultBlockWidth;
                    break;
                case "Return":
                    h = RESPOND_SVG_HEIGHT;
                    w = DefaultConfig.defaultBlockWidth;
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
