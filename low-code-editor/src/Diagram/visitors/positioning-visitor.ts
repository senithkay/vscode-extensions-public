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
import { BlockStatement, ForeachStatement, FunctionBodyBlock, FunctionDefinition, IfElseStatement, ModulePart, VisibleEndpoint, Visitor } from "@ballerina/syntax-tree";

import { BIGPLUS_SVG_WIDTH } from "../components/Plus/Initial";
import { PLUS_SVG_HEIGHT } from "../components/Plus/PlusAndCollapse/PlusSVG";
import { PLUS_HOLDER_API_HEIGHT, PLUS_HOLDER_STATEMENT_HEIGHT } from "../components/Portals/Overlay/Elements/PlusHolder/PlusElements";
import { START_SVG_SHADOW_OFFSET } from "../components/Start/StartSVG";
import { TRIGGER_PARAMS_SVG_HEIGHT } from "../components/TriggerParams/TriggerParamsSVG";
import { Endpoint, getMaXWidthOfConnectors, getPlusViewState, updateConnectorCX } from "../utils/st-util";
import {
    BlockViewState,
    CompilationUnitViewState, ElseViewState, EndpointViewState,
    ForEachViewState,
    FunctionViewState, IfViewState,
    PlusViewState,
    StatementViewState
} from "../view-state";

import { DefaultConfig } from "./default";

let allEndpoints: Map<string, Endpoint> = new Map<string, Endpoint>();
let epCount: number = 0;
class PositioningVisitor implements Visitor {

    public beginVisitModulePart(node: ModulePart) {
        // replaces beginVisitCompilationUnit
        const viewState: CompilationUnitViewState = node.viewState;
        if (node.members.length <= 0) {
            viewState.trigger.cx = DefaultConfig.canvas.paddingX;
            viewState.trigger.cy = DefaultConfig.startingY + DefaultConfig.canvas.paddingY;
            const plusBtnViewState: PlusViewState = new PlusViewState();
            plusBtnViewState.bBox.cx = viewState.trigger.cx;
            plusBtnViewState.bBox.cy = viewState.trigger.cy + (viewState.trigger.h / 2);
            plusBtnViewState.expanded = false;
            viewState.initPlus = plusBtnViewState;
        }
    }

    public beginVisitFunctionDefinition(node: FunctionDefinition) {
        if (!node.functionBody) {
            return;
        }
        const viewState: FunctionViewState = node.viewState;
        const bodyViewState: BlockViewState = node.functionBody.viewState;

        viewState.trigger.cx = DefaultConfig.canvas.paddingX;
        viewState.trigger.cy = DefaultConfig.startingY + DefaultConfig.canvas.paddingY;

        viewState.triggerParams.bBox.cx = viewState.trigger.cx;
        viewState.triggerParams.bBox.cy = viewState.trigger.cy + (DefaultConfig.dotGap / 2);

        viewState.workerLine.x = viewState.trigger.cx;
        viewState.workerLine.y = viewState.trigger.cy + (viewState.trigger.h / 2);

        bodyViewState.bBox.cx = viewState.workerLine.x;
        // todo
        // if () {
        //     bodyViewState.bBox.cy = viewState.workerLine.y + viewState.trigger.offsetFromBottom + TRIGGER_PARAMS_SVG_HEIGHT + DefaultConfig.dotGap;
        // }
        bodyViewState.bBox.cy = viewState.workerLine.y + viewState.trigger.offsetFromBottom + TRIGGER_PARAMS_SVG_HEIGHT + DefaultConfig.dotGap;
        // bodyViewState.bBox.cy = viewState.workerLine.y + viewState.trigger.offsetFromBottom;

        viewState.end.bBox.cx = DefaultConfig.canvas.paddingX;
        viewState.end.bBox.cy = DefaultConfig.startingY + viewState.workerLine.h + DefaultConfig.canvas.paddingY;
    }

    public endVisitFunctionDefinition(node: FunctionDefinition) {
        const viewState: FunctionViewState = node.viewState;
        const bodyViewState: BlockViewState = node.functionBody.viewState;
        const body: FunctionBodyBlock = node.functionBody as FunctionBodyBlock;
        viewState.workerBody = bodyViewState;
        viewState.end.bBox.cy = viewState.workerLine.h + viewState.workerLine.y;
        viewState.bBox.h = viewState.workerLine.h + viewState.workerLine.y + viewState.end.bBox.h + DefaultConfig.canvasBottomOffset;

        // If body has no statements and doesn't have a end component
        // Add the plus button to show up on the start end
        if (!bodyViewState.isEndComponentAvailable && body.statements.length <= 0) {
            const plusBtnViewState: PlusViewState = viewState.initPlus;
            if (bodyViewState.draft === undefined && plusBtnViewState) {
                plusBtnViewState.bBox.cx = viewState.trigger.cx - (BIGPLUS_SVG_WIDTH / 2);
                // todo
                // if (viewState.triggerParams.visible) {
                // }
                plusBtnViewState.bBox.cy = viewState.trigger.cy + (viewState.trigger.h / 2) + viewState.trigger.offsetFromBottom + (START_SVG_SHADOW_OFFSET / 4) + TRIGGER_PARAMS_SVG_HEIGHT + (DefaultConfig.dotGap / 2);

                // plusBtnViewState.bBox.cy = viewState.trigger.cy + (viewState.trigger.h / 2) + viewState.trigger.offsetFromBottom + (START_SVG_SHADOW_OFFSET / 4);
            }
        }

        updateConnectorCX(bodyViewState.bBox.w / 2, bodyViewState.bBox.cx, allEndpoints);
        // Add the connector max width to the diagram width.
        viewState.bBox.w = viewState.bBox.w + getMaXWidthOfConnectors(allEndpoints);
    }

    public beginVisitFunctionBodyBlock(node: FunctionBodyBlock) {
        const blockViewState: BlockViewState = node.viewState;
        allEndpoints = blockViewState.connectors;
        epCount = 0;
        this.beginVisitBlockStatement(node);
    }

    public beginVisitBlockStatement(node: BlockStatement) {
        const blockViewState: BlockViewState = node.viewState;
        let height = 0;
        let index = 0;
        const epGap = DefaultConfig.epGap;
        node.statements.forEach((statement) => {
            const statementViewState: StatementViewState = statement.viewState;
            statementViewState.bBox.cx = blockViewState.bBox.cx;
            statementViewState.bBox.cy = blockViewState.bBox.cy + statementViewState.bBox.offsetFromTop + height;

            const plusForIndex: PlusViewState = getPlusViewState(index, blockViewState.plusButtons);

            if (blockViewState.draft && blockViewState.draft[0] === index) {
                const draft = blockViewState.draft[1];
                if (draft) {
                    draft.bBox.cx = statementViewState.bBox.cx;
                    draft.bBox.cy = statementViewState.bBox.cy;
                    statementViewState.bBox.cy += draft.bBox.h;
                    height += draft.bBox.h;
                }
            }

            if (blockViewState.collapsedFrom === index && blockViewState.collapseView) {
                blockViewState.collapseView.bBox.cx = statementViewState.bBox.cx;
                blockViewState.collapseView.bBox.cy = statementViewState.bBox.cy;
                height += blockViewState.collapseView.bBox.h;
                if (plusForIndex?.collapsedPlusDuoExpanded && !plusForIndex.collapsedClicked) {
                    blockViewState.collapseView.bBox.cy += PLUS_SVG_HEIGHT;
                } else if (plusForIndex?.expanded && !plusForIndex.collapsedClicked) {
                    // blockViewState.collapseView.bBox.cy += PLUS_HOLDER_DEFAULT_HEIGHT;
                    if (plusForIndex.selectedComponent === "STATEMENT") {
                        statementViewState.bBox.cy += PLUS_HOLDER_STATEMENT_HEIGHT;
                    } else if (plusForIndex.selectedComponent === "APIS") {
                        statementViewState.bBox.cy += PLUS_HOLDER_API_HEIGHT;
                    }

                    if (statementViewState.collapsed) {
                        blockViewState.collapseView.bBox.cy = statementViewState.bBox.cy;
                    }
                } else {
                    // updating cy of plus since it get ignored once the collapsed statement is reached
                    plusForIndex.bBox.cy = blockViewState.collapseView.bBox.cy - blockViewState.collapseView.bBox.offsetFromTop;
                }
                plusForIndex.bBox.cx = blockViewState.bBox.cx;
            } else {
                if (plusForIndex && plusForIndex.expanded) {
                    plusForIndex.bBox.cx = blockViewState.bBox.cx;
                    // statementViewState.bBox.cy += PLUS_HOLDER_DEFAULT_HEIGHT;
                    if (plusForIndex.selectedComponent === "STATEMENT") {
                        statementViewState.bBox.cy += PLUS_HOLDER_STATEMENT_HEIGHT;
                        height += PLUS_HOLDER_STATEMENT_HEIGHT;
                    } else if (plusForIndex.selectedComponent === "APIS") {
                        statementViewState.bBox.cy += PLUS_HOLDER_API_HEIGHT;
                        height += PLUS_HOLDER_API_HEIGHT;
                    }
                } else if (plusForIndex && plusForIndex.collapsedPlusDuoExpanded) {
                    plusForIndex.bBox.cx = blockViewState.bBox.cx;
                    statementViewState.bBox.cy += PLUS_SVG_HEIGHT;
                    height += PLUS_SVG_HEIGHT;
                } else if (plusForIndex) {
                    plusForIndex.bBox.cy = statementViewState.bBox.cy - statementViewState.bBox.offsetFromTop;
                    plusForIndex.bBox.cx = blockViewState.bBox.cx;
                }

                // statementViewState.collapsed is to check for collapsed action invocations and
                // ignore if it is collapsed
                if (statementViewState.isAction && statementViewState.action.endpointName
                    && !statementViewState.isCallerAction && !statementViewState.collapsed &&
                    !statementViewState.hidden) {
                    // action invocation for a connector ( var result1 = ep1->get("/context") )
                    const endpoint: Endpoint = allEndpoints.get(statementViewState.action.endpointName);
                    const visibleEndpoint: VisibleEndpoint = endpoint.visibleEndpoint as VisibleEndpoint;
                    const mainEp: EndpointViewState = visibleEndpoint.viewState;

                    // Set action trigger box cx point to match life line cx
                    // Set action trigger box cy point to match action invocation statement cy
                    statementViewState.action.trigger.cx = mainEp.lifeLine.cx;
                    statementViewState.action.trigger.cy = statementViewState.bBox.cy;

                    // to check whether the action is invoked for the first time
                    if (!mainEp.isUsed) {
                        endpoint.firstAction = statementViewState;
                        mainEp.isUsed = true;
                        mainEp.lifeLine.cy = statementViewState.bBox.cy;
                        mainEp.lifeLine.h = statementViewState.action.trigger.cy - mainEp.lifeLine.cy;
                    } else if (mainEp.lifeLine.cy > statementViewState.bBox.cy) {
                        // To catch the endpoints define at the function block and used after a child block
                        mainEp.lifeLine.h = mainEp.lifeLine.cy - statementViewState.bBox.cy;
                        mainEp.lifeLine.cy = statementViewState.bBox.cy;
                    } else if ((mainEp.lifeLine.h + mainEp.lifeLine.cy) < (statementViewState.action.trigger.cy)) {
                        // to skip updating EP heights which less than the current EP height
                        mainEp.lifeLine.h = statementViewState.action.trigger.cy - mainEp.lifeLine.cy;
                    }

                    // Add actions to the corresponding map item.
                    endpoint.actions.push(statementViewState);
                }

                if (statementViewState.isEndpoint && statementViewState.endpoint.epName) {
                    const endpointViewState: EndpointViewState = statementViewState.endpoint;
                    // to identify a connector init ( http:Client ep1 = new ("/context") )
                    endpointViewState.lifeLine.cx = blockViewState.bBox.cx +
                        (endpointViewState.bBox.w / 2) + epGap + (epGap * epCount);
                    const endpoint: Endpoint = allEndpoints.get(statementViewState.endpoint.epName);
                    const visibleEndpoint: VisibleEndpoint = endpoint.visibleEndpoint;
                    const mainEp = endpointViewState;
                    visibleEndpoint.viewState = mainEp;
                    epCount++;
                }

                if ((statementViewState.isEndpoint && statementViewState.isAction && !statementViewState.hidden)
                    || (!statementViewState.isEndpoint && !statementViewState.collapsed)) {
                    height += statementViewState.bBox.h;
                }
            }

            ++index;
        });

        // Get the last plus view state
        const plusViewState: PlusViewState = getPlusViewState(node.statements.length, blockViewState.plusButtons);

        if (blockViewState.draft && blockViewState.draft[0] === node.statements.length) {
            const draft = blockViewState.draft[1];
            if (draft) {
                draft.bBox.cx = blockViewState.bBox.cx;
                draft.bBox.cy = (blockViewState.bBox.cy + blockViewState.bBox.offsetFromTop + height);
                height += draft.bBox.h;
            }
        }

        if (plusViewState && plusViewState.expanded) {
            plusViewState.bBox.cx = blockViewState.bBox.cx;
        } else if (plusViewState && plusViewState.collapsedPlusDuoExpanded) {
            plusViewState.bBox.cx = blockViewState.bBox.cx;
            plusViewState.collapsedPlusDuoExpanded = false;
        } else if (plusViewState) {
            plusViewState.bBox.cy = blockViewState.bBox.cy + blockViewState.bBox.h;
            plusViewState.bBox.cx = blockViewState.bBox.cx;
        }
    }

    public beginVisitForeachStatement(node: ForeachStatement) {
        const bodyViewState: BlockViewState = node.blockStatement.viewState;
        const viewState: ForEachViewState = node.viewState;
        viewState.foreachBody = bodyViewState;

        viewState.foreachHead.cx = viewState.bBox.cx;
        viewState.foreachHead.cy = viewState.bBox.cy + (viewState.foreachHead.h / 2);

        viewState.foreachLifeLine.cx = viewState.bBox.cx;
        viewState.foreachLifeLine.cy = viewState.foreachHead.cy + (viewState.foreachHead.h / 2);

        viewState.foreachBody.bBox.cx = viewState.foreachHead.cx;
        viewState.foreachBody.bBox.cy = viewState.foreachHead.cy + (viewState.foreachHead.h / 2) + viewState.foreachHead.offsetFromBottom;

        viewState.foreachBodyRect.cx = viewState.foreachHead.cx;
        viewState.foreachBodyRect.cy = viewState.foreachHead.cy;
    }

    public beginVisitIfElseStatement(node: IfElseStatement) {
        const viewState: IfViewState = node.viewState as IfViewState;
        const ifBodyViewState: BlockViewState = node.ifBody.viewState as BlockViewState;

        viewState.headIf.cx = viewState.bBox.cx;
        viewState.headIf.cy = viewState.bBox.cy + (viewState.headIf.h / 2);

        ifBodyViewState.bBox.cx = viewState.bBox.cx;
        ifBodyViewState.bBox.cy = viewState.headIf.cy + (viewState.headIf.h / 2) + viewState.headIf.offsetFromBottom;

        if (node.elseBody) {
            if (node.elseBody.elseBody.kind === "BlockStatement") {
                const elseViewStatement: ElseViewState = node.elseBody.elseBody.viewState as ElseViewState;

                elseViewStatement.elseTopHorizontalLine.x = viewState.bBox.cx + elseViewStatement.ifHeadWidthOffset;
                elseViewStatement.elseTopHorizontalLine.y = viewState.bBox.cy + elseViewStatement.ifHeadHeightOffset;

                elseViewStatement.bBox.cx = elseViewStatement.elseTopHorizontalLine.x +
                    elseViewStatement.elseTopHorizontalLine.length;
                elseViewStatement.bBox.cy = ifBodyViewState.bBox.cy;

                elseViewStatement.elseBody.x = elseViewStatement.bBox.cx;
                elseViewStatement.elseBody.y = elseViewStatement.elseTopHorizontalLine.y;

                elseViewStatement.elseBottomHorizontalLine.x = viewState.bBox.cx;
                elseViewStatement.elseBottomHorizontalLine.y = elseViewStatement.elseBody.y +
                    elseViewStatement.elseBody.length;
            } else if (node.elseBody.elseBody.kind === "IfElseStatement") {
                const elseIfStmt: IfElseStatement = node.elseBody.elseBody as IfElseStatement;
                const elseIfViewState: IfViewState = elseIfStmt.viewState;

                elseIfViewState.elseIfTopHorizontalLine.x = viewState.bBox.cx + elseIfViewState.elseIfHeadWidthOffset;
                elseIfViewState.elseIfTopHorizontalLine.y = viewState.bBox.cy + elseIfViewState.elseIfHeadHeightOffset;

                elseIfViewState.bBox.cx = elseIfViewState.elseIfTopHorizontalLine.x
                    + elseIfViewState.elseIfTopHorizontalLine.length + (elseIfViewState.headIf.w / 2);
                elseIfViewState.bBox.cy = viewState.bBox.cy;

                elseIfViewState.elseIfLifeLine.x = elseIfViewState.bBox.cx;
                elseIfViewState.elseIfLifeLine.y = elseIfViewState.bBox.cy + elseIfViewState.headIf.h;

                elseIfViewState.elseIfBottomHorizontalLine.x = viewState.bBox.cx;
                elseIfViewState.elseIfBottomHorizontalLine.y = viewState.bBox.cy + elseIfViewState.elseIfLifeLine.h +
                    elseIfViewState.headIf.h;
            }
        } else {
            const defaultElseVS: ElseViewState = viewState.defaultElseVS;

            defaultElseVS.elseTopHorizontalLine.x = viewState.bBox.cx + defaultElseVS.ifHeadWidthOffset;
            defaultElseVS.elseTopHorizontalLine.y = viewState.bBox.cy + defaultElseVS.ifHeadHeightOffset;

            defaultElseVS.bBox.cx = defaultElseVS.elseTopHorizontalLine.x +
                defaultElseVS.elseTopHorizontalLine.length;
            defaultElseVS.bBox.cy = ifBodyViewState.bBox.cy;

            defaultElseVS.elseBody.x = defaultElseVS.bBox.cx;
            defaultElseVS.elseBody.y = defaultElseVS.elseTopHorizontalLine.y;

            defaultElseVS.elseBottomHorizontalLine.x = viewState.bBox.cx;
            defaultElseVS.elseBottomHorizontalLine.y = defaultElseVS.elseBody.y +
                defaultElseVS.elseBody.length;

            // This is to check a else-if else and add else curve offset.
            if (viewState.childElseViewState) {
                defaultElseVS.elseBottomHorizontalLine.y += DefaultConfig.elseCurveYOffset;
            }
        }
    }

}

export const visitor = new PositioningVisitor();
