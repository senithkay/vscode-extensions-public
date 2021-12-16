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
    DoStatement,
    ExpressionFunctionBody,
    ForeachStatement,
    FunctionBodyBlock,
    FunctionDefinition,
    IfElseStatement,
    ListenerDeclaration,
    LocalVarDecl,
    ModulePart,
    ModuleVarDecl,
    ObjectMethodDefinition,
    OnFailClause,
    ResourceAccessorDefinition,
    ServiceDeclaration,
    STKindChecker,
    STNode,
    TypeDefinition,
    Visitor, WhileStatement
} from "@wso2-enterprise/syntax-tree";

import { isVarTypeDescriptor } from "../../../utils/diagram-util";
import expandTracker from "../../../utils/expand-tracker";
import { Endpoint, getDraftComponentSizes, getPlusViewState, haveBlockStatement, isSTActionInvocation } from "../../../utils/st-util";
import { DefaultConfig } from "../../../visitors/default";
import { EXISTING_PLUS_HOLDER_API_HEIGHT, EXISTING_PLUS_HOLDER_API_HEIGHT_COLLAPSED, PLUS_HOLDER_API_HEIGHT, PLUS_HOLDER_API_HEIGHT_COLLAPSED, PLUS_HOLDER_STATEMENT_HEIGHT, PLUS_HOLDER_WIDTH } from "../Components/DialogBoxes/PlusHolder/PlusElements";
import { PLUS_SVG_HEIGHT, PLUS_SVG_WIDTH } from "../Components/PlusButtons/Plus/PlusAndCollapse/PlusSVG";
import { TRIGGER_RECT_SVG_HEIGHT, TRIGGER_RECT_SVG_WIDTH } from "../Components/RenderingComponents/ActionInvocation/TriggerSVG";
import { ASSIGNMENT_NAME_WIDTH } from "../Components/RenderingComponents/Assignment";
import { COLLAPSE_SVG_HEIGHT_WITH_SHADOW, COLLAPSE_SVG_WIDTH_WITH_SHADOW } from "../Components/RenderingComponents/Collapse/CollapseSVG";
import { CLIENT_RADIUS, CLIENT_SVG_HEIGHT, CLIENT_SVG_WIDTH } from "../Components/RenderingComponents/Connector/ConnectorHeader/ConnectorClientSVG";
import { STOP_SVG_HEIGHT, STOP_SVG_WIDTH } from "../Components/RenderingComponents/End/StopSVG";
import { FOREACH_SVG_HEIGHT, FOREACH_SVG_WIDTH } from "../Components/RenderingComponents/ForEach/ForeachSVG";
import { COLLAPSE_DOTS_SVG_HEIGHT } from "../Components/RenderingComponents/ForEach/ThreeDotsSVG";
import { IFELSE_SVG_HEIGHT, IFELSE_SVG_WIDTH } from "../Components/RenderingComponents/IfElse/IfElseSVG";
import { LISTENER_HEIGHT, LISTENER_WIDTH } from "../Components/RenderingComponents/Listener/ListenerSVG";
import { MIN_MODULE_VAR_WIDTH, MODULE_VAR_HEIGHT } from "../Components/RenderingComponents/ModuleVariable";
import { PROCESS_SVG_HEIGHT, PROCESS_SVG_WIDTH, PROCESS_SVG_WIDTH_WITH_HOVER_SHADOW } from "../Components/RenderingComponents/Processor/ProcessSVG";
import { RESPOND_SVG_HEIGHT, RESPOND_SVG_WIDTH } from "../Components/RenderingComponents/Respond/RespondSVG";
import { RETURN_SVG_HEIGHT, RETURN_SVG_WIDTH } from "../Components/RenderingComponents/Return/ReturnSVG";
import { DEFAULT_SERVICE_WIDTH } from "../Components/RenderingComponents/Service";
import { SERVICE_HEADER_HEIGHT } from "../Components/RenderingComponents/Service/ServiceHeader";
import { START_SVG_HEIGHT, START_SVG_WIDTH } from "../Components/RenderingComponents/Start/StartSVG";
import { VARIABLE_NAME_WIDTH } from "../Components/RenderingComponents/VariableName";
import { WHILE_SVG_HEIGHT, WHILE_SVG_WIDTH } from "../Components/RenderingComponents/While/WhileSVG";
import { getNodeSignature } from "../Utils";
import { BlockViewState, CollapseViewState, CompilationUnitViewState, DoViewState, ElseViewState, ForEachViewState, FunctionViewState, IfViewState, OnErrorViewState, PlusViewState, StatementViewState } from "../ViewState";
import { DraftStatementViewState } from "../ViewState/draft";
import { ModuleMemberViewState } from "../ViewState/module-member";
import { ServiceViewState } from "../ViewState/service";
import { WhileViewState } from "../ViewState/while";

let allEndpoints: Map<string, Endpoint> = new Map<string, Endpoint>();

class SizingVisitor implements Visitor {

    public endVisitSTNode(node: STNode, parent?: STNode) {
        if (!node.viewState) {
            return;
        }
        this.sizeStatement(node);
    }

    public beginVisitModulePart(node: ModulePart, parent?: STNode) {
        const viewState: CompilationUnitViewState = node.viewState;
        node.members.forEach((member, i) => {
            const plusViewState: PlusViewState = getPlusViewState(i, viewState.plusButtons);
            if (!plusViewState) {
                const plusBtnViewBox: PlusViewState = new PlusViewState();
                plusBtnViewBox.index = i;
                plusBtnViewBox.expanded = false;
                plusBtnViewBox.isLast = true;
                viewState.plusButtons.push(plusBtnViewBox);
            }
        });

        const lastPlusViewState: PlusViewState = getPlusViewState(node.members.length, viewState.plusButtons);
        if (!lastPlusViewState) {
            const plusBtnViewBox: PlusViewState = new PlusViewState();
            plusBtnViewBox.index = node.members.length;
            plusBtnViewBox.expanded = false;
            plusBtnViewBox.isLast = true;
            viewState.plusButtons.push(plusBtnViewBox);
        }
    }

    public endVisitModulePart(node: ModulePart) {
        const viewState: CompilationUnitViewState = node.viewState;
        if (node.members.length === 0) { // if the bal file is empty.
            viewState.trigger.h = START_SVG_HEIGHT;
            viewState.trigger.w = START_SVG_WIDTH;

            viewState.bBox.h = DefaultConfig.canvas.height;
            viewState.bBox.w = DefaultConfig.canvas.width;
        } else {
            let height: number = 0;
            let width: number = 0;

            node.members.forEach(member => {
                const memberVS = member.viewState as any;
                if (memberVS) {
                    height = memberVS.bBox.h;

                    if (memberVS.bBox.w > width) {
                        width = memberVS.bBox.w
                    }
                }

                if (memberVS.precedingPlus) {
                    viewState.plusButtons.push(memberVS.precedingPlus);
                }
            });

            viewState.bBox.h = height;
            viewState.bBox.w = width;
        }
    }

    public beginVisitListenerDeclaration(node: ListenerDeclaration) {
        if (node.viewState) {
            const viewState = node.viewState as ModuleMemberViewState;
            viewState.bBox.w = LISTENER_WIDTH;
            viewState.bBox.h = LISTENER_HEIGHT;
        }
    }

    public beginVisitModuleVarDecl(node: ModuleVarDecl) {
        const viewState = node.viewState as ModuleMemberViewState;
        viewState.bBox.w = MIN_MODULE_VAR_WIDTH;
        viewState.bBox.h = MODULE_VAR_HEIGHT;
    }

    public beginVisitTypeDefinition(node: TypeDefinition) {
        const viewState = node.viewState as ModuleMemberViewState;
    }

    private beginFunctionTypeNode(node: ResourceAccessorDefinition | FunctionDefinition) {
        const viewState: FunctionViewState = node.viewState as FunctionViewState;
        const body: FunctionBodyBlock = node.functionBody as FunctionBodyBlock;
        const bodyViewState: BlockViewState = body.viewState;

        viewState.wrapper.h = viewState.topOffset + viewState.wrapper.offsetFromTop;
        viewState.bBox.h = viewState.topOffset + viewState.wrapper.offsetFromTop;

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

    public beginVisitFunctionDefinition(node: FunctionDefinition) {
        const viewState: FunctionViewState = node.viewState as FunctionViewState;
        const body: FunctionBodyBlock = node.functionBody as FunctionBodyBlock;
        const bodyViewState: BlockViewState = body.viewState;
        viewState.collapsed = !expandTracker.isExpanded(getNodeSignature(node));

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

    public beginVisitServiceDeclaration(node: ServiceDeclaration, parent?: STNode) {
        const viewState: ServiceViewState = node.viewState;
        viewState.collapsed = !expandTracker.isExpanded(getNodeSignature(node));
        // setting up service lifeline initial height

        node.members.forEach((member, i) => {
            const plusViewState: PlusViewState = getPlusViewState(i, viewState.plusButtons);
            if (!plusViewState) {
                const plusBtnViewBox: PlusViewState = new PlusViewState();
                plusBtnViewBox.index = i;
                plusBtnViewBox.expanded = false;
                plusBtnViewBox.isLast = true;
                viewState.plusButtons.push(plusBtnViewBox);
            }
        });

        const lastPlusViewState: PlusViewState = getPlusViewState(node.members.length, viewState.plusButtons);
        if (!lastPlusViewState) {
            const plusBtnViewBox: PlusViewState = new PlusViewState();
            plusBtnViewBox.index = node.members.length;
            plusBtnViewBox.expanded = false;
            plusBtnViewBox.isLast = true;
            viewState.plusButtons.push(plusBtnViewBox);
        }
    }

    public endVisitServiceDeclaration(node: ServiceDeclaration, parent?: STNode) {
        const viewState: ServiceViewState = node.viewState;
        let height: number = 0;
        let width: number = 0;

        node.members.forEach(member => {
            const memberVS = member.viewState;

            if (memberVS) {
                height += memberVS.bBox.h;

                if (memberVS.bBox.w > width) {
                    width = memberVS.bBox.w;
                }
            }
        });

        // node.members.forEach(mem)

        viewState.bBox.w = width + DefaultConfig.serviceFrontPadding + DefaultConfig.serviceRearPadding;
        if (viewState.bBox.w < DEFAULT_SERVICE_WIDTH) {
            viewState.bBox.w = DEFAULT_SERVICE_WIDTH;
        }
        viewState.bBox.h = height + viewState.plusButtons.length * DefaultConfig.serviceMemberSpacing * 2
            + DefaultConfig.serviceVerticalPadding + SERVICE_HEADER_HEIGHT; // memberHeights + plusbutton gap between
    }

    public beginVisitResourceAccessorDefinition(node: ResourceAccessorDefinition) {
        // this.beginFunctionTypeNode(node);
        const viewState: FunctionViewState = node.viewState as FunctionViewState;
        const body: FunctionBodyBlock = node.functionBody as FunctionBodyBlock;
        const bodyViewState: BlockViewState = body.viewState;
        viewState.collapsed = !expandTracker.isExpanded(getNodeSignature(node));

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

    public endVisitResourceAccessorDefinition(node: ResourceAccessorDefinition) {
        const viewState: FunctionViewState = node.viewState as FunctionViewState;
        const body: FunctionBodyBlock = node.functionBody as FunctionBodyBlock;
        const bodyViewState: BlockViewState = body.viewState;
        const lifeLine = viewState.workerLine;
        const trigger = viewState.trigger;
        const end = viewState.end;

        trigger.h = START_SVG_HEIGHT;
        trigger.w = START_SVG_WIDTH;

        end.bBox.w = STOP_SVG_WIDTH;
        end.bBox.h = STOP_SVG_HEIGHT;

        lifeLine.h = trigger.offsetFromBottom + bodyViewState.bBox.h;

        if (STKindChecker.isExpressionFunctionBody(body) || body.statements.length > 0) {
            lifeLine.h += end.bBox.offsetFromTop;
        }

        viewState.bBox.h = lifeLine.h + trigger.h + end.bBox.h + DefaultConfig.serviceVerticalPadding * 2 + DefaultConfig.functionHeaderHeight;
        viewState.bBox.w = (trigger.w > bodyViewState.bBox.w ? trigger.w : bodyViewState.bBox.w) + DefaultConfig.serviceFrontPadding + DefaultConfig.serviceRearPadding + allEndpoints.size * 150 * 2;

        if (viewState.initPlus && viewState.initPlus.selectedComponent === "PROCESS") {
            viewState.bBox.h += PLUS_HOLDER_STATEMENT_HEIGHT;
            if (viewState.bBox.w < PLUS_HOLDER_WIDTH) {
                viewState.bBox.w = PLUS_HOLDER_WIDTH;
            }
        }
    }

    public beginVisitObjectMethodDefinition(node: ObjectMethodDefinition) {
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

    private endVisitFunctionTypeNode(node: FunctionDefinition) {
        const viewState: FunctionViewState = node.viewState as FunctionViewState;
        const body: FunctionBodyBlock = node.functionBody as FunctionBodyBlock;
        const bodyViewState: BlockViewState = body.viewState;
        const lifeLine = viewState.workerLine;
        const trigger = viewState.trigger;
        const end = viewState.end;

        trigger.h = START_SVG_HEIGHT;
        trigger.w = START_SVG_WIDTH;

        end.bBox.w = STOP_SVG_WIDTH;
        end.bBox.h = STOP_SVG_HEIGHT;

        lifeLine.h = trigger.offsetFromBottom + bodyViewState.bBox.h;

        if (STKindChecker.isExpressionFunctionBody(body) || body.statements.length > 0) {
            lifeLine.h += end.bBox.offsetFromTop;
        }

        // adding end component height and + (plus) height for a resource
        viewState.bBox.h += (lifeLine.h + end.bBox.h + (DefaultConfig.dotGap * 3) +
            viewState.bottomOffset + viewState.wrapper.offsetFromBottom);

        // setting default width with there are no statements in the function
        const defaultWidth = (PROCESS_SVG_WIDTH + VARIABLE_NAME_WIDTH + ASSIGNMENT_NAME_WIDTH);

        viewState.bBox.w = (trigger.w > bodyViewState.bBox.w ? trigger.w : bodyViewState.bBox.w);
        if (viewState.bBox.w < defaultWidth) {
            viewState.bBox.w = defaultWidth;
        }

        viewState.wrapper.h = viewState.bBox.h;

        if (viewState.initPlus && viewState.initPlus.selectedComponent === "PROCESS") {
            viewState.bBox.h += PLUS_HOLDER_STATEMENT_HEIGHT;
            if (viewState.bBox.w < PLUS_HOLDER_WIDTH) {
                viewState.bBox.w = PLUS_HOLDER_WIDTH;
            }
        }
    }

    public endVisitFunctionDefinition(node: FunctionDefinition) {
        // replaces endVisitFunction
        const viewState: FunctionViewState = node.viewState as FunctionViewState;
        const body: FunctionBodyBlock = node.functionBody as FunctionBodyBlock;
        const bodyViewState: BlockViewState = body.viewState;
        const lifeLine = viewState.workerLine;
        const trigger = viewState.trigger;
        const end = viewState.end;

        trigger.h = START_SVG_HEIGHT;
        trigger.w = START_SVG_WIDTH;

        end.bBox.w = STOP_SVG_WIDTH;
        end.bBox.h = STOP_SVG_HEIGHT;

        lifeLine.h = trigger.offsetFromBottom + bodyViewState.bBox.h;

        if (STKindChecker.isExpressionFunctionBody(body) || body.statements.length > 0) {
            lifeLine.h += end.bBox.offsetFromTop;
        }

        viewState.bBox.h = lifeLine.h + trigger.h + end.bBox.h + DefaultConfig.serviceVerticalPadding * 2 + DefaultConfig.functionHeaderHeight;
        viewState.bBox.w = (trigger.w > bodyViewState.bBox.w ? trigger.w : bodyViewState.bBox.w)
            + DefaultConfig.serviceFrontPadding + DefaultConfig.serviceRearPadding + allEndpoints.size * 150 * 2;

        if (viewState.initPlus && viewState.initPlus.selectedComponent === "PROCESS") {
            viewState.bBox.h += PLUS_HOLDER_STATEMENT_HEIGHT;
            if (viewState.bBox.w < PLUS_HOLDER_WIDTH) {
                viewState.bBox.w = PLUS_HOLDER_WIDTH;
            }
        }
    }

    public endVisitObjectMethodDefinition(node: ObjectMethodDefinition) {
        const viewState: FunctionViewState = node.viewState as FunctionViewState;
        const body: FunctionBodyBlock = node.functionBody as FunctionBodyBlock;
        const bodyViewState: BlockViewState = body.viewState;
        const lifeLine = viewState.workerLine;
        const trigger = viewState.trigger;
        const end = viewState.end;

        trigger.h = START_SVG_HEIGHT;
        trigger.w = START_SVG_WIDTH;

        end.bBox.w = STOP_SVG_WIDTH;
        end.bBox.h = STOP_SVG_HEIGHT;

        lifeLine.h = trigger.offsetFromBottom + bodyViewState.bBox.h;

        if (STKindChecker.isExpressionFunctionBody(body) || body.statements.length > 0) {
            lifeLine.h += end.bBox.offsetFromTop;
        }

        viewState.bBox.h = lifeLine.h + trigger.h + end.bBox.h + DefaultConfig.serviceVerticalPadding * 2 + DefaultConfig.functionHeaderHeight;
        viewState.bBox.w = (trigger.w > bodyViewState.bBox.w ? trigger.w : bodyViewState.bBox.w)
            + DefaultConfig.serviceFrontPadding + DefaultConfig.serviceRearPadding + allEndpoints.size * 150 * 2;

        if (viewState.initPlus && viewState.initPlus.selectedComponent === "PROCESS") {
            viewState.bBox.h += PLUS_HOLDER_STATEMENT_HEIGHT;
            if (viewState.bBox.w < PLUS_HOLDER_WIDTH) {
                viewState.bBox.w = PLUS_HOLDER_WIDTH;
            }
        }
    }

    public beginVisitFunctionBodyBlock(node: FunctionBodyBlock) {
        const viewState: BlockViewState = node.viewState;
        if (node.statements.length > 0 && STKindChecker.isReturnStatement(node.statements[node.statements.length - 1])) {
            viewState.isEndComponentInMain = true;
        }
        this.beginSizingBlock(node);
        allEndpoints = viewState.connectors;
    }

    public beginVisitExpressionFunctionBody(node: ExpressionFunctionBody) {
        const viewState: BlockViewState = node.viewState;
        allEndpoints = viewState.connectors;
        viewState.isEndComponentInMain = true;
    }

    public endVisitExpressionFunctionBody(node: ExpressionFunctionBody) {
        // TODO: Work on this after proper design review for showing expression bodied functions.
    }

    public endVisitFunctionBodyBlock(node: FunctionBodyBlock) {
        this.endSizingBlock(node);
    }

    public beginVisitBlockStatement(node: BlockStatement, parent?: STNode) {
        if (STKindChecker.isFunctionBodyBlock(parent) || STKindChecker.isBlockStatement(parent)) {
            this.sizeStatement(node);
        } else {
            this.beginSizingBlock(node);
        }
    }

    public endVisitBlockStatement(node: BlockStatement, parent?: STNode) {
        if (STKindChecker.isFunctionBodyBlock(parent) || STKindChecker.isBlockStatement(parent)) {
            this.sizeStatement(node);
        } else {
            this.endSizingBlock(node);
        }
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
        viewState.foreachBody = bodyViewState;
        viewState.foreachHead.h = FOREACH_SVG_HEIGHT;
        viewState.foreachHead.w = FOREACH_SVG_WIDTH;

        if (viewState.folded) {
            viewState.foreachLifeLine.h = 0;
            viewState.foreachBodyRect.w = (viewState.foreachBody.bBox.w > 0)
                ? (viewState.foreachHead.w / 2) + DefaultConfig.horizontalGapBetweenComponents
                + DefaultConfig.forEach.emptyHorizontalGap + (DefaultConfig.dotGap * 2)
                : viewState.foreachBody.bBox.w + (DefaultConfig.forEach.emptyHorizontalGap * 2) + (DefaultConfig.dotGap * 2);
            viewState.foreachBodyRect.h = (viewState.foreachHead.h / 2) + DefaultConfig.forEach.offSet +
                COLLAPSE_DOTS_SVG_HEIGHT + DefaultConfig.forEach.offSet;
        } else {
            viewState.foreachLifeLine.h = viewState.foreachHead.offsetFromBottom + viewState.foreachBody.bBox.h;

            viewState.foreachBodyRect.w = (viewState.foreachBody.bBox.w > 0)
                ? viewState.foreachBody.bBox.w + (DefaultConfig.horizontalGapBetweenComponents * 2) + (DefaultConfig.dotGap * 2) + DefaultConfig.forEach.emptyHorizontalGap
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

    public beginVisitWhileStatement(node: WhileStatement) {
        const bodyViewState: BlockViewState = node.whileBody.viewState;
        const viewState: WhileViewState = node.viewState;

        bodyViewState.collapsed = viewState.folded ? viewState.folded : viewState.collapsed;
    }

    public endVisitWhileStatement(node: WhileStatement) {
        // replaces endVisitForeach
        const bodyViewState: BlockViewState = node.whileBody.viewState;
        const viewState: WhileViewState = node.viewState;
        viewState.whileBody = bodyViewState;

        viewState.whileHead.h = WHILE_SVG_HEIGHT;
        viewState.whileHead.w = WHILE_SVG_WIDTH;

        if (viewState.folded) {
            viewState.whileLifeLine.h = 0;
            viewState.whileBodyRect.w = (viewState.whileBody.bBox.w > 0)
                ? (viewState.whileHead.w / 2) + DefaultConfig.horizontalGapBetweenComponents
                + DefaultConfig.forEach.emptyHorizontalGap + DefaultConfig.dotGap
                : viewState.whileBody.bBox.w + (DefaultConfig.forEach.emptyHorizontalGap * 2) + (DefaultConfig.dotGap * 2);
            viewState.whileBodyRect.h = (viewState.whileHead.h / 2) + DefaultConfig.forEach.offSet +
                COLLAPSE_DOTS_SVG_HEIGHT + DefaultConfig.forEach.offSet;
        } else {
            viewState.whileLifeLine.h = viewState.whileHead.offsetFromBottom + viewState.whileBody.bBox.h;

            viewState.whileBodyRect.w = (viewState.whileBody.bBox.w > 0)
                ? viewState.whileBody.bBox.w + (DefaultConfig.horizontalGapBetweenComponents * 2)
                : viewState.whileBody.bBox.w + (DefaultConfig.forEach.emptyHorizontalGap * 2) + (DefaultConfig.dotGap * 2);
            viewState.whileBodyRect.h = (viewState.whileHead.h / 2) +
                viewState.whileLifeLine.h + viewState.whileBodyRect.offsetFromBottom;

            // deducting the svg lifeline height(STOP SVG height and offset) is a end component is there
            if (viewState.whileBody.isEndComponentAvailable) {
                viewState.whileLifeLine.h = viewState.whileLifeLine.h - viewState.whileBodyRect.offsetFromBottom
                    - STOP_SVG_HEIGHT;
            }
        }

        viewState.bBox.h = (viewState.whileHead.h / 2) + viewState.whileBodyRect.h;
        viewState.bBox.w = viewState.whileBodyRect.w;
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
                elseViewState.isElseBlock = true;
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

    public endVisitDoStatement(node: DoStatement) {
        const viewState = node.viewState as DoViewState;
        if (node.viewState && node.viewState.isFirstInFunctionBody) {
            const blockViewState = node.blockStatement.viewState as BlockViewState;
            viewState.container.h = viewState.container.offsetFromTop + blockViewState.bBox.h + viewState.container.offsetFromBottom;
            viewState.container.w = blockViewState.bBox.w + (DefaultConfig.horizontalGapBetweenComponents * 2);

            viewState.bBox.w = viewState.container.w;
            viewState.bBox.h = viewState.container.h;
        } else {
            this.sizeStatement(node);
        }
    }

    public beginVisitOnFailClause(node: OnFailClause) {
        const viewState = node.viewState as OnErrorViewState;
        if (node.viewState && node.viewState.isFirstInFunctionBody) {
            const blockViewState = node.blockStatement.viewState as BlockViewState;
            viewState.header.h = DefaultConfig.onErrorHeader.h;
            viewState.header.w = DefaultConfig.onErrorHeader.w;
            viewState.lifeLine.h = blockViewState.bBox.h;
            viewState.bBox.w = blockViewState.bBox.w + viewState.header.w + DefaultConfig.onErrorHeader.w;
            viewState.bBox.h = blockViewState.bBox.h + viewState.header.h;
        }
    }

    public endVisitOnFailClause(node: OnFailClause) {
        const viewState = node.viewState as OnErrorViewState;
        if (node.viewState && node.viewState.isFirstInFunctionBody) {
            const blockViewState = node.blockStatement.viewState as BlockViewState;
            viewState.lifeLine.h = blockViewState.bBox.h;

            if (blockViewState.isEndComponentAvailable) {
                viewState.lifeLine.h -= (blockViewState.bBox.offsetFromBottom + blockViewState.bBox.offsetFromTop + blockViewState.bBox.offsetFromBottom);
            }

            viewState.bBox.w = blockViewState.bBox.w + viewState.header.w;
            viewState.bBox.h = blockViewState.bBox.h + viewState.header.h;
        }
    }

    private sizeStatement(node: STNode) {
        if (!node.viewState) {
            return;
        }
        const viewState: StatementViewState = node.viewState;
        if ((viewState.isAction || viewState.isEndpoint) && !viewState.isCallerAction) {
            if (viewState.isAction && viewState.action.endpointName && !viewState.hidden) {
                viewState.dataProcess.h = PROCESS_SVG_HEIGHT;
                viewState.dataProcess.w = PROCESS_SVG_WIDTH;
                viewState.variableName.w = VARIABLE_NAME_WIDTH;
                viewState.variableAssignment.w = ASSIGNMENT_NAME_WIDTH;
                viewState.bBox.h = viewState.dataProcess.h;
                viewState.bBox.w = viewState.dataProcess.w + viewState.variableName.w + viewState.variableAssignment.w;
                viewState.action.trigger.w = TRIGGER_RECT_SVG_WIDTH;
                viewState.action.trigger.h = TRIGGER_RECT_SVG_HEIGHT;
            }

            if (viewState.isEndpoint && viewState.endpoint.epName) {

                // Update endpoint sizing values.
                viewState.bBox.h = CLIENT_SVG_HEIGHT;
                viewState.bBox.r = CLIENT_RADIUS;

                if (isVarTypeDescriptor(node)) {
                    // renders process box if the endpoint var type
                    viewState.dataProcess.w = PROCESS_SVG_WIDTH;
                } else {
                    viewState.bBox.w = CLIENT_SVG_WIDTH;
                }
            }
        } else {
            if (viewState.isCallerAction) {
                viewState.bBox.h = RESPOND_SVG_HEIGHT;
                viewState.bBox.w = RESPOND_SVG_WIDTH;
            } else if (STKindChecker.isReturnStatement(node)) {
                viewState.bBox.h = RETURN_SVG_HEIGHT;
                viewState.bBox.w = RETURN_SVG_WIDTH + VARIABLE_NAME_WIDTH + DefaultConfig.textAlignmentOffset;
            } else {
                viewState.dataProcess.h = PROCESS_SVG_HEIGHT;
                viewState.dataProcess.w = PROCESS_SVG_WIDTH;
                viewState.variableName.w = VARIABLE_NAME_WIDTH + DefaultConfig.textAlignmentOffset;
                viewState.variableAssignment.w = ASSIGNMENT_NAME_WIDTH + PROCESS_SVG_WIDTH_WITH_HOVER_SHADOW / 2 + (DefaultConfig.dotGap * 3);
                viewState.bBox.h = viewState.dataProcess.h;
                viewState.bBox.w = viewState.dataProcess.w + viewState.variableName.w + viewState.variableAssignment.w;

                // todo: commented because this is always true
                // if (STKindChecker.isLocalVarDecl) {
                //     const varDeclatarion = node as LocalVarDecl
                // } else {
                //     viewState.bBox.w = viewState.dataProcess.w + viewState.variableAssignment.w;
                // }
            }
        }
    }

    private beginSizingBlock(node: BlockStatement) {
        if (!node.viewState) {
            return;
        }
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

            if (isSTActionInvocation(element)
                && !haveBlockStatement(element)
                && allEndpoints.has(stmtViewState.action.endpointName)
                ) { // check if it's the same as actioninvocation
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
        if (!node.viewState) {
            return;
        }
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
            draft.selectedConnector = plusViewState.draftSelectedConnector;
            draft.targetPosition = {
                startLine: node.position.endLine, // todo: can't find the equivalent to position
                startColumn: node.position.endColumn - 1
            };
            blockViewState.draft = [node.statements.length, draft];
            plusViewState.draftAdded = undefined;
        } else if (plusViewState && plusViewState.expanded) {
            if (plusViewState.selectedComponent === "STATEMENT") {
                height += PLUS_HOLDER_STATEMENT_HEIGHT;
            } else if (plusViewState.selectedComponent === "APIS" && !plusViewState?.isAPICallsExisting) {
                height += PLUS_HOLDER_API_HEIGHT;
            } else if (plusViewState.selectedComponent === "APIS" && plusViewState.isAPICallsExisting) {
                if (plusViewState.isAPICallsExistingCollapsed) {
                    height += EXISTING_PLUS_HOLDER_API_HEIGHT_COLLAPSED;
                } else if (plusViewState.isAPICallsExistingCreateCollapsed) {
                    height += PLUS_HOLDER_API_HEIGHT_COLLAPSED;
                } else {
                    height += EXISTING_PLUS_HOLDER_API_HEIGHT;
                }
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
                        // if ((stmtViewState.isEndpoint && stmtViewState.isAction) || (!stmtViewState.isEndpoint)) {
                        for (const invisiblePlusIndex of blockViewState.plusButtons) {
                            if (invisiblePlusIndex.index > index && invisiblePlusIndex.index !== node.statements.length) {
                                invisiblePlusIndex.visible = false;
                            }
                        }
                        // }

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
                                draft.selectedConnector = plusForIndex.draftSelectedConnector;

                                draft.targetPosition = {
                                    startLine: element.position.startLine, // todo: position?
                                    startColumn: element.position.startColumn
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
                                } else if (plusForIndex.selectedComponent === "APIS" && !plusForIndex?.isAPICallsExisting) {
                                    height += PLUS_HOLDER_API_HEIGHT;
                                } else if (plusForIndex.selectedComponent === "APIS" && plusForIndex.isAPICallsExisting) {
                                    if (plusForIndex.isAPICallsExistingCollapsed) {
                                        height += EXISTING_PLUS_HOLDER_API_HEIGHT_COLLAPSED;
                                    } else if (plusForIndex.isAPICallsExistingCreateCollapsed) {
                                        height += PLUS_HOLDER_API_HEIGHT_COLLAPSED;
                                    } else {
                                        height += EXISTING_PLUS_HOLDER_API_HEIGHT;
                                    }
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
                            } else if (plusForIndex.selectedComponent === "APIS" && !plusForIndex?.isAPICallsExisting) {
                                height += PLUS_HOLDER_API_HEIGHT;
                            } else if (plusForIndex.selectedComponent === "APIS" && plusForIndex.isAPICallsExisting) {
                                if (plusForIndex.isAPICallsExistingCollapsed) {
                                    height += EXISTING_PLUS_HOLDER_API_HEIGHT_COLLAPSED;
                                } else if (plusForIndex.isAPICallsExistingCreateCollapsed) {
                                    height += PLUS_HOLDER_API_HEIGHT_COLLAPSED;
                                } else {
                                    height += EXISTING_PLUS_HOLDER_API_HEIGHT;
                                }
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
                        draft.selectedConnector = plusForIndex.draftSelectedConnector;

                        draft.targetPosition = {
                            startLine: element.position.startLine, // todo:position?
                            startColumn: element.position.startColumn
                        };
                        blockViewState.draft = [index, draft];
                        plusForIndex.draftAdded = undefined;
                    } else if (plusForIndex && plusForIndex.expanded) {
                        if (plusForIndex.selectedComponent === "STATEMENT") {
                            height += PLUS_HOLDER_STATEMENT_HEIGHT;
                        } else if (plusForIndex.selectedComponent === "APIS" && plusForIndex.isAPICallsExisting) {
                            if (plusForIndex.isAPICallsExistingCollapsed) {
                                height += EXISTING_PLUS_HOLDER_API_HEIGHT_COLLAPSED;
                            } else if (plusForIndex.isAPICallsExistingCreateCollapsed) {
                                height += PLUS_HOLDER_API_HEIGHT_COLLAPSED;
                            } else {
                                height += EXISTING_PLUS_HOLDER_API_HEIGHT;
                            }
                        } else if (plusForIndex.selectedComponent === "APIS" && !plusForIndex?.isAPICallsExisting) {
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
                    } else if (!plusForIndex && !stmtViewState.hidden) {
                        const plusBtnViewState: PlusViewState = new PlusViewState();
                        plusBtnViewState.index = index;
                        plusBtnViewState.expanded = false;
                        blockViewState.plusButtons.push(plusBtnViewState);
                    }

                    if ((stmtViewState.isEndpoint && stmtViewState.isAction && !stmtViewState.hidden) ||
                        (!stmtViewState.collapsed)) {
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
