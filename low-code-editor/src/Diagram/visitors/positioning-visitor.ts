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
import {
    BlockStatement,
    DoStatement,
    ExpressionFunctionBody,
    ForeachStatement,
    FunctionBodyBlock,
    FunctionDefinition,
    IfElseStatement,
    ModulePart,
    ObjectMethodDefinition,
    OnFailClause,
    ResourceAccessorDefinition,
    ServiceDeclaration,
    STKindChecker, STNode,
    VisibleEndpoint,
    Visitor,
    WhileStatement
} from "@ballerina/syntax-tree";

import { EXECUTION_TIME_DEFAULT_X_OFFSET, EXECUTION_TIME_IF_X_OFFSET } from "../components/ControlFlowExecutionTime";
import { BOTTOM_CURVE_SVG_WIDTH } from "../components/IfElse/Else/BottomCurve";
import { TOP_CURVE_SVG_HEIGHT } from "../components/IfElse/Else/TopCurve";
import { BIGPLUS_SVG_WIDTH } from "../components/Plus/Initial";
import { PLUS_SVG_HEIGHT } from "../components/Plus/PlusAndCollapse/PlusSVG";
import { EXISTING_PLUS_HOLDER_API_HEIGHT, EXISTING_PLUS_HOLDER_API_HEIGHT_COLLAPSED, PLUS_HOLDER_API_HEIGHT, PLUS_HOLDER_API_HEIGHT_COLLAPSED, PLUS_HOLDER_STATEMENT_HEIGHT } from "../components/Portals/Overlay/Elements/PlusHolder/PlusElements";
import { START_SVG_SHADOW_OFFSET } from "../components/Start/StartSVG";
import { TRIGGER_PARAMS_SVG_HEIGHT } from "../components/TriggerParams/TriggerParamsSVG";
import { Endpoint, getPlusViewState, updateConnectorCX } from "../utils/st-util";
import {
    BlockViewState,
    CompilationUnitViewState,
    ControlFlowExecutionTimeState,
    ControlFlowLineState,
    DoViewState,
    ElseViewState,
    EndpointViewState,
    ForEachViewState,
    FunctionViewState,
    IfViewState,
    OnErrorViewState,
    PlusViewState,
    SimpleBBox,
    StatementViewState,
    WhileViewState
} from "../view-state";

import { DefaultConfig } from "./default";

let allEndpoints: Map<string, Endpoint> = new Map<string, Endpoint>();
let epCount: number = 0;
class PositioningVisitor implements Visitor {

    public beginVisitModulePart(node: ModulePart) {
        // replaces beginVisitCompilationUnit
        const viewState: CompilationUnitViewState = node.viewState;
        if (node.members.length === 0) {
            viewState.trigger.cx = viewState.bBox.cx + DefaultConfig.epGap / 2;
            viewState.trigger.cy = DefaultConfig.epGap / 2;
            const plusBtnViewState: PlusViewState = new PlusViewState();
            plusBtnViewState.bBox.cx = viewState.trigger.cx;
            plusBtnViewState.bBox.cy = viewState.trigger.cy;
            plusBtnViewState.expanded = false;
            viewState.initPlus = plusBtnViewState; // todo: make it an appropriate value
        } else {
            // let height = GAP_BETWEEN_MEMBERS; // adding initial plus height
            // let prevMemberViewState: ViewState = null;
            // // Clean rendered labels
            // node.members.forEach((member: STNode, i: number) => {
            //     const memberVS = member.viewState;

            //     if (memberVS) {
            //         memberVS.bBox.x = viewState.bBox.x + DefaultConfig.horizontalGapBetweenComponents;
            //         memberVS.bBox.y = viewState.bBox.y + height;
            //         // adding the height of the sub component
            //         height += memberVS.bBox.h;
            //     }

            //     if (i !== node.members.length - 1) {
            //         height += GAP_BETWEEN_MEMBERS;
            //     }

            //     // calculating plus button positions
            //     const plusViewState: PlusViewState = getPlusViewState(i, viewState.plusButtons);
            //     if (plusViewState) {
            //         plusViewState.bBox.cx = memberVS.bBox.x;
            //         if (i === 0) {
            //             plusViewState.bBox.cy = viewState.bBox.y + (GAP_BETWEEN_MEMBERS / 2);
            //         } else {
            //             const prevComponentEndY = prevMemberViewState.bBox.y + prevMemberViewState.bBox.h;
            //             plusViewState.bBox.cy = prevComponentEndY + (GAP_BETWEEN_MEMBERS / 2);
            //         }
            //         prevMemberViewState = memberVS;
            //     }
            // });

            // const lastPlusViewState: PlusViewState = getPlusViewState(node.members.length, viewState.plusButtons);
            // if (node.members.length > 0) {
            //     const prevComponentEndY = prevMemberViewState.bBox.y + prevMemberViewState.bBox.h;
            //     lastPlusViewState.bBox.cx = prevMemberViewState.bBox.x;
            //     lastPlusViewState.bBox.cy = prevComponentEndY + (GAP_BETWEEN_MEMBERS / 2);
            // } else {
            //     // initial plus position
            //     lastPlusViewState.bBox.cx = viewState.bBox.x + DefaultConfig.horizontalGapBetweenParentComponents;
            //     lastPlusViewState.bBox.cy = viewState.bBox.y + height + (GAP_BETWEEN_MEMBERS / 2);
            // }
        }
    }

    private beginFunctionTypeNode(node: ResourceAccessorDefinition | FunctionDefinition) {
        if (!node.functionBody) {
            return;
        }
        const viewState: FunctionViewState = node.viewState;
        const bodyViewState: BlockViewState = node.functionBody.viewState;

        viewState.wrapper.cx = viewState.bBox.x;
        viewState.wrapper.cy = viewState.bBox.y;

        const topOffSet = viewState.bBox.offsetFromTop * 7;
        viewState.bBox.cx = viewState.bBox.x + (viewState.bBox.w / 2);
        viewState.bBox.cy = viewState.bBox.y + topOffSet;

        viewState.trigger.cx = viewState.bBox.cx;
        viewState.trigger.cy = viewState.bBox.cy;

        if (viewState.triggerParams) {
            viewState.triggerParams.bBox.cx = viewState.trigger.cx;
            viewState.triggerParams.bBox.cy = viewState.trigger.cy + (DefaultConfig.dotGap / 2);
        }

        viewState.workerLine.x = viewState.trigger.cx;
        viewState.workerLine.y = viewState.trigger.cy + (viewState.trigger.h / 2);

        bodyViewState.bBox.cx = viewState.workerLine.x;
        // bodyViewState.bBox.cy = viewState.workerLine.y + viewState.trigger.offsetFromBottom;

        if (viewState.triggerParams) {
            node?.functionSignature?.parameters?.length > 0 ?
                viewState.triggerParams.visible = true : viewState.triggerParams.visible = false
            viewState.triggerParams.visible ? bodyViewState.bBox.cy = viewState.workerLine.y + viewState.trigger.offsetFromBottom + TRIGGER_PARAMS_SVG_HEIGHT + DefaultConfig.dotGap
                : bodyViewState.bBox.cy = viewState.workerLine.y + viewState.trigger.offsetFromBottom;
        } else {
            bodyViewState.bBox.cy = viewState.workerLine.y + viewState.trigger.offsetFromBottom;
        }

        viewState.end.bBox.cx = viewState.bBox.cx;
        viewState.end.bBox.cy = DefaultConfig.startingY + viewState.workerLine.h + DefaultConfig.canvas.childPaddingY;
    }

    public beginVisitFunctionDefinition(node: FunctionDefinition) {
        if (!node.functionBody) {
            return;
        }
        const viewState: FunctionViewState = node.viewState;
        const bodyViewState: BlockViewState = node.functionBody.viewState;

        viewState.bBox.cx = viewState.bBox.x;
        viewState.bBox.cy = viewState.bBox.y;

        viewState.trigger.cx = viewState.bBox.cx + viewState.bBox.w / 2;
        viewState.trigger.cy = viewState.bBox.cy + DefaultConfig.serviceVerticalPadding + viewState.trigger.h / 2
            + DefaultConfig.functionHeaderHeight;

        if (viewState.triggerParams) {
            viewState.triggerParams.bBox.cx = viewState.trigger.cx;
            viewState.triggerParams.bBox.cy = viewState.trigger.cy + (DefaultConfig.dotGap / 2);
        }

        viewState.workerLine.x = viewState.trigger.cx;
        viewState.workerLine.y = viewState.trigger.cy + (viewState.trigger.h / 2);

        bodyViewState.bBox.cx = viewState.workerLine.x;
        // bodyViewState.bBox.cy = viewState.workerLine.y + viewState.trigger.offsetFromBottom;

        if (viewState.triggerParams) {
            node?.functionSignature?.parameters?.length > 0 ?
                viewState.triggerParams.visible = true : viewState.triggerParams.visible = false
            viewState.triggerParams.visible ? bodyViewState.bBox.cy = viewState.workerLine.y + viewState.trigger.offsetFromBottom + TRIGGER_PARAMS_SVG_HEIGHT + DefaultConfig.dotGap
                : bodyViewState.bBox.cy = viewState.workerLine.y + viewState.trigger.offsetFromBottom;
        } else {
            bodyViewState.bBox.cy = viewState.workerLine.y + viewState.trigger.offsetFromBottom;
        }

        viewState.end.bBox.cx = viewState.bBox.cx + viewState.bBox.w / 2;
        viewState.end.bBox.cy = DefaultConfig.startingY + viewState.workerLine.h + DefaultConfig.canvas.childPaddingY;

        // this.beginFunctionTypeNode(node);
    }

    public beginVisitServiceDeclaration(node: ServiceDeclaration, parent?: STNode) {
        // const serviceVS: ServiceViewState = node.viewState;

        // let height = DefaultConfig.serviceMemberSpacing + SERVICE_HEADER_HEIGHT;
        // serviceVS.bBox.cx = serviceVS.bBox.x;
        // serviceVS.bBox.cy = serviceVS.bBox.y;
        // // let prevMemberViewState: ViewState = null;

        // node.members.forEach((member: STNode, i: number) => {
        //     const memberVS = member.viewState;

        //     const plusViewState: PlusViewState = getPlusViewState(i, serviceVS.plusButtons);

        //     if (plusViewState) {
        //         plusViewState.bBox.cx = serviceVS.bBox.x + DefaultConfig.serviceFrontPadding;
        //         plusViewState.bBox.cy = serviceVS.bBox.y + height;
        //         height += DefaultConfig.serviceMemberSpacing;
        //     }

        //     if (memberVS) {
        //         memberVS.bBox.x = serviceVS.bBox.x + DefaultConfig.serviceFrontPadding;
        //         memberVS.bBox.y = serviceVS.bBox.y + height;
        //         height += memberVS.bBox.h + DefaultConfig.serviceMemberSpacing;
        //     }
        // });

        // const lastPlusViewState: PlusViewState = getPlusViewState(node.members.length, serviceVS.plusButtons);

        // if (lastPlusViewState) {
        //     lastPlusViewState.bBox.cx = serviceVS.bBox.x + DefaultConfig.serviceFrontPadding;
        //     lastPlusViewState.bBox.cy = serviceVS.bBox.y + height;
        // }

    }

    public beginVisitResourceAccessorDefinition(node: ResourceAccessorDefinition) {
        if (!node.functionBody) {
            return;
        }
        const viewState: FunctionViewState = node.viewState;
        const bodyViewState: BlockViewState = node.functionBody.viewState;

        viewState.bBox.cx = viewState.bBox.x;
        viewState.bBox.cy = viewState.bBox.y;

        viewState.trigger.cx = viewState.bBox.cx + viewState.bBox.w / 2;
        viewState.trigger.cy = viewState.bBox.cy + DefaultConfig.serviceVerticalPadding + viewState.trigger.h / 2
            + DefaultConfig.functionHeaderHeight;

        if (viewState.triggerParams) {
            viewState.triggerParams.bBox.cx = viewState.trigger.cx;
            viewState.triggerParams.bBox.cy = viewState.trigger.cy + (DefaultConfig.dotGap / 2);
        }

        viewState.workerLine.x = viewState.trigger.cx;
        viewState.workerLine.y = viewState.trigger.cy + (viewState.trigger.h / 2);

        bodyViewState.bBox.cx = viewState.workerLine.x;
        // bodyViewState.bBox.cy = viewState.workerLine.y + viewState.trigger.offsetFromBottom;

        if (viewState.triggerParams) {
            node?.functionSignature?.parameters?.length > 0 ?
                viewState.triggerParams.visible = true : viewState.triggerParams.visible = false
            viewState.triggerParams.visible ? bodyViewState.bBox.cy = viewState.workerLine.y + viewState.trigger.offsetFromBottom + TRIGGER_PARAMS_SVG_HEIGHT + DefaultConfig.dotGap
                : bodyViewState.bBox.cy = viewState.workerLine.y + viewState.trigger.offsetFromBottom;
        } else {
            bodyViewState.bBox.cy = viewState.workerLine.y + viewState.trigger.offsetFromBottom;
        }

        viewState.end.bBox.cx = viewState.bBox.cx + + viewState.bBox.w / 2;
        viewState.end.bBox.cy = DefaultConfig.startingY + viewState.workerLine.h + DefaultConfig.canvas.childPaddingY;
        // this.beginFunctionTypeNode(node);
    }

    public beginVisitObjectMethodDefinition(node: ObjectMethodDefinition) {
        if (!node.functionBody) {
            return;
        }
        const viewState: FunctionViewState = node.viewState;
        const bodyViewState: BlockViewState = node.functionBody.viewState;

        viewState.trigger.cx = DefaultConfig.canvas.childPaddingX;
        viewState.trigger.cy = DefaultConfig.startingY + DefaultConfig.canvas.childPaddingY;

        if (viewState.triggerParams) {
            viewState.triggerParams.bBox.cx = viewState.trigger.cx;
            viewState.triggerParams.bBox.cy = viewState.trigger.cy + (DefaultConfig.dotGap / 2);
        }

        viewState.workerLine.x = viewState.trigger.cx;
        viewState.workerLine.y = viewState.trigger.cy + (viewState.trigger.h / 2);

        bodyViewState.bBox.cx = viewState.workerLine.x;

        if (viewState.triggerParams) {
            node?.functionSignature?.parameters?.length > 0 ?
                viewState.triggerParams.visible = true : viewState.triggerParams.visible = false
            viewState.triggerParams.visible ? bodyViewState.bBox.cy = viewState.workerLine.y + viewState.trigger.offsetFromBottom + TRIGGER_PARAMS_SVG_HEIGHT + DefaultConfig.dotGap
                : bodyViewState.bBox.cy = viewState.workerLine.y + viewState.trigger.offsetFromBottom;
        } else {
            bodyViewState.bBox.cy = viewState.workerLine.y + viewState.trigger.offsetFromBottom;
        }

        viewState.end.bBox.cx = DefaultConfig.canvas.childPaddingX;
        viewState.end.bBox.cy = DefaultConfig.startingY + viewState.workerLine.h + DefaultConfig.canvas.childPaddingY;
    }

    private updateFunctionEdgeControlFlow(viewState: FunctionViewState, body: FunctionBodyBlock) {
        // Update First Control Flow line
        if (viewState.workerBody.controlFlow.lineStates.length > 0) { // The list may contain 0 CF lines
            const startLine = viewState.workerBody.controlFlow.lineStates[0];
            const newStartLineY = viewState.trigger.cy - DefaultConfig.triggerPortalOffset.y;
            const newStartLineH = startLine.y - viewState.trigger.cy + startLine.h + DefaultConfig.triggerPortalOffset.y;
            startLine.h = newStartLineH;
            startLine.y = newStartLineY;

            if (body.statements[body.statements.length - 1].controlFlow?.isReached) {
                const endLine = viewState.workerBody.controlFlow.lineStates[viewState.workerBody.controlFlow.lineStates.length - 1];
                endLine.h = viewState.end.bBox.cy - endLine.y
            }
        }
    }

    public endVisitFunctionDefinition(node: FunctionDefinition) {
        const viewState: FunctionViewState = node.viewState;
        const bodyViewState: BlockViewState = node.functionBody.viewState;
        const body: FunctionBodyBlock = node.functionBody as FunctionBodyBlock;
        viewState.workerBody = bodyViewState;
        viewState.end.bBox.cy = viewState.workerLine.h + viewState.workerLine.y;
        // viewState.bBox.h = viewState.workerLine.h + viewState.workerLine.y + viewState.end.bBox.h + DefaultConfig.canvasBottomOffset;

        // If body has no statements and doesn't have a end component
        // Add the plus button to show up on the start end
        if (!bodyViewState.isEndComponentAvailable && body.statements.length <= 0) {
            const plusBtnViewState: PlusViewState = viewState.initPlus;
            if (bodyViewState.draft === undefined && plusBtnViewState) {
                plusBtnViewState.bBox.cx = viewState.trigger.cx - (BIGPLUS_SVG_WIDTH / 2);

                if (viewState.triggerParams) {
                    node?.functionSignature?.parameters?.length > 0 ?
                        viewState.triggerParams.visible = true : viewState.triggerParams.visible = false
                    viewState.triggerParams.visible ?
                        plusBtnViewState.bBox.cy = viewState.trigger.cy + (viewState.trigger.h / 2) + viewState.trigger.offsetFromBottom + (START_SVG_SHADOW_OFFSET / 4) + TRIGGER_PARAMS_SVG_HEIGHT + (DefaultConfig.dotGap / 2)
                        : plusBtnViewState.bBox.cy = viewState.trigger.cy + (viewState.trigger.h / 2) + viewState.trigger.offsetFromBottom + (START_SVG_SHADOW_OFFSET / 4);

                } else {
                    plusBtnViewState.bBox.cy = viewState.trigger.cy + (viewState.trigger.h / 2) + viewState.trigger.offsetFromBottom + (START_SVG_SHADOW_OFFSET / 4);

                }
            }
        }

        let widthOfOnFailClause = 0;
        if (!STKindChecker.isExpressionFunctionBody(body) && body.statements.length > 0) {
            for (const statement of body.statements) {
                if (STKindChecker.isDoStatement(statement) && statement.viewState.isFirstInFunctionBody) {
                    if (statement.onFailClause) {
                        const onFailBlockViewState = statement.onFailClause.blockStatement.viewState as BlockViewState;
                        widthOfOnFailClause = onFailBlockViewState.bBox.w;
                        const onFailViewState = statement.onFailClause.viewState as OnErrorViewState;
                        onFailViewState.bBox.cx = viewState.end.bBox.cx + (DefaultConfig.startingOnErrorX * 2);
                        onFailViewState.bBox.cy = viewState.end.bBox.cy + DefaultConfig.startingOnErrorY + (onFailBlockViewState.bBox.offsetFromBottom * 2) + viewState.bBox.offsetFromBottom + (DefaultConfig.startingOnErrorY * 2);
                        viewState.onFail = statement.onFailClause;
                    }
                }
            }
        }
        updateConnectorCX(bodyViewState.bBox.w / 2 + widthOfOnFailClause, bodyViewState.bBox.cx, allEndpoints);
        // Add the connector max width to the diagram width.
        // viewState.bBox.w = viewState.bBox.w + getMaXWidthOfConnectors(allEndpoints) + widthOfOnFailClause;

        // Update First Control Flow line
        this.updateFunctionEdgeControlFlow(viewState, body);
    }

    public endVisitResourceAccessorDefinition(node: ResourceAccessorDefinition) {
        const viewState: FunctionViewState = node.viewState;
        const bodyViewState: BlockViewState = node.functionBody.viewState;
        const body: FunctionBodyBlock = node.functionBody as FunctionBodyBlock;
        viewState.workerBody = bodyViewState;
        viewState.end.bBox.cy = viewState.workerLine.h + viewState.workerLine.y;
        // viewState.bBox.h = viewState.workerLine.h + viewState.workerLine.y + viewState.end.bBox.h + DefaultConfig.canvasBottomOffset;

        // If body has no statements and doesn't have a end component
        // Add the plus button to show up on the start end
        if (!bodyViewState.isEndComponentAvailable && body.statements.length <= 0) {
            const plusBtnViewState: PlusViewState = viewState.initPlus;
            if (bodyViewState.draft === undefined && plusBtnViewState) {
                plusBtnViewState.bBox.cx = viewState.trigger.cx - (BIGPLUS_SVG_WIDTH / 2);
                plusBtnViewState.bBox.cy = viewState.trigger.cy + (viewState.trigger.h / 2) + viewState.trigger.offsetFromBottom + (START_SVG_SHADOW_OFFSET / 4);
            }
        }

        updateConnectorCX(bodyViewState.bBox.w / 2, bodyViewState.bBox.cx, allEndpoints);
        // Add the connector max width to the diagram width.

        // todo need to verify this
        // viewState.bBox.w = viewState.bBox.w + getMaXWidthOfConnectors(allEndpoints);

        // Update First Control Flow line
        this.updateFunctionEdgeControlFlow(viewState, body);
    }

    public endVisitObjectMethodDefinition(node: ObjectMethodDefinition) {
        const viewState: FunctionViewState = node.viewState;
        const bodyViewState: BlockViewState = node.functionBody.viewState;
        const body: FunctionBodyBlock = node.functionBody as FunctionBodyBlock;
        viewState.workerBody = bodyViewState;
        viewState.end.bBox.cy = viewState.workerLine.h + viewState.workerLine.y;
        // viewState.bBox.h = viewState.workerLine.h + viewState.workerLine.y + viewState.end.bBox.h + DefaultConfig.canvasBottomOffset;

        // If body has no statements and doesn't have a end component
        // Add the plus button to show up on the start end
        if (!bodyViewState.isEndComponentAvailable && body.statements.length <= 0) {
            const plusBtnViewState: PlusViewState = viewState.initPlus;
            if (bodyViewState.draft === undefined && plusBtnViewState) {
                plusBtnViewState.bBox.cx = viewState.trigger.cx - (BIGPLUS_SVG_WIDTH / 2);
                plusBtnViewState.bBox.cy = viewState.trigger.cy + (viewState.trigger.h / 2) + viewState.trigger.offsetFromBottom + (START_SVG_SHADOW_OFFSET / 4);
            }
        }

        updateConnectorCX(bodyViewState.bBox.w / 2, bodyViewState.bBox.cx, allEndpoints);
        // Add the connector max width to the diagram width.
        // viewState.bBox.w = viewState.bBox.w + getMaXWidthOfConnectors(allEndpoints);

        // Update First Control Flow line
        this.updateFunctionEdgeControlFlow(viewState, body);
    }

    public beginVisitFunctionBodyBlock(node: FunctionBodyBlock) {
        const blockViewState: BlockViewState = node.viewState;
        allEndpoints = blockViewState.connectors;
        epCount = 0;
        this.beginVisitBlockStatement(node);
    }

    public beginVisitExpressionFunctionBody(node: ExpressionFunctionBody) {
        const blockViewState: BlockViewState = node.viewState;
        allEndpoints = blockViewState.connectors;
        epCount = 0;
    }

    public beginVisitBlockStatement(node: BlockStatement) {
        const blockViewState: BlockViewState = node.viewState;
        let height = 0;
        let index = 0;
        const epGap = DefaultConfig.epGap;
        // Clean rendered labels
        blockViewState.controlFlow.executionTimeStates = [];
        blockViewState.controlFlow.lineStates = [];
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

            // Control flow execution time
            if (statement?.controlFlow?.executionTime !== undefined) {
                const isIf = STKindChecker.isIfElseStatement(statement)
                // Neglect if width dueto drawing lines in left side
                const offsetX = (isIf ? EXECUTION_TIME_IF_X_OFFSET : (statementViewState.bBox.w / 2) + EXECUTION_TIME_DEFAULT_X_OFFSET);
                let offsetY;
                if (STKindChecker.isIfElseStatement(statement)) {
                    offsetY = (statementViewState as IfViewState).headIf.h / 2;
                } else if (STKindChecker.isForeachStatement(statement)) {
                    offsetY = (statementViewState as ForEachViewState).foreachHead.h / 2;
                } else if (STKindChecker.isWhileStatement(statement)) {
                    offsetY = (statementViewState as WhileViewState).whileHead.h / 2;
                }

                const executionTime: ControlFlowExecutionTimeState = {
                    x: blockViewState.bBox.cx - offsetX,
                    y: statementViewState.bBox.cy + offsetY,
                    h: statementViewState.bBox.h - (statementViewState.bBox.offsetFromBottom + statementViewState.bBox.offsetFromTop + offsetY),
                    value: statement.controlFlow?.executionTime
                };
                blockViewState.controlFlow.executionTimeStates.push(executionTime);
            }
            // Add control flow line above each statement
            if (statement?.controlFlow?.isReached) {
                const controlFlowLineState: ControlFlowLineState = {
                    x: 0,
                    y: 0,
                    h: 0
                };
                if (index === 0) {
                    controlFlowLineState.x = blockViewState.bBox.cx;
                    controlFlowLineState.y = blockViewState.bBox.cy - blockViewState.bBox.offsetFromBottom;
                    controlFlowLineState.h = statementViewState.bBox.cy - controlFlowLineState.y;
                } else {
                    const previousStatementViewState: StatementViewState = node.statements[index - 1].viewState;
                    controlFlowLineState.x = statementViewState.bBox.cx;
                    if (STKindChecker.isIfElseStatement(node.statements[index - 1])) {
                        controlFlowLineState.y = previousStatementViewState.bBox.cy + previousStatementViewState.bBox.h - previousStatementViewState.bBox.offsetFromBottom - statementViewState.bBox.offsetFromTop;
                        controlFlowLineState.h = statementViewState.bBox.cy - controlFlowLineState.y + previousStatementViewState.bBox.offsetFromBottom + statementViewState.bBox.offsetFromTop;
                    } else {
                        controlFlowLineState.y = previousStatementViewState.bBox.cy;
                        controlFlowLineState.h = statementViewState.bBox.cy - controlFlowLineState.y;
                    }

                }
                blockViewState.controlFlow.lineStates.push(controlFlowLineState);
                statementViewState.isReached = true;
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
                    } else if (plusForIndex.selectedComponent === "APIS" && !plusForIndex?.isAPICallsExisting) {
                        statementViewState.bBox.cy += PLUS_HOLDER_API_HEIGHT;
                    } else if (plusForIndex?.selectedComponent === "APIS" && plusForIndex.isAPICallsExisting) {
                        statementViewState.bBox.cy += EXISTING_PLUS_HOLDER_API_HEIGHT;
                        if (plusForIndex.isAPICallsExistingCollapsed) {
                            statementViewState.bBox.cy += EXISTING_PLUS_HOLDER_API_HEIGHT_COLLAPSED;
                        } else if (plusForIndex.isAPICallsExistingCreateCollapsed) {
                            statementViewState.bBox.cy += PLUS_HOLDER_API_HEIGHT_COLLAPSED;
                        } else {
                            statementViewState.bBox.cy += EXISTING_PLUS_HOLDER_API_HEIGHT;
                        }
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
                    } else if (plusForIndex.selectedComponent === "APIS" && !plusForIndex?.isAPICallsExisting) {
                        statementViewState.bBox.cy += PLUS_HOLDER_API_HEIGHT;
                        height += PLUS_HOLDER_API_HEIGHT;
                    } else if (plusForIndex?.selectedComponent === "APIS" && plusForIndex.isAPICallsExisting) {
                        // statementViewState.bBox.cy += EXISTING_PLUS_HOLDER_API_HEIGHT;
                        // height += EXISTING_PLUS_HOLDER_API_HEIGHT;
                        if (plusForIndex.isAPICallsExistingCollapsed) {
                            statementViewState.bBox.cy += EXISTING_PLUS_HOLDER_API_HEIGHT_COLLAPSED;
                            height += EXISTING_PLUS_HOLDER_API_HEIGHT_COLLAPSED;
                        } else if (plusForIndex.isAPICallsExistingCreateCollapsed) {
                            statementViewState.bBox.cy += PLUS_HOLDER_API_HEIGHT_COLLAPSED;
                            height += PLUS_HOLDER_API_HEIGHT_COLLAPSED;
                        } else {
                            statementViewState.bBox.cy += EXISTING_PLUS_HOLDER_API_HEIGHT;
                            height += EXISTING_PLUS_HOLDER_API_HEIGHT;
                        }
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
                    statementViewState.endpoint.typeName = visibleEndpoint.typeName;

                    // Set action trigger box cx point to match life line cx
                    // Set action trigger box cy point to match action invocation statement cy
                    statementViewState.action.trigger.cx = mainEp.lifeLine.cx;
                    statementViewState.action.trigger.cy = statementViewState.bBox.cy;

                    if ((endpoint?.visibleEndpoint as any)?.isExternal && !endpoint.firstAction) {
                        statementViewState.endpoint = mainEp;
                        // Add endpoint in to the action view statement.
                        const endpointViewState: EndpointViewState = statementViewState.endpoint;
                        endpointViewState.typeName = visibleEndpoint.typeName;

                        // to identify a connector init ( http:Client ep1 = new ("/context") )
                        endpointViewState.lifeLine.cx = blockViewState.bBox.cx +
                            (endpointViewState.bBox.w / 2) + epGap + (epGap * epCount);
                        endpointViewState.lifeLine.cy = statementViewState.bBox.cy - (DefaultConfig.connectorLine.gap);
                        endpointViewState.isExternal = (endpoint.visibleEndpoint as any)?.isExternal;
                        visibleEndpoint.viewState = endpointViewState;

                        epCount++;
                    }

                    // to check whether the action is invoked for the first time
                    if (!endpoint.firstAction) {
                        endpoint.firstAction = statementViewState;
                        mainEp.isUsed = true;
                        mainEp.lifeLine.h = statementViewState.action.trigger.cy - mainEp.lifeLine.cy + statementViewState.action.trigger.h + DefaultConfig.connectorLine.gap;
                    } else if (mainEp.lifeLine.cy > statementViewState.bBox.cy) {
                        // To catch the endpoints define at the function block and used after a child block
                        mainEp.lifeLine.h = mainEp.lifeLine.cy - statementViewState.bBox.cy + statementViewState.action.trigger.h + DefaultConfig.connectorLine.gap;
                        // mainEp.lifeLine.cy = statementViewState.bBox.cy;
                    } else if ((mainEp.lifeLine.h + mainEp.lifeLine.cy) < (statementViewState.action.trigger.cy)) {
                        // to skip updating EP heights which less than the current EP height
                        mainEp.lifeLine.h = statementViewState.action.trigger.cy - mainEp.lifeLine.cy + statementViewState.action.trigger.h + DefaultConfig.connectorLine.gap;
                    }

                    // Add actions to the corresponding map item.
                    endpoint.actions.push(statementViewState);
                }

                if (statementViewState.isEndpoint && statementViewState.endpoint.epName) {
                    const endpointViewState: EndpointViewState = statementViewState.endpoint;
                    // to identify a connector init ( http:Client ep1 = new ("/context") )
                    endpointViewState.lifeLine.cx = blockViewState.bBox.cx +
                        (endpointViewState.bBox.w / 2) + epGap + (epGap * epCount);
                    endpointViewState.lifeLine.cy = statementViewState.bBox.cy;
                    const endpoint: Endpoint = allEndpoints.get(statementViewState.endpoint.epName);
                    const visibleEndpoint: VisibleEndpoint = endpoint.visibleEndpoint;
                    const mainEp = endpointViewState;
                    visibleEndpoint.viewState = mainEp;
                    epCount++;
                }

                if ((statementViewState.isEndpoint && statementViewState.isAction && !statementViewState.hidden)
                    || (!statementViewState.collapsed)) {
                    height += statementViewState.bBox.h;
                }
            }
            ++index;
        });

        if (!blockViewState.isEndComponentAvailable
            && node.statements.length > 0 && node.statements[node.statements.length - 1]?.controlFlow?.isReached) {
            const lastStatement = node.statements[node.statements.length - 1];
            if (!(node.viewState as BlockViewState).isElseBlock) {
                //  Adding last control flow line after last statement for any block
                let lastLineY;
                if (STKindChecker.isIfElseStatement(lastStatement)) {
                    // For IfElse statements, the starting position of the end line starts at the bottom of last statement
                    lastLineY = lastStatement.viewState.bBox.cy + lastStatement.viewState.bBox.h -
                        blockViewState.bBox.offsetFromTop - blockViewState.bBox.offsetFromBottom;
                } else {
                    lastLineY = lastStatement.viewState.bBox.cy
                }
                const lastLine: ControlFlowLineState = {
                    x: lastStatement.viewState.bBox.cx,
                    y: lastLineY,
                    h: blockViewState.bBox.cy + blockViewState.bBox.offsetFromTop + height - lastLineY,
                };
                blockViewState.controlFlow.lineStates.push(lastLine);
            } else {
                //  Adding last control flow line after last statement for else block
                if (!STKindChecker.isReturnStatement(lastStatement)) {
                    const endLineY = STKindChecker.isIfElseStatement(lastStatement)
                        ? lastStatement.viewState.bBox.cy + lastStatement.viewState.bBox.h
                        : lastStatement.viewState.bBox.cy;
                    const lastLine: ControlFlowLineState = {
                        x: lastStatement.viewState.bBox.cx,
                        y: endLineY,
                        h: blockViewState.bBox.cy + height - endLineY,
                    }
                    blockViewState.controlFlow.lineStates.push(lastLine);
                }
            }
        }

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

    public beginVisitWhileStatement(node: WhileStatement) {
        const bodyViewState: BlockViewState = node.whileBody.viewState;
        const viewState: WhileViewState = node.viewState;
        viewState.whileBody = bodyViewState;

        viewState.whileHead.cx = viewState.bBox.cx;
        viewState.whileHead.cy = viewState.bBox.cy + (viewState.whileHead.h / 2);

        viewState.whileLifeLine.cx = viewState.bBox.cx;
        viewState.whileLifeLine.cy = viewState.whileHead.cy + (viewState.whileHead.h / 2);

        viewState.whileBody.bBox.cx = viewState.whileHead.cx;
        viewState.whileBody.bBox.cy = viewState.whileHead.cy + (viewState.whileHead.h / 2) + viewState.whileHead.offsetFromBottom;

        viewState.whileBodyRect.cx = viewState.whileHead.cx;
        viewState.whileBodyRect.cy = viewState.whileHead.cy;
    }

    public endVisitForeachStatement(node: ForeachStatement) {
        this.updateLoopEdgeControlFlow(node.viewState.foreachBody, node.viewState.foreachLifeLine);
    }

    public endVisitWhileStatement(node: WhileStatement) {
        this.updateLoopEdgeControlFlow(node.viewState.whileBody, node.viewState.whileLifeLine);
    }

    public updateLoopEdgeControlFlow(bodyViewState: BlockViewState, lifeLine: SimpleBBox) {
        const controlFlowLines = bodyViewState.controlFlow.lineStates;
        if (controlFlowLines.length > 0) { // The list may contain 0 CF lines
            const endLine = controlFlowLines[controlFlowLines.length - 1];
            endLine.h = lifeLine.cy + lifeLine.h - endLine.y
        }
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

    public endVisitIfElseStatement(node: IfElseStatement) {
        const bodyViewState: BlockViewState = node.ifBody.viewState;
        // For then block add last line
        if (node.ifBody.statements.length > 0 && node.ifBody.statements[node.ifBody.statements.length - 1]?.controlFlow?.isReached) {
            const lastStatement = node.ifBody.statements[node.ifBody.statements.length - 1];
            const lineY = lastStatement.viewState.bBox.cy + lastStatement.viewState.bBox.h;
            const lineHeightForIf = bodyViewState.bBox.cy + bodyViewState.bBox.length - lastStatement.viewState.bBox.offsetFromBottom - lineY;
            const lastLine: ControlFlowLineState = {
                x: lastStatement.viewState.bBox.cx,
                y: lineY,
                h: lineHeightForIf,
            }
            bodyViewState.controlFlow.lineStates.push(lastLine);
        }
        if (node.elseBody && node.elseBody.elseBody.controlFlow?.isReached) {
            if (node.elseBody?.elseBody && STKindChecker.isIfElseStatement(node.elseBody.elseBody)) {
                const elseIfStmt: IfElseStatement = node.elseBody.elseBody as IfElseStatement;
                const elseIfViewState: IfViewState = elseIfStmt.viewState;
                const topLine: ControlFlowLineState = {
                    x: elseIfViewState.elseIfTopHorizontalLine.x,
                    y: elseIfViewState.elseIfTopHorizontalLine.y,
                    w: elseIfViewState.elseIfLifeLine.x - elseIfViewState.elseIfTopHorizontalLine.x - elseIfViewState.elseIfHeadWidthOffset,
                };
                bodyViewState.controlFlow.lineStates.push(topLine);

                if (elseIfStmt.controlFlow?.isCompleted) {
                    const bottomLine: ControlFlowLineState = {
                        x: elseIfViewState.elseIfBottomHorizontalLine.x,
                        y: elseIfViewState.elseIfBottomHorizontalLine.y,
                        w: elseIfViewState.elseIfLifeLine.x - elseIfViewState.elseIfBottomHorizontalLine.x
                    };
                    bodyViewState.controlFlow.lineStates.push(bottomLine);
                }
            }
        }
        // Add body control flow line for empty else conditions
        if (!node.elseBody && node.controlFlow?.isReached && !node.ifBody.controlFlow?.isReached) {
            // Handling empty else bodies of which if body had not been reached but the overall statement was
            const defaultElseVS = (node?.viewState as IfViewState)?.defaultElseVS;
            const defaultBodyControlFlowLine = {
                x: defaultElseVS.bBox.cx,
                y: node.ifBody.viewState.bBox.cy + TOP_CURVE_SVG_HEIGHT,
                h: node.ifBody.viewState.bBox.h - (TOP_CURVE_SVG_HEIGHT + BOTTOM_CURVE_SVG_WIDTH),
            };
            defaultElseVS?.controlFlow.lineStates.push(defaultBodyControlFlowLine);
        }
    }

    public beginVisitDoStatement(node: DoStatement) {
        const viewState = node.viewState as DoViewState;
        if (viewState.isFirstInFunctionBody) {
            const blockViewState = node.blockStatement.viewState as BlockViewState;
            blockViewState.bBox.cx = viewState.bBox.cx;
            blockViewState.bBox.cy = blockViewState.bBox.offsetFromTop + viewState.bBox.cy;

            viewState.container.x = blockViewState.bBox.cx - (viewState.container.w / 2);
            viewState.container.y = blockViewState.bBox.cy - DefaultConfig.plus.radius;
        }
    }

    public beginVisitOnFailClause(node: OnFailClause) {
        const viewState = node.viewState as OnErrorViewState;
        if (viewState.isFirstInFunctionBody) {
            const onFailViewState = node.viewState as OnErrorViewState;
            const blockViewState = node.blockStatement.viewState as BlockViewState;
            blockViewState.bBox.cx = onFailViewState.bBox.cx;
            blockViewState.bBox.cy = onFailViewState.bBox.cy;
            // blockViewState.bBox.cy = (blockViewState.bBox.offsetFromBottom * 2) + (DefaultConfig.startingOnErrorY * 2);
        }
    }

    public endVisitOnFailClause(node: OnFailClause) {
        const viewState = node.viewState as OnErrorViewState;
        if (viewState.isFirstInFunctionBody) {
            const onFailBlockViewState = node.blockStatement.viewState as BlockViewState;
            viewState.header.cx = viewState.bBox.cx;
            viewState.header.cy = viewState.bBox.cy - (onFailBlockViewState.bBox.offsetFromBottom);
            viewState.lifeLine.x = viewState.bBox.cx;
            viewState.lifeLine.y = viewState.bBox.cy - (onFailBlockViewState.bBox.offsetFromBottom);
            viewState.lifeLine.h = viewState.lifeLine.h + onFailBlockViewState.bBox.offsetFromBottom;
        }

    }

}

export const visitor = new PositioningVisitor();
