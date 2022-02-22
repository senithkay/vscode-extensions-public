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
    NamedWorkerDeclaration,
    ObjectMethodDefinition,
    OnFailClause,
    ResourceAccessorDefinition,
    ServiceDeclaration,
    STKindChecker,
    STNode,
    TypeDefinition,
    Visitor, WhileStatement
} from "@wso2-enterprise/syntax-tree";
import { debug } from "webpack";

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
import { BlockViewState, CollapseViewState, CompilationUnitViewState, DoViewState, ElseViewState, ForEachViewState, FunctionViewState, IfViewState, OnErrorViewState, PlusViewState, StatementViewState, ViewState } from "../ViewState";
import { DraftStatementViewState } from "../ViewState/draft";
import { ModuleMemberViewState } from "../ViewState/module-member";
import { ServiceViewState } from "../ViewState/service";
import { WhileViewState } from "../ViewState/while";
import { WorkerDeclarationViewState } from "../ViewState/worker-declaration";
import { workerSyncVisitor } from "./worker-sync-visitor";

let allEndpoints: Map<string, Endpoint> = new Map<string, Endpoint>();

export interface AsyncSendInfo {
    to: string;
    node: STNode;
    paired: boolean;
    index: number;
}

export interface AsyncReceiveInfo {
    from: string;
    node: STNode;
    paired: boolean;
    index: number;
}

export interface SendRecievePairInfo {
    sourceName: string;
    sourceNode: STNode;
    sourceIndex: number;
    targetName: string;
    targetNode: STNode;
    targetIndex: number;
}

export const DEFAULT_WORKER_NAME = 'function'; // todo: move to appropriate place.

class SizingVisitor implements Visitor {
    private currentWorker: string[];
    private senderReceiverInfo: Map<string, { sends: AsyncSendInfo[], receives: AsyncReceiveInfo[] }>;
    private workerMap: Map<string, NamedWorkerDeclaration>;

    constructor() {
        this.currentWorker = [];
        this.senderReceiverInfo = new Map();
        this.workerMap = new Map();
    }

    public endVisitSTNode(node: STNode, parent?: STNode) {
        if (!node.viewState) {
            return;
        }
        this.sizeStatement(node);
    }

    public cleanMaps(){
        this.currentWorker = [];
        this.senderReceiverInfo = new Map();
        this.workerMap = new Map();
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

        this.currentWorker.push(DEFAULT_WORKER_NAME);
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

        this.syncAsyncStatements(node);

        if (bodyViewState.hasWorkerDecl) {
            Array.from(this.workerMap.keys()).forEach(key => {
                const workerST = this.workerMap.get(key);
                const workerVS = workerST.viewState as WorkerDeclarationViewState;
                const workerBodyVS = workerST.workerBody.viewState as BlockViewState;
                const workerLifeLine = workerVS.workerLine;
                const workerTrigger = workerVS.trigger;
                this.endVisitBlockStatement(workerST.workerBody, workerST);

                workerLifeLine.h = workerTrigger.offsetFromBottom + workerBodyVS.bBox.h;

                if (!workerBodyVS.isEndComponentAvailable
                    && (STKindChecker.isExpressionFunctionBody(body) || body.statements.length > 0)) {
                    workerLifeLine.h += end.bBox.offsetFromTop;
                }

                workerVS.bBox.h = workerLifeLine.h + workerTrigger.h + end.bBox.h + DefaultConfig.serviceVerticalPadding * 2
                    + DefaultConfig.functionHeaderHeight;
                workerVS.bBox.w = (workerTrigger.w > workerBodyVS.bBox.w ? workerTrigger.w : workerBodyVS.bBox.w)
                    + DefaultConfig.serviceFrontPadding + DefaultConfig.serviceRearPadding + allEndpoints.size * 150 * 2;

                if (workerVS.initPlus && workerVS.initPlus.selectedComponent === "PROCESS") {
                    workerVS.bBox.h += PLUS_HOLDER_STATEMENT_HEIGHT;
                    if (workerVS.bBox.w < PLUS_HOLDER_WIDTH) {
                        workerVS.bBox.w = PLUS_HOLDER_WIDTH;
                    }
                }
            })
            this.endVisitFunctionBodyBlock(body);

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

        this.currentWorker.pop();
        this.cleanMaps();
    }

    private syncAsyncStatements(funcitonDef: FunctionDefinition) {
        const matchedStatements: SendRecievePairInfo[] = [];
        const mainWorkerBody: FunctionBodyBlock = funcitonDef.functionBody as FunctionBodyBlock;

        // pair up sends with corresponding receives
        Array.from(this.senderReceiverInfo.keys()).forEach(key => {
            const workerEntry = this.senderReceiverInfo.get(key);

            workerEntry.sends.forEach(sendInfo => {
                if (sendInfo.paired) {
                    return;
                }

                const matchedReceive = this.senderReceiverInfo.get(sendInfo.to).receives
                    .find(receiveInfo => receiveInfo.from === key && !receiveInfo.paired)

                matchedReceive.paired = true;
                sendInfo.paired = true;

                matchedStatements.push({
                    sourceName: key,
                    sourceIndex: sendInfo.index,
                    targetName: sendInfo.to,
                    sourceNode: sendInfo.node,
                    targetNode: matchedReceive.node,
                    targetIndex: matchedReceive.index
                });
            });

            workerEntry.receives.forEach(receiveInfo => {
                if (receiveInfo.paired) {
                    return;
                }

                const matchedSend = this.senderReceiverInfo.get(receiveInfo.from).sends
                    .find(senderInfo => senderInfo.to === key && !senderInfo.paired)

                matchedSend.paired = true;
                receiveInfo.paired = true;

                matchedStatements.push({
                    sourceName: receiveInfo.from,
                    sourceIndex: matchedSend.index,
                    sourceNode: matchedSend.node,
                    targetName: matchedSend.to,
                    targetIndex: receiveInfo.index,
                    targetNode: receiveInfo.node
                });
            });
        });

        // 2. Sort the pairs in the order they should appear top to bottom
        matchedStatements.sort((p1, p2) => {
            if (p1.targetName === p2.targetName) {
                // If two pairs has the same receiver (send.workerName is the receiver name) one with
                // higher lower receiver index (one defined heigher up in the receiver) should be rendered
                // higher in the list of pairs. Same logic is used for all the cases following.
                return 0;
            }
            if (p1.targetName === p2.sourceName) {
                return p1.targetIndex - p2.sourceIndex;
            }
            if (p1.sourceName === p2.targetName) {
                return p1.sourceIndex - p2.targetIndex;
            }
            if (p1.sourceName === p2.sourceName) {
                return p1.sourceIndex - p2.sourceIndex;
            }
            return 0;
        });


        matchedStatements.forEach(matchedPair => {
            let sendHeight = 0;
            let receiveHeight = 0;

            if (matchedPair.sourceName === DEFAULT_WORKER_NAME) {
                let index = 0;
                while (matchedPair.sourceIndex !== index) {
                    const viewState: ViewState = mainWorkerBody.statements[index].viewState as ViewState;
                    sendHeight += viewState.getHeight();
                    index++;
                }
            } else {
                const workerDecl = this.workerMap.get(matchedPair.sourceName) as NamedWorkerDeclaration;
                let index = 0;
                while (matchedPair.sourceIndex !== index) {
                    const viewState: ViewState = workerDecl.workerBody.statements[index].viewState as ViewState;
                    sendHeight += viewState.getHeight();
                    index++;
                }

            }

            if (matchedPair.targetName === DEFAULT_WORKER_NAME) {
                let index = 0;
                while (matchedPair.targetIndex !== index) {
                    const viewState: ViewState = mainWorkerBody.statements[index].viewState as ViewState;
                    receiveHeight += viewState.getHeight();
                    index++;
                }
            } else {
                const workerDecl = this.workerMap.get(matchedPair.targetName) as NamedWorkerDeclaration;
                let index = 0;
                while (matchedPair.targetIndex !== index) {
                    const viewState: ViewState = workerDecl.workerBody.statements[index].viewState as ViewState;
                    receiveHeight += viewState.getHeight();
                    index++;
                }
            }

            if (sendHeight > receiveHeight) {
                const targetVS = matchedPair.targetNode.viewState as StatementViewState;
                targetVS.bBox.offsetFromTop += (sendHeight - receiveHeight);
            } else {
                const sourceVS = matchedPair.sourceNode.viewState as StatementViewState;
                sourceVS.sendLine.w = 
                sourceVS.bBox.offsetFromTop += (receiveHeight - sendHeight);
            }
        });
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
        allEndpoints = viewState.connectors;
        if (node.statements.length > 0 && STKindChecker.isReturnStatement(node.statements[node.statements.length - 1])) {
            viewState.isEndComponentInMain = true;
        }

        let index = 0;

        if (viewState.hasWorkerDecl) {
            index = this.initiateStatementSizing(node.namedWorkerDeclarator.workerInitStatements, index, viewState);
        }

        this.beginSizingBlock(node, index);
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
        const viewState = node.viewState as BlockViewState;
        let index = 0;
        let height = 0;
        let width = 0;



        if (viewState.hasWorkerDecl) {
            ({ index, height, width } = this.calculateStatementSizing((node as FunctionBodyBlock).namedWorkerDeclarator.workerInitStatements, index, viewState, height, width, node.statements.length));
        }

        this.endSizingBlock(node, index + node.statements.length, width, height, index);
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
            this.endSizingBlock(node, node.statements.length);
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

    public beginVisitNamedWorkerDeclaration(node: NamedWorkerDeclaration) {
        // this.beginSizingBlock(node.workerBody);
        this.workerMap.set(node.workerName.value, node);
        this.currentWorker.push(node.workerName.value);
    }

    public endVisitNamedWorkerDeclaration(node: NamedWorkerDeclaration) {
        const viewState: WorkerDeclarationViewState = node.viewState as WorkerDeclarationViewState;
        const body: BlockStatement = node.workerBody as BlockStatement;
        const bodyViewState: BlockViewState = body.viewState;
        const lifeLine = viewState.workerLine;
        const trigger = viewState.trigger;
        const end = viewState.end;

        trigger.h = START_SVG_HEIGHT;
        trigger.w = START_SVG_WIDTH;

        end.bBox.w = STOP_SVG_WIDTH;
        end.bBox.h = STOP_SVG_HEIGHT;

        lifeLine.h = trigger.offsetFromBottom + bodyViewState.bBox.h;

        if (!bodyViewState.isEndComponentAvailable
            && (STKindChecker.isExpressionFunctionBody(body) || body.statements.length > 0)) {
            lifeLine.h += end.bBox.offsetFromTop;
        }

        viewState.bBox.h = lifeLine.h + trigger.h + end.bBox.h + DefaultConfig.serviceVerticalPadding * 2
            + DefaultConfig.functionHeaderHeight;
        viewState.bBox.w = (trigger.w > bodyViewState.bBox.w ? trigger.w : bodyViewState.bBox.w)
            + DefaultConfig.serviceFrontPadding + DefaultConfig.serviceRearPadding + allEndpoints.size * 150 * 2;

        if (viewState.initPlus && viewState.initPlus.selectedComponent === "PROCESS") {
            viewState.bBox.h += PLUS_HOLDER_STATEMENT_HEIGHT;
            if (viewState.bBox.w < PLUS_HOLDER_WIDTH) {
                viewState.bBox.w = PLUS_HOLDER_WIDTH;
            }
        }

        this.currentWorker.pop();
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

    private beginSizingBlock(node: BlockStatement, index: number = 0) {
        if (!node.viewState) {
            return;
        }
        const blockViewState: BlockViewState = node.viewState;
        index = this.initiateStatementSizing(node.statements, index, blockViewState);

        // add END component dimensions for return statement
        if (blockViewState.isEndComponentAvailable && !blockViewState.collapseView &&
            !blockViewState.isEndComponentInMain) {
            const returnViewState: StatementViewState = node.statements[node.statements.length - 1].viewState;
            returnViewState.bBox.h = STOP_SVG_HEIGHT;
            returnViewState.bBox.w = STOP_SVG_WIDTH;
        }
    }

    private initiateStatementSizing(statements: STNode[], index: number, blockViewState: BlockViewState) {
        statements.forEach((element) => {
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
                && allEndpoints.has(stmtViewState.action.endpointName)) { // check if it's the same as actioninvocation
                stmtViewState.isAction = true;
            }
            ++index;
        });
        return index;
    }

    private endSizingBlock(node: BlockStatement, lastStatementIndex: number, width: number = 0, height: number = 0, index: number = 0) {
        if (!node.viewState) {
            return;
        }
        const blockViewState: BlockViewState = node.viewState;

        // Add last plus button.
        const plusViewState: PlusViewState = getPlusViewState(lastStatementIndex, blockViewState.plusButtons);

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
            blockViewState.draft = [lastStatementIndex, draft];
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
            plusViewState.index = lastStatementIndex;
            plusViewState.expanded = false;
        } else if (plusViewState && plusViewState.collapsedPlusDuoExpanded) {
            height += PLUS_SVG_HEIGHT;
        } else if (!plusViewState && !blockViewState.isEndComponentAvailable) {
            const plusBtnViewBox: PlusViewState = new PlusViewState();
            plusBtnViewBox.index = lastStatementIndex;
            plusBtnViewBox.expanded = false;
            plusBtnViewBox.isLast = true;
            blockViewState.plusButtons.push(plusBtnViewBox);
        }

        ({ index, height, width } = this.calculateStatementSizing(node.statements, index, blockViewState, height, width, lastStatementIndex));

        if (blockViewState.draft && blockViewState.draft[0] === lastStatementIndex) {
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

        if (blockViewState.hasWorkerDecl) {
            let maxWorkerHeight = 0;
            (node as FunctionBodyBlock).namedWorkerDeclarator.namedWorkerDeclarations.forEach(workerDecl => {
                maxWorkerHeight = maxWorkerHeight < workerDecl.viewState.bBox.h && workerDecl.viewState.bBox.h
            })

        }

        if (height > 0) {
            blockViewState.bBox.h = height;
        }

        if (width > 0) {
            blockViewState.bBox.w = width;
        } else {
            blockViewState.bBox.w = DefaultConfig.defaultBodyWidth;
        }
    }

    private addToSendReceiveMap(type: 'Send' | 'Receive', entry: AsyncReceiveInfo | AsyncSendInfo) {
        if (!this.senderReceiverInfo.has(this.currentWorker[this.currentWorker.length - 1])) {
            this.senderReceiverInfo.set(this.currentWorker[this.currentWorker.length - 1], { sends: [], receives: [] })
        }

        if (type === 'Send' && 'to' in entry) {
            this.senderReceiverInfo.get(this.currentWorker[this.currentWorker.length - 1]).sends.push(entry);
        } else if ('from' in entry) {
            this.senderReceiverInfo.get(this.currentWorker[this.currentWorker.length - 1]).receives.push(entry);
        }
    }

    private calculateStatementSizing(statements: STNode[], index: number, blockViewState: BlockViewState, height: number, width: number, lastStatementIndex: any) {
        const startIndex = index;
        statements.forEach((statement) => {
            const stmtViewState: StatementViewState = statement.viewState;
            const plusForIndex: PlusViewState = getPlusViewState(index, blockViewState.plusButtons);

            if (STKindChecker.isActionStatement(statement) && statement.expression.kind === 'AsyncSendAction') {
                const sendExpression: any = statement.expression;
                const targetName: string = sendExpression.peerWorker?.name?.value as string;
                this.addToSendReceiveMap('Send', { to: targetName, node: statement, paired: false, index: (index - startIndex) });
            } else if (STKindChecker.isLocalVarDecl(statement) && statement.initializer?.kind === 'ReceiveAction') {
                const receiverExpression: any = statement.initializer;
                const senderName: string = receiverExpression.receiveWorkers?.name?.value;
                this.addToSendReceiveMap('Receive', { from: senderName, node: statement, paired: false, index: (index - startIndex) });
            }

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
                            if (invisiblePlusIndex.index > index && invisiblePlusIndex.index !== lastStatementIndex) {
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
                                    startLine: statement.position.startLine,
                                    startColumn: statement.position.startColumn
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
                            startLine: statement.position.startLine,
                            startColumn: statement.position.startColumn
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
                        if (!(blockViewState.isEndComponentInMain && (index === lastStatementIndex - 1))) {
                            height += stmtViewState.getHeight();
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
        return { index, height, width };
    }
}

export const visitor = new SizingVisitor();
