import { RemoteMethodCallAction, STNode, traversNode, VisibleEndpoint } from "@wso2-enterprise/syntax-tree";

import { CLIENT_SVG_HEIGHT, CLIENT_SVG_WIDTH } from "../Components/RenderingComponents/Connector/ConnectorHeader/ConnectorClientSVG";
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
                case "DataMapper":
                    h = PROCESS_SVG_HEIGHT;
                    w = PROCESS_SVG_WIDTH;
                    break;
                case "Variable":
                    h = PROCESS_SVG_HEIGHT;
                    w = PROCESS_SVG_WIDTH;
                    break;
                case "AssignmentStatement":
                    h = PROCESS_SVG_HEIGHT;
                    w = PROCESS_SVG_WIDTH;
                    break;
                case "Custom":
                    h = PROCESS_SVG_HEIGHT;
                    w = PROCESS_SVG_WIDTH;
                    break;
                case "HTTP":
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
