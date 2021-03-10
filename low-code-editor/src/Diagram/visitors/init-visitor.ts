import {
    ActionStatement,
    AssignmentStatement,
    BlockStatement,
    CallStatement,
    CaptureBindingPattern,
    CheckAction,
    ExpressionFunctionBody,
    ForeachStatement,
    FunctionBodyBlock,
    FunctionDefinition,
    IfElseStatement,
    LocalVarDecl,
    ModulePart,
    RemoteMethodCallAction,
    RequiredParam,
    ResourceKeyword,
    SimpleNameReference,
    STKindChecker,
    STNode,
    Visitor
} from "@ballerina/syntax-tree";
import { Diagnostic } from "monaco-languageclient/lib/monaco-language-client";

import { Endpoint, isSTActionInvocation } from "../utils/st-util";
import {
    BlockViewState,
    CollapseViewState,
    CompilationUnitViewState,
    ElseViewState,
    ForEachViewState,
    FunctionViewState,
    IfViewState,
    PlusViewState,
    SimpleBBox,
    StatementViewState,
    ViewState
} from "../view-state";
import { DraftStatementViewState } from "../view-state/draft";

let allEndpoints: Map<string, Endpoint> = new Map<string, Endpoint>();
let currentFnBody: FunctionBodyBlock;
const allDiagnostics: Diagnostic[] = [];

class InitVisitor implements Visitor {
    public beginVisitSTNode(node: STNode, parent?: STNode) {
        if (!node.viewState) {
            node.viewState = new ViewState();
        }
    }

    public beginVisitModulePart(node: ModulePart, parent?: STNode) {
        node.viewState = new CompilationUnitViewState();
    }

    public beginVisitFunctionDefinition(node: FunctionDefinition, parent?: STNode) {
        if (!node.viewState) {
            const viewState = new FunctionViewState();
            node.viewState = viewState;
        }
    }

    public beginVisitFunctionBodyBlock(node: FunctionBodyBlock, parent?: STNode) {
        currentFnBody = node;
        allEndpoints = new Map<string, Endpoint>();
        this.visitBlock(node, parent);
    }

    public beginVisitBlockStatement(node: BlockStatement, parent?: STNode) {
        this.visitBlock(node, parent);
    }

    public beginVisitActionStatement(node: ActionStatement, parent?: STNode) {
        if (!node.viewState) {
            node.viewState = new StatementViewState();
        }
    }

    public beginVisitCheckAction(node: CheckAction, parent?: STNode) { // todo: Check panic is also replaced by this method
        if (!node.viewState) {
            node.viewState = new StatementViewState();
        }

        if (node.expression && isSTActionInvocation(node)) { // todo : need to find the right method from STTypeChecker
            const stmtViewState: StatementViewState = node.viewState as StatementViewState;
            const remoteActionCall: RemoteMethodCallAction = node.expression as RemoteMethodCallAction;
            const simpleName: SimpleNameReference = remoteActionCall.expression as SimpleNameReference;
            stmtViewState.action.endpointName = simpleName.name.value;
            const actionName: SimpleNameReference = remoteActionCall.methodName as SimpleNameReference;
            stmtViewState.action.actionName = actionName.name.value;

            // Set icon id for an action.
            const endPoint = allEndpoints.get(stmtViewState.action.endpointName);
            if (endPoint) {
                const visibleEp = endPoint.visibleEndpoint;
                stmtViewState.action.iconId = visibleEp.moduleName + '_' + visibleEp.typeName;
            }

            if (currentFnBody && STKindChecker.isFunctionBodyBlock(currentFnBody) && currentFnBody.VisibleEndpoints) {
                const callerParam = currentFnBody.VisibleEndpoints.find((vEP: any) => vEP.isCaller);
                stmtViewState.isCallerAction = callerParam && callerParam.name === simpleName.name.value;
            }
        }
    }

    public endVisitCallStatement(node: CallStatement, parent?: STNode) {
        node.viewState = new StatementViewState();

        if (isSTActionInvocation(node) && node.expression) {
            const stmtViewState: StatementViewState = node.viewState as StatementViewState;
            const expressionViewState: StatementViewState = node.expression.viewState as StatementViewState;
            stmtViewState.isCallerAction = expressionViewState.isCallerAction;
            stmtViewState.isAction = expressionViewState.isAction;
            stmtViewState.action.endpointName = expressionViewState.action.endpointName;
            stmtViewState.action.actionName = expressionViewState.action.actionName;

            // Set icon id for an action.
            const endPoint = allEndpoints.get(stmtViewState.action.endpointName);
            if (endPoint) {
                const visibleEp = endPoint.visibleEndpoint;
                stmtViewState.action.iconId = visibleEp.moduleName + '_' + visibleEp.typeName;
            }
        }
    }

    public beginVisitCallStatement(node: CallStatement, parent?: STNode) {
        if (!node.viewState) {
            node.viewState = new StatementViewState();
        }
    }

    public endVisitForeachStatement(node: ForeachStatement) {
        node.viewState = new ForEachViewState();
    }

    public endVisitActionStatement(node: ActionStatement, parent?: STNode) {
        node.viewState = new StatementViewState();
        if (isSTActionInvocation(node) && node.expression) {
            if (node.expression.kind === "RemoteMethodCallAction") {
                const stmtViewState: StatementViewState = node.viewState as StatementViewState;
                const remoteCall: RemoteMethodCallAction = node.expression as RemoteMethodCallAction;
                const simpleName: SimpleNameReference = remoteCall.expression as SimpleNameReference;
                stmtViewState.action.endpointName = simpleName.name.value;
                const actionName: SimpleNameReference = remoteCall.methodName as SimpleNameReference;
                stmtViewState.action.actionName = actionName.name.value;

                // Set Icon Id for an action.
                const endPoint = allEndpoints.get(stmtViewState.action.endpointName);
                if (endPoint) {
                    const visibleEp = endPoint.visibleEndpoint;
                    stmtViewState.action.iconId = visibleEp.moduleName + '_' + visibleEp.typeName;
                }

                if (currentFnBody && STKindChecker.isFunctionBodyBlock(currentFnBody) && currentFnBody.VisibleEndpoints) {
                    const callerParam = currentFnBody.VisibleEndpoints.find((vEP: any) => vEP.isCaller);
                    stmtViewState.isCallerAction = callerParam && callerParam.name === simpleName.name.value;
                }
            } else {
                const exprViewState: StatementViewState = node.expression.viewState;
                const stmtViewState: StatementViewState = node.viewState as StatementViewState;
                stmtViewState.isCallerAction = exprViewState.isCallerAction;
                stmtViewState.isAction = exprViewState.isAction;
                stmtViewState.action.endpointName = exprViewState.action.endpointName;
                stmtViewState.action.actionName = exprViewState.action.actionName;

                // Set Icon Id for an action.
                const endPoint = allEndpoints.get(stmtViewState.action.endpointName);
                if (endPoint) {
                    const visibleEp = endPoint.visibleEndpoint;
                    stmtViewState.action.iconId = visibleEp.moduleName + '_' + visibleEp.typeName;
                }
            }
        }
    }

    public endVisitFunctionBodyBlock(node: FunctionBodyBlock, parent?: STNode) {
        const blockViewState: BlockViewState = node.viewState;
        blockViewState.connectors = allEndpoints;
        currentFnBody = undefined;
    }

    public beginVisitLocalVarDecl(node: LocalVarDecl, parent?: STNode) {
        if (!node.viewState) {
            node.viewState = new StatementViewState();
        }
    }

    public endVisitLocalVarDecl(node: LocalVarDecl, parent?: STNode) {
        this.initStatement(node, parent);
    }

    public beginVisitExpressionFunctionBody(node: ExpressionFunctionBody) {
        // todo: Check if this is the function to replace beginVisitExpressionStatement
    }

    public endVisitExpressionFunctionBody(node: ExpressionFunctionBody) {
        // todo: Check if this is the function to replace endVisitExpressionStatement
    }

    public beginVisitIfElseStatement(node: IfElseStatement, parent?: STNode) {
        node.viewState = new IfViewState();
        if (node.elseBody) {
            if (node.elseBody.elseBody?.kind === "BlockStatement") {
                const elseBlock: BlockStatement = node.elseBody.elseBody as BlockStatement;
                elseBlock.viewState = new ElseViewState();
                elseBlock.viewState.isElseBlock = true;
                if (elseBlock.statements.length > 0 && STKindChecker.isReturnStatement(
                    elseBlock.statements[elseBlock.statements.length - 1])) {
                    elseBlock.viewState.isEndComponentAvailable = true;
                }
            } else if (node.elseBody.elseBody.kind === "IfElseStatement") {
                node.elseBody.elseBody.viewState = new IfViewState();
            }
        }
    }

    public endVisitAssignmentStatement(node: AssignmentStatement, parent?: STNode) {
        this.initStatement(node, parent);

        if (node.expression && isSTActionInvocation(node)) {
            const stmtViewState: StatementViewState = node.viewState as StatementViewState;

            if (STKindChecker.isCheckAction(node.expression) && STKindChecker.isRemoteMethodCallAction(node.expression.expression)) {
                const checkAction: CheckAction = node.expression;
                const remoteAction: RemoteMethodCallAction = checkAction.expression;
                const varRef: SimpleNameReference = remoteAction.expression as SimpleNameReference;
                stmtViewState.action.endpointName = varRef.name.value;
                stmtViewState.action.actionName = remoteAction.methodName.name.value;

                // Set icon id for an action.
                const endPoint = allEndpoints.get(stmtViewState.action.endpointName);
                if (endPoint) {
                    const visibleEp = endPoint.visibleEndpoint;
                    stmtViewState.action.iconId = visibleEp.moduleName + '_' + visibleEp.typeName;
                }

                if (currentFnBody && STKindChecker.isFunctionBodyBlock(currentFnBody) && currentFnBody.VisibleEndpoints) {
                    const callerParam = currentFnBody.VisibleEndpoints.find((vEP: any) => vEP.isCaller);
                    stmtViewState.isCallerAction = callerParam && callerParam.name === varRef.name.value;
                }
            } else if (STKindChecker.isRemoteMethodCallAction(node.expression)) {
                const remoteAction: RemoteMethodCallAction = node.expression as RemoteMethodCallAction;
                const varRef: SimpleNameReference = remoteAction.expression as SimpleNameReference;
                stmtViewState.action.endpointName = varRef.name.value;
                stmtViewState.action.actionName = remoteAction.methodName.name.value;

                // Set icon id for an action.
                const endPoint = allEndpoints.get(stmtViewState.action.endpointName);
                if (endPoint) {
                    const visibleEp = endPoint.visibleEndpoint;
                    stmtViewState.action.iconId = visibleEp.moduleName + '_' + visibleEp.typeName;
                }

                if (currentFnBody && STKindChecker.isFunctionBodyBlock(currentFnBody) && currentFnBody.VisibleEndpoints) {
                    const callerParam = currentFnBody.VisibleEndpoints.find((vEP: any) => vEP.isCaller);
                    stmtViewState.isCallerAction = callerParam && callerParam.name === varRef.name.value;
                }
            }

            // Do we need this.... here we only need to identify actions.
            // else if (STKindChecker.isMethodCall(node.expression)) {
            //     const expression: MethodCall = node.expression as MethodCall;
            //     const expressionVS: StatementViewState = expression.viewState;
            //     const varRef: SimpleNameReference = expression.expression as SimpleNameReference;
            //     stmtViewState.isCallerAction = expressionVS.isCallerAction;
            //     stmtViewState.isAction = expressionVS.isAction;
            //     stmtViewState.action.actionName = expression.methodName.name.value;
            //     stmtViewState.action.endpointName = varRef.name.value;
            // }
        }
    }

    private initStatement(node: STNode, parent?: STNode) {
        node.viewState = new StatementViewState();
        const stmtViewState: StatementViewState = node.viewState;
        if (STKindChecker.isLocalVarDecl(node)) {
            const localVarDecl: LocalVarDecl = node as LocalVarDecl;
            // todo: In here we need to catch only the action invocations.
            if (isSTActionInvocation(node)) {
                stmtViewState.isAction = true;
            }

            // Check whether node is an endpoint initialization.
            if (node.typeData && node.typeData.isEndpoint) {
                const bindingPattern: CaptureBindingPattern = node.typedBindingPattern.bindingPattern as CaptureBindingPattern;
                stmtViewState.endpoint.epName = bindingPattern.variableName.value;
                stmtViewState.isEndpoint = true;
            }

            // todo: need to fix these with invocation data
            if (localVarDecl.initializer && stmtViewState.isAction) {
                if (localVarDecl.initializer.kind === "RemoteMethodCallAction") {
                    const remoteActionCall: RemoteMethodCallAction = localVarDecl.initializer as RemoteMethodCallAction;
                    const typeInfo: any = remoteActionCall?.typeData?.symbol?.typeDescriptor;
                    if (typeInfo?.name === "BaseClient") {
                        stmtViewState.hidden = true;
                    }

                    const simpleName: SimpleNameReference = remoteActionCall.expression as SimpleNameReference;
                    stmtViewState.action.endpointName = simpleName.name.value;
                    const actionName: SimpleNameReference = remoteActionCall.methodName as SimpleNameReference;
                    stmtViewState.action.actionName = actionName.name.value;
                    stmtViewState.isAction = true;
                    if (currentFnBody && STKindChecker.isFunctionBodyBlock(currentFnBody) && currentFnBody.VisibleEndpoints) {
                        const callerParam = currentFnBody.VisibleEndpoints.find((vEP: any) => vEP.isCaller);
                        stmtViewState.isCallerAction = callerParam && callerParam.name === simpleName.name.value;
                    }
                } else if (localVarDecl.initializer.kind === "CheckAction") {
                    const checkExpr: CheckAction = localVarDecl.initializer as CheckAction;
                    const remoteActionCall: RemoteMethodCallAction = checkExpr.expression as RemoteMethodCallAction;
                    const typeInfo: any = remoteActionCall?.typeData?.symbol?.typeDescriptor;
                    if (typeInfo?.name === "BulkClient") {
                        stmtViewState.hidden = true;
                    }
                    const checkExprViewState: StatementViewState = checkExpr.viewState as StatementViewState;
                    stmtViewState.action.endpointName = checkExprViewState.action.endpointName;
                    stmtViewState.action.actionName = checkExprViewState.action.actionName;
                    stmtViewState.isCallerAction = checkExprViewState.isCallerAction;
                    stmtViewState.isAction = checkExprViewState.isAction;
                } else if (localVarDecl.initializer.kind === "TypeCastExpression") {
                    const checkExpr: CheckAction = localVarDecl.initializer as CheckAction;
                    if (checkExpr.expression.kind === "CheckAction") {
                        const remoteActionCall: RemoteMethodCallAction = checkExpr.expression as RemoteMethodCallAction;
                        const typeInfo: any = remoteActionCall?.typeData?.symbol?.typeDescriptor;
                        if (typeInfo?.name === "BulkClient") {
                            stmtViewState.hidden = true;
                        }
                        const checkExprViewState: StatementViewState = checkExpr.expression.viewState as
                            StatementViewState;
                        stmtViewState.action.endpointName = checkExprViewState.action.endpointName;
                        stmtViewState.action.actionName = checkExprViewState.action.actionName;
                        stmtViewState.isCallerAction = checkExprViewState.isCallerAction;
                        stmtViewState.isAction = checkExprViewState.isAction;
                    }
                }
                if (!stmtViewState.isCallerAction) {
                    // Set icon id for an action.
                    const endpoint = allEndpoints.get(stmtViewState.action.endpointName);
                    const vEp = endpoint.visibleEndpoint;
                    stmtViewState.action.iconId = vEp.moduleName + "_" + vEp.typeName;
                }
            }
        }
    }

    private visitBlock(node: BlockStatement, parent: STNode) {
        // Preserve collapse views and draft view on clean render.
        let draft: [number, DraftStatementViewState];
        let collapseView: CollapseViewState;
        let collapseFrom: number = 0;
        let collapsed: boolean = false;
        let plusButtons: PlusViewState[] = [];
        if (node.viewState) {
            const viewState: BlockViewState = node.viewState as BlockViewState;
            draft = viewState.draft;
            if (viewState.collapseView) {
                collapseView = viewState.collapseView;
                collapseFrom = viewState.collapsedFrom;
                collapsed = viewState.collapsed;
                plusButtons = viewState.plusButtons;
            }
        }

        node.viewState = node.viewState && node.viewState.isElseBlock
            ? new ElseViewState()
            : new BlockViewState();
        node.viewState.draft = draft;
        node.viewState.collapseView = collapseView;
        node.viewState.collapsedFrom = collapseFrom;
        node.viewState.collapsed = collapsed;
        node.viewState.plusButtons = plusButtons;

        if (node.VisibleEndpoints) {
            const visibleEndpoints = node.VisibleEndpoints;
            let callerParamName: string;
            if (parent && STKindChecker.isFunctionDefinition(parent)) {
                const qualifierList: ResourceKeyword[] = parent.qualifierList ?
                    parent.qualifierList as ResourceKeyword[] : [];
                let resourceKeyword: ResourceKeyword;
                qualifierList.forEach((qualifier: STNode) => {
                    if (qualifier.kind === "ResourceKeyword") {
                        resourceKeyword = qualifier as ResourceKeyword;
                    }
                });
                if (resourceKeyword) {
                    const callerParam: RequiredParam = parent.functionSignature.parameters[0] as RequiredParam;
                    callerParamName = callerParam.paramName.value;
                }
            }
            visibleEndpoints.forEach((ep: any) => {
                ep.viewState = new SimpleBBox();
                const actions: StatementViewState[] = [];
                const endpoint: Endpoint = {
                    visibleEndpoint: ep,
                    actions
                };
                if (!allEndpoints.has(ep.typeName) && ep.name !== callerParamName) {
                    allEndpoints.set(ep.name, endpoint);
                }
            });
        }
        // evaluating return statement
        if (node.statements.length > 0 && STKindChecker.isReturnStatement(node.statements[node.statements.length - 1])) {
            node.viewState.isEndComponentAvailable = true;
        }
    }

}

export const visitor = new InitVisitor();
