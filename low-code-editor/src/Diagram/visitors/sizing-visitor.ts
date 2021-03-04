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
    ActionStatement,
    AssignmentStatement,
    BlockStatement,
    CallStatement,
    ForeachStatement,
    FunctionBodyBlock,
    FunctionDefinition,
    IfElseStatement,
    LocalVarDecl,
    ModulePart,
    STKindChecker,
    STNode,
    Visitor
} from "@ballerina/syntax-tree";

import { CLIENT_RADIUS, CLIENT_SVG_HEIGHT, CLIENT_SVG_WIDTH } from "../components/ActionInvocation/ConnectorClient/ConnectorClientSVG";
import { COLLAPSE_SVG_HEIGHT_WITH_SHADOW, COLLAPSE_SVG_WIDTH_WITH_SHADOW } from "../components/Collapse/CollapseSVG";
import { STOP_SVG_HEIGHT, STOP_SVG_WIDTH } from "../components/End/StopSVG";
import { FOREACH_SVG_HEIGHT, FOREACH_SVG_WIDTH } from "../components/ForEach/ForeachSVG";
import { COLLAPSE_DOTS_SVG_HEIGHT } from "../components/ForEach/ThreeDotsSVG";
import { IFELSE_SVG_HEIGHT, IFELSE_SVG_WIDTH } from "../components/IfElse/IfElseSVG";
import { PLUS_SVG_HEIGHT, PLUS_SVG_WIDTH } from "../components/Plus/PlusAndCollapse/PlusSVG";
import { PLUS_HOLDER_API_HEIGHT, PLUS_HOLDER_STATEMENT_HEIGHT, PLUS_HOLDER_WIDTH } from "../components/Portals/Overlay/Elements/PlusHolder/PlusElements";
import { PROCESS_SVG_HEIGHT, PROCESS_SVG_WIDTH } from "../components/Processor/ProcessSVG";
import { RESPOND_SVG_HEIGHT, RESPOND_SVG_WIDTH } from "../components/Respond/RespondSVG";
import { START_SVG_HEIGHT, START_SVG_WIDTH } from "../components/Start/StartSVG";
import { TRIGGER_PARAMS_SVG_HEIGHT, TRIGGER_PARAMS_SVG_WIDTH } from "../components/TriggerParams/TriggerParamsSVG";
import { Endpoint, getDraftComponentSizes, getPlusViewState, isSTActionInvocation } from "../utils/st-util";
import { BlockViewState, CollapseViewState, CompilationUnitViewState, ElseViewState, EndpointViewState, ForEachViewState, FunctionViewState, IfViewState, PlusViewState, StatementViewState } from "../view-state";
import { DraftStatementViewState } from "../view-state/draft";
import { TriggerParamsViewState } from "../view-state/triggerParams";

import { DefaultConfig } from "./default";

let allEndpoints: Map<string, Endpoint> = new Map<string, Endpoint>();

class SizingVisitor implements Visitor {

    public endVisitModulePart(node: ModulePart) {
        const viewState: CompilationUnitViewState = node.viewState;
        if (node.members.length <= 0) { // if the bal file is empty.
            viewState.trigger.h = START_SVG_HEIGHT;
            viewState.trigger.w = START_SVG_WIDTH;

            viewState.bBox.h = DefaultConfig.canvas.height;
            viewState.bBox.w = DefaultConfig.canvas.width;
        }
    }

    public beginVisitFunctionDefinition(node: FunctionDefinition) {
        const viewState: FunctionViewState = node.viewState as FunctionViewState;
        const body: FunctionBodyBlock = node.functionBody as FunctionBodyBlock;
        const bodyViewState: BlockViewState = body.viewState;

        // If body has no statements and doesn't have a end component
        // Add the plus button to show up on the start end
        if (!bodyViewState.isEndComponentAvailable && body.statements.length <= 0) {
            const plusBtnViewState: PlusViewState = new PlusViewState();
            if (!bodyViewState.draft && !viewState.initPlus) {
                plusBtnViewState.index = body.statements.length;
                plusBtnViewState.expanded = true;
                plusBtnViewState.selectedComponent = "PROCESS";
                plusBtnViewState.collapsedClicked = false;
                plusBtnViewState.collapsedPlusDuoExpanded = false;
                plusBtnViewState.isLast = true;
                bodyViewState.plusButtons = [];
                bodyViewState.plusButtons.push(plusBtnViewState);
                viewState.initPlus = plusBtnViewState;
            } else if (viewState.initPlus && viewState.initPlus.draftAdded) {
                viewState.initPlus = undefined;
            }
        }
    }

    public endVisitFunctionDefinition(node: FunctionDefinition) {
        // replaces endVisitFunction
        const viewState: FunctionViewState = node.viewState as FunctionViewState;
        const body: FunctionBodyBlock = node.functionBody as FunctionBodyBlock;
        const bodyViewState: BlockViewState = body.viewState;
        // const triggerParams: TriggerParamsViewState = node.viewState.TriggerParamsViewState;
        const lifeLine = viewState.workerLine;
        const trigger = viewState.trigger;
        const triggerParams = viewState.triggerParams;
        const end = viewState.end;

        trigger.h = START_SVG_HEIGHT;
        trigger.w = START_SVG_WIDTH;

        triggerParams.bBox.h = TRIGGER_PARAMS_SVG_HEIGHT;
        triggerParams.bBox.w = TRIGGER_PARAMS_SVG_WIDTH;

        end.bBox.w = STOP_SVG_WIDTH;
        end.bBox.h = STOP_SVG_HEIGHT;

        // todo
        // if () {
        // lifeLine.h = trigger.offsetFromBottom + bodyViewState.bBox.h + triggerParams.bBox.h + DefaultConfig.dotGap;
        // }
        lifeLine.h = trigger.offsetFromBottom + bodyViewState.bBox.h + triggerParams.bBox.h + DefaultConfig.dotGap;

        // lifeLine.h = trigger.offsetFromBottom + bodyViewState.bBox.h;
        if (body.statements.length > 0) {
            lifeLine.h += end.bBox.offsetFromTop;
        }

        viewState.bBox.h = lifeLine.h;
        viewState.bBox.w = trigger.w > bodyViewState.bBox.w ? trigger.w : bodyViewState.bBox.w;
    }

    public beginVisitFunctionBodyBlock(node: FunctionBodyBlock) {
        const viewState: BlockViewState = node.viewState;
        if (node.statements.length > 0 && STKindChecker.isReturnStatement(node.statements[node.statements.length - 1])) {
            viewState.isEndComponentInMain = true;
        }
        this.beginSizingBlock(node);
        allEndpoints = viewState.connectors;
    }

    public endVisitFunctionBodyBlock(node: FunctionBodyBlock) {
        this.endSizingBlock(node);
    }

    public beginVisitBlockStatement(node: BlockStatement) {
        this.beginSizingBlock(node);
    }

    public endVisitBlockStatement(node: BlockStatement) {
        this.endSizingBlock(node);
    }

    public endVisitLocalVarDecl(node: LocalVarDecl) {
        this.sizeStatement(node);
    }

    public endVisitAssignmentStatement(node: AssignmentStatement) {
        this.sizeStatement(node);
    }

    public endVisitActionStatement(node: ActionStatement) {
        this.sizeStatement(node);
    }

    public endVisitCallStatement(node: CallStatement) {
        this.sizeStatement(node);
    }

    public beginVisitForeachStatement(node: ForeachStatement) {
        const bodyViewState: BlockViewState = node.blockStatement.viewState;
        const viewState: ForEachViewState = node.viewState;

        bodyViewState.collapsed = viewState.folded ? viewState.folded : viewState.collapsed;
    }

    public endVisitForeachStatement(node: ForeachStatement) {
        // replaces endVisitForeach
        const bodyViewState: BlockViewState = node.blockStatement.viewState;
        const viewState: ForEachViewState = node.viewState;

        viewState.foreachHead.h = FOREACH_SVG_HEIGHT;
        viewState.foreachHead.w = FOREACH_SVG_WIDTH;

        viewState.foreachBody = bodyViewState;

        if (viewState.folded) {
            viewState.foreachLifeLine.h = 0;
            viewState.foreachBodyRect.w = (viewState.foreachBody.bBox.w > 0)
                ? (viewState.foreachHead.w / 2) + DefaultConfig.horizontalGapBetweenComponents
                + DefaultConfig.forEach.emptyHorizontalGap + DefaultConfig.dotGap
                : viewState.foreachBody.bBox.w + (DefaultConfig.forEach.emptyHorizontalGap * 2) + (DefaultConfig.dotGap * 2);
            viewState.foreachBodyRect.h = (viewState.foreachHead.h / 2) + DefaultConfig.forEach.offSet +
                COLLAPSE_DOTS_SVG_HEIGHT + DefaultConfig.forEach.offSet;
        } else {
            viewState.foreachLifeLine.h = viewState.foreachHead.offsetFromBottom + viewState.foreachBody.bBox.h;

            viewState.foreachBodyRect.w = (viewState.foreachBody.bBox.w > 0)
                ? viewState.foreachBody.bBox.w + (DefaultConfig.horizontalGapBetweenComponents * 2)
                : viewState.foreachBody.bBox.w + (DefaultConfig.forEach.emptyHorizontalGap * 2) + (DefaultConfig.dotGap * 2);
            viewState.foreachBodyRect.h = (viewState.foreachHead.h / 2) +
                viewState.foreachLifeLine.h + viewState.foreachBodyRect.offsetFromBottom;

            // deducting the svg lifeline height(STOP SVG height and offset) is a end component is there
            if (viewState.foreachBody.isEndComponentAvailable) {
                viewState.foreachLifeLine.h = viewState.foreachLifeLine.h - viewState.foreachBodyRect.offsetFromBottom
                    - STOP_SVG_HEIGHT;
            }
        }

        viewState.bBox.h = (viewState.foreachHead.h / 2) + viewState.foreachBodyRect.h;
        viewState.bBox.w = viewState.foreachBodyRect.w;
    }

    public beginVisitIfElseStatement(node: IfElseStatement) {
        const viewState: IfViewState = node.viewState;
        const ifBodyViewState: BlockViewState = node.ifBody.viewState;

        viewState.headIf.h = IFELSE_SVG_HEIGHT;
        viewState.headIf.w = IFELSE_SVG_WIDTH;

        if (viewState.collapsed) {
            ifBodyViewState.collapsed = viewState.collapsed;
        }

        ifBodyViewState.bBox.w = viewState.headIf.w;
        ifBodyViewState.bBox.h = 0;

        if (node.elseBody?.elseBody) {
            if (node.elseBody.elseBody.kind === "BlockStatement") {
                const elseViewState: ElseViewState = node.elseBody.elseBody.viewState as ElseViewState;

                elseViewState.ifHeadWidthOffset = viewState.headIf.w / 2;
                elseViewState.ifHeadHeightOffset = viewState.headIf.h / 2;
            } else if (node.elseBody.elseBody.kind === "IfElseStatement") {
                const elseIfViewState: IfViewState = node.elseBody.elseBody.viewState as IfViewState;
                elseIfViewState.childElseIfViewState = [];
                elseIfViewState.childElseViewState = undefined;
                elseIfViewState.isElseIf = true;
            }
        } else {
            // setting a default else statement when else is not defined
            viewState.defaultElseVS = new ElseViewState();

            viewState.defaultElseVS.ifHeadWidthOffset = viewState.headIf.w / 2;
            viewState.defaultElseVS.ifHeadHeightOffset = viewState.headIf.h / 2;
        }

        viewState.bBox.h = viewState.headIf.h + ifBodyViewState.bBox.length;
        viewState.bBox.w = viewState.offSetBetweenIfElse * 2;
    }

    public endVisitIfElseStatement(node: IfElseStatement) {
        // replaces endVisitIf
        const viewState: IfViewState = node.viewState;
        const ifBodyViewState: BlockViewState = node.ifBody.viewState;
        ifBodyViewState.bBox.length = viewState.headIf.offsetFromBottom + ifBodyViewState.bBox.h + viewState.verticalOffset;
        let elseWidth = 0;
        viewState.ifBody = ifBodyViewState;

        let diffIfWidthWithHeadWidth = 0;
        if (viewState.headIf.w < ifBodyViewState.bBox.w) {
            diffIfWidthWithHeadWidth = (ifBodyViewState.bBox.w / 2 - viewState.headIf.w / 2)
        }

        if (node.elseBody) {
            if (node.elseBody.elseBody.kind === "BlockStatement") {
                const elseStmt: BlockStatement = node.elseBody.elseBody as BlockStatement;
                const elseViewState: ElseViewState = node.elseBody.elseBody.viewState as ElseViewState;

                viewState.childElseViewState = elseViewState;

                if (elseViewState.isEndComponentAvailable) {
                    elseViewState.elseBody.length = viewState.headIf.offsetFromBottom + elseViewState.bBox.h;
                } else {
                    elseViewState.elseBody.length = elseViewState.ifHeadHeightOffset +
                        viewState.headIf.offsetFromBottom + elseViewState.bBox.h + viewState.verticalOffset;
                }

                if ((elseViewState.bBox.h < ifBodyViewState.bBox.h) && !elseViewState.isEndComponentAvailable) {
                    elseViewState.elseBody.length += ifBodyViewState.bBox.h - elseViewState.bBox.h;
                } else if (elseViewState.bBox.h >= ifBodyViewState.bBox.h) {
                    ifBodyViewState.bBox.length += elseViewState.bBox.h - ifBodyViewState.bBox.h;
                }
                elseWidth = elseViewState.bBox.w;

                elseViewState.elseTopHorizontalLine.length = diffIfWidthWithHeadWidth + viewState.offSetBetweenIfElse + (elseWidth / 2);
                elseViewState.elseBottomHorizontalLine.length = elseViewState.ifHeadWidthOffset +
                    diffIfWidthWithHeadWidth + viewState.offSetBetweenIfElse + (elseWidth / 2);
            } else if (node.elseBody.elseBody.kind === "IfElseStatement") {
                const elseIfStmt: IfElseStatement = node.elseBody.elseBody as IfElseStatement;
                const elseIfViewState: IfViewState = elseIfStmt.viewState as IfViewState;
                const elseIfBodyViewState: BlockViewState = elseIfStmt.ifBody.viewState;
                elseIfViewState.elseIfHeadWidthOffset = elseIfViewState.headIf.w / 2;
                elseIfViewState.elseIfHeadHeightOffset = elseIfViewState.headIf.h / 2;

                elseIfViewState.elseIfLifeLine.h = elseIfViewState.bBox.h - elseIfViewState.headIf.h;

                let diffElseIfWidthWithHeadWidth = 0;
                if (elseIfBodyViewState.bBox.w > elseIfViewState.headIf.w) {
                    diffElseIfWidthWithHeadWidth = (elseIfBodyViewState.bBox.w / 2) - (elseIfViewState.headIf.w / 2);
                }

                elseWidth = elseIfViewState.bBox.w;
                elseIfViewState.elseIfTopHorizontalLine.length = diffIfWidthWithHeadWidth + elseIfViewState.offSetBetweenIfElse + diffElseIfWidthWithHeadWidth;
                elseIfViewState.elseIfBottomHorizontalLine.length = (viewState.headIf.w / 2) + diffIfWidthWithHeadWidth + elseIfViewState.offSetBetweenIfElse
                    + diffElseIfWidthWithHeadWidth + (elseIfViewState.headIf.w / 2);

                elseIfViewState.childElseIfViewState.forEach((childViewState: IfViewState) => {
                    viewState.childElseIfViewState.push(childViewState)
                });
                // Add child`s else if view state to the parent
                viewState.childElseIfViewState.push(elseIfViewState);
            }

            // identifying the final else or else-if statement
            if (!viewState.isElseIf) {
                const elseIfViewStateChildren: IfViewState[] = viewState.childElseIfViewState;
                if (elseIfViewStateChildren?.length > 0) {
                    let maxHeight: number = elseIfViewStateChildren[0].elseIfLifeLine.h;
                    for (let i = 1; i < elseIfViewStateChildren.length; i++) {
                        if (maxHeight < elseIfViewStateChildren[i].elseIfLifeLine.h) {
                            maxHeight = elseIfViewStateChildren[i].elseIfLifeLine.h;
                        }
                    }

                    // setting if line height
                    if (maxHeight < (ifBodyViewState.bBox.h + (2 * DefaultConfig.offSet))) {
                        maxHeight = ifBodyViewState.bBox.h + (2 * DefaultConfig.offSet);
                    } else {
                        ifBodyViewState.bBox.length += maxHeight - ifBodyViewState.bBox.h - (2 * DefaultConfig.offSet);
                    }

                    // setting if and else line height
                    const childElseViewState: ElseViewState = elseIfViewStateChildren[0]?.childElseViewState as ElseViewState;
                    if (childElseViewState && (maxHeight < (childElseViewState.bBox.h + (2 * DefaultConfig.offSet)))) {
                        maxHeight = childElseViewState.bBox.h + (2 * DefaultConfig.offSet);
                        ifBodyViewState.bBox.length = maxHeight;
                    } else if (childElseViewState && (maxHeight > childElseViewState.bBox.h)) {
                        childElseViewState.elseBody.length = maxHeight + (IFELSE_SVG_HEIGHT / 2);
                    }

                    // updating the heights with max height in else-ifs
                    for (const elseIfChild of elseIfViewStateChildren) {
                        elseIfChild.elseIfLifeLine.h = maxHeight;
                    }
                }
            }

        } else {
            const defaultElseVS: ElseViewState = viewState.defaultElseVS as ElseViewState;
            defaultElseVS.elseBody.length = viewState.headIf.offsetFromBottom + defaultElseVS.ifHeadHeightOffset +
                ifBodyViewState.bBox.h + viewState.verticalOffset;
            elseWidth = defaultElseVS.bBox.w;
            defaultElseVS.elseTopHorizontalLine.length = viewState.offSetBetweenIfElse + diffIfWidthWithHeadWidth;
            defaultElseVS.elseBottomHorizontalLine.length = defaultElseVS.ifHeadWidthOffset +
                diffIfWidthWithHeadWidth + viewState.offSetBetweenIfElse;
            viewState.childElseViewState = defaultElseVS;
        }

        // Calculate whole if/else statement width and height
        viewState.bBox.h = viewState.headIf.h + ifBodyViewState.bBox.length;
        viewState.bBox.w = ((viewState.headIf.w / 2) + diffIfWidthWithHeadWidth + viewState.offSetBetweenIfElse + (elseWidth)) * 2;
    }

    private sizeStatement(node: STNode) {
        const viewState: StatementViewState = node.viewState;
        if ((viewState.isAction || viewState.isEndpoint) && !viewState.isCallerAction) {
            if (viewState.isAction && viewState.action.endpointName && !viewState.hidden) {
                viewState.bBox.h = CLIENT_SVG_HEIGHT;
                viewState.bBox.w = CLIENT_SVG_WIDTH;
                viewState.bBox.r = CLIENT_RADIUS;
            }

            if (viewState.isEndpoint && viewState.endpoint.epName) {
                const endpointViewState: EndpointViewState = viewState.endpoint;
                endpointViewState.bBox.w = DefaultConfig.connectorStart.width;
                endpointViewState.lifeLine.h = DefaultConfig.connectorLine.height;

                // Update the endpoint sizing values in allEndpoint map.
                const endpoint: Endpoint = allEndpoints.get(viewState.endpoint.epName);
                const visibleEndpoint: any = endpoint.visibleEndpoint;
                const mainEp = endpointViewState;
                mainEp.isUsed = false;
                visibleEndpoint.viewState = mainEp;
            }
        } else {
            if (viewState.isCallerAction) {
                viewState.bBox.h = RESPOND_SVG_HEIGHT;
                viewState.bBox.w = RESPOND_SVG_WIDTH;
            } else {
                viewState.dataProcess.h = PROCESS_SVG_HEIGHT;
                viewState.dataProcess.w = PROCESS_SVG_WIDTH;
                viewState.bBox.h = viewState.dataProcess.h;
                viewState.bBox.w = viewState.dataProcess.w;
            }
        }
    }

    private beginSizingBlock(node: BlockStatement) {
        const blockViewState: BlockViewState = node.viewState;
        let index: number = 0;
        node.statements.forEach((element) => {
            const stmtViewState: StatementViewState = element.viewState;
            const plusForIndex: PlusViewState = getPlusViewState(index, blockViewState.plusButtons);

            if (plusForIndex && plusForIndex.collapsedClicked) {
                // setting up collapse view once the collapse button is clicked
                const collapsedView = new CollapseViewState();
                blockViewState.collapseView = collapsedView;
                blockViewState.collapsedFrom = index;
                stmtViewState.collapsed = true;
            } else if (blockViewState.collapsed
                || (blockViewState.collapsedFrom <= index && blockViewState.collapseView)) {
                stmtViewState.collapsed = true;
            } else if (!blockViewState.collapsed
                || (blockViewState.collapsedFrom <= index && blockViewState.collapseView)) {
                stmtViewState.collapsed = false;
            }

            if (isSTActionInvocation(element)) { // check if it's the same as actioninvocation
                stmtViewState.isAction = true;
            }
            ++index;
        });

        // add END component dimensions for return statement
        if (blockViewState.isEndComponentAvailable && !blockViewState.collapseView &&
            !blockViewState.isEndComponentInMain) {
            const returnViewState: StatementViewState = node.statements[node.statements.length - 1].viewState;
            returnViewState.bBox.h = STOP_SVG_HEIGHT;
            returnViewState.bBox.w = STOP_SVG_WIDTH;
        }
    }

    private endSizingBlock(node: BlockStatement) {
        const blockViewState: BlockViewState = node.viewState;
        let height = 0;
        let width = 0;
        let index = 0;

        // Add last plus button.
        const plusViewState: PlusViewState = getPlusViewState(node.statements.length, blockViewState.plusButtons);

        if (plusViewState && plusViewState.draftAdded) {
            const draft: DraftStatementViewState = new DraftStatementViewState();
            draft.type = plusViewState.draftAdded;
            draft.subType = plusViewState.draftSubType;
            draft.connector = plusViewState.draftConnector;
            draft.targetPosition = {
                line: node.position.endLine, // todo: can't find the equivalent to position
                column: node.position.endColumn - 1
            };
            blockViewState.draft = [node.statements.length, draft];
            plusViewState.draftAdded = undefined;
        } else if (plusViewState && plusViewState.expanded) {
            if (plusViewState.selectedComponent === "STATEMENT") {
                height += PLUS_HOLDER_STATEMENT_HEIGHT;
            } else if (plusViewState.selectedComponent === "APIS") {
                height += PLUS_HOLDER_API_HEIGHT;
            }
            if (width < PLUS_HOLDER_WIDTH) {
                width = PLUS_HOLDER_WIDTH;
            }
        } else if (plusViewState?.collapsedClicked) {
            plusViewState.index = node.statements.length;
            plusViewState.expanded = false;
        } else if (plusViewState && plusViewState.collapsedPlusDuoExpanded) {
            height += PLUS_SVG_HEIGHT;
        } else if (!plusViewState && !blockViewState.isEndComponentAvailable) {
            const plusBtnViewBox: PlusViewState = new PlusViewState();
            plusBtnViewBox.index = node.statements.length;
            plusBtnViewBox.expanded = false;
            plusBtnViewBox.isLast = true;
            blockViewState.plusButtons.push(plusBtnViewBox);
        }

        node.statements.forEach((element) => {
            const stmtViewState: StatementViewState = element.viewState;
            const plusForIndex: PlusViewState = getPlusViewState(index, blockViewState.plusButtons);
            if (!blockViewState.collapsed) {
                // This captures the collapsed statement
                if (blockViewState.collapsedFrom === index && blockViewState.collapseView) {
                    // This captures the collapse button click
                    if (plusForIndex && plusForIndex.collapsedClicked) {
                        const collapsedView = blockViewState.collapseView;
                        collapsedView.bBox.h = collapsedView.bBox.offsetFromTop + COLLAPSE_SVG_HEIGHT_WITH_SHADOW + collapsedView.bBox.offsetFromBottom;
                        collapsedView.bBox.w = COLLAPSE_SVG_WIDTH_WITH_SHADOW;
                        height += collapsedView.bBox.h;
                        if (width < collapsedView.bBox.w) {
                            width = collapsedView.bBox.w;
                        }
                        blockViewState.collapseView = collapsedView;
                        // to make the next plus invisible if the current statement is not the last statement
                        if ((stmtViewState.isEndpoint && stmtViewState.isAction) || (!stmtViewState.isEndpoint)) {
                            for (const invisiblePlusIndex of blockViewState.plusButtons) {
                                if (invisiblePlusIndex.index > index && invisiblePlusIndex.index !== node.statements.length) {
                                    invisiblePlusIndex.visible = false;
                                }
                            }
                        }
                        plusForIndex.collapsedClicked = false;
                    } else {
                        height += blockViewState.collapseView.bBox.h;
                        // updates the width if the block collapse view width the higher
                        if (width < blockViewState.collapseView.bBox.w) {
                            width = blockViewState.collapseView.bBox.w;
                        }
                        // Adding the height and width for collapsed duo click in a collapsed scenario
                        if (plusForIndex && !plusForIndex.collapsedClicked) {
                            if (plusForIndex && plusForIndex.draftAdded) {
                                const draft: DraftStatementViewState = new DraftStatementViewState();
                                draft.type = plusForIndex.draftAdded;
                                draft.subType = plusForIndex.draftSubType;
                                draft.connector = plusForIndex.draftConnector;

                                draft.targetPosition = {
                                    line: element.position.startLine, // todo: position?
                                    column: element.position.startColumn
                                };
                                blockViewState.draft = [index, draft];
                                plusForIndex.draftAdded = undefined;
                            } else if (plusForIndex?.collapsedPlusDuoExpanded) {
                                height += PLUS_SVG_HEIGHT;
                                if (width < PLUS_SVG_WIDTH) {
                                    width = PLUS_SVG_WIDTH;
                                }
                            } else if (plusForIndex?.expanded) {
                                if (plusForIndex.selectedComponent === "STATEMENT") {
                                    height += PLUS_HOLDER_STATEMENT_HEIGHT;
                                } else if (plusForIndex.selectedComponent === "APIS") {
                                    height += PLUS_HOLDER_API_HEIGHT;
                                }
                                if (width < PLUS_HOLDER_WIDTH) {
                                    width = PLUS_HOLDER_WIDTH;
                                }
                            }
                        }
                    }
                    // To handle collapses above the current statement where it has a collapse view
                } else if (blockViewState.collapsedFrom < index && blockViewState.collapseView) {
                    // TODO: revisit this logic as this might not be needed and it might be wrong.
                    // Adding the height and width for collapsed duo click in a collapsed scenario
                    if (plusForIndex && !plusForIndex.collapsedClicked) {
                        if (plusForIndex?.collapsedPlusDuoExpanded) {
                            height += PLUS_SVG_HEIGHT;
                            if (width < PLUS_SVG_WIDTH) {
                                width = PLUS_SVG_WIDTH;
                            }
                        } else if (plusForIndex?.expanded) {
                            if (plusForIndex.selectedComponent === "STATEMENT") {
                                height += PLUS_HOLDER_STATEMENT_HEIGHT;
                            } else if (plusForIndex.selectedComponent === "APIS") {
                                height += PLUS_HOLDER_API_HEIGHT;
                            }
                            if (width < PLUS_HOLDER_WIDTH) {
                                width = PLUS_HOLDER_WIDTH;
                            }
                        }
                    }
                } else {
                    if (plusForIndex && plusForIndex.draftAdded) {
                        const draft: DraftStatementViewState = new DraftStatementViewState();
                        draft.type = plusForIndex.draftAdded;
                        draft.subType = plusForIndex.draftSubType;
                        draft.connector = plusForIndex.draftConnector;

                        draft.targetPosition = {
                            line: element.position.startLine, // todo:position?
                            column: element.position.startColumn
                        };
                        blockViewState.draft = [index, draft];
                        plusForIndex.draftAdded = undefined;
                    } else if (plusForIndex && plusForIndex.expanded) {
                        if (plusForIndex.selectedComponent === "STATEMENT") {
                            height += PLUS_HOLDER_STATEMENT_HEIGHT;
                        } else if (plusForIndex.selectedComponent === "APIS") {
                            height += PLUS_HOLDER_API_HEIGHT;
                        }
                        if (width < PLUS_HOLDER_WIDTH) {
                            width = PLUS_HOLDER_WIDTH;
                        }
                    } else if (plusForIndex && plusForIndex.collapsedPlusDuoExpanded) {
                        height += PLUS_SVG_HEIGHT;
                        if (width < PLUS_SVG_WIDTH) {
                            width = PLUS_SVG_WIDTH;
                        }
                    } else if (!plusForIndex && (!stmtViewState.isEndpoint
                        || (stmtViewState.isAction && stmtViewState.isEndpoint && !stmtViewState.hidden))) {
                        const plusBtnViewState: PlusViewState = new PlusViewState();
                        plusBtnViewState.index = index;
                        plusBtnViewState.expanded = false;
                        blockViewState.plusButtons.push(plusBtnViewState);
                    }

                    if ((stmtViewState.isEndpoint && stmtViewState.isAction && !stmtViewState.hidden) ||
                        (!stmtViewState.isEndpoint && !stmtViewState.collapsed)) {
                        // Excluding return statement heights which is in the main function block
                        if (!(blockViewState.isEndComponentInMain && (index === node.statements.length - 1))) {
                            stmtViewState.bBox.h = stmtViewState.bBox.offsetFromTop + stmtViewState.bBox.h +
                                stmtViewState.bBox.offsetFromBottom;
                            height += stmtViewState.bBox.h;
                        }
                    }

                    if ((width < stmtViewState.bBox.w) && !stmtViewState.collapsed) {
                        width = stmtViewState.bBox.w;
                    }
                }
            }

            if (blockViewState.draft && blockViewState.draft[0] === index) {
                // Get the draft.
                const draft = blockViewState.draft[1];
                if (draft) {
                    const { h, w } = getDraftComponentSizes(draft.type, draft.subType);
                    draft.bBox.h = draft.bBox.offsetFromTop + h + draft.bBox.offsetFromBottom;
                    draft.bBox.w = w;
                    height += draft.bBox.h;
                    if (width < draft.bBox.w) {
                        width = draft.bBox.w;
                    }
                }
            }

            ++index;
        });

        if (blockViewState.draft && blockViewState.draft[0] === node.statements.length) {
            // Get the draft.
            const draft = blockViewState.draft[1];
            if (draft) {
                const { h, w } = getDraftComponentSizes(draft.type, draft.subType);
                draft.bBox.h = draft.bBox.offsetFromTop + h + draft.bBox.offsetFromBottom
                draft.bBox.w = w;
                height += draft.bBox.h;
                if (width < draft.bBox.w) {
                    width = draft.bBox.w;
                }
            }
        }

        if (height > 0) {
            blockViewState.bBox.h = height;
        }

        if (width > 0) {
            blockViewState.bBox.w = width;
        }
    }
}

export const visitor = new SizingVisitor();
