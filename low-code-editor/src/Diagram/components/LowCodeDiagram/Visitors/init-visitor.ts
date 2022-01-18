import {
    ActionStatement,
    AssignmentStatement,
    BlockStatement,
    CallStatement,
    CaptureBindingPattern,
    CheckAction,
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
    RemoteMethodCallAction,
    RequiredParam,
    ResourceAccessorDefinition,
    ResourceKeyword,
    ServiceDeclaration,
    SimpleNameReference,
    STKindChecker,
    STNode,
    TypeCastExpression, TypeDefinition,
    Visitor,
    WhileStatement
} from "@wso2-enterprise/syntax-tree";
import { Diagnostic } from "vscode-languageserver-protocol";

import { Endpoint, isSTActionInvocation } from "../../../utils/st-util";
import { DefaultConfig } from "../../../visitors/default";
import {
    BlockViewState,
    CollapseViewState,
    CompilationUnitViewState,
    DoViewState,
    ElseViewState,
    EndpointViewState,
    ForEachViewState,
    FunctionViewState,
    IfViewState,
    ModuleMemberViewState,
    OnErrorViewState,
    PlusViewState,
    ServiceViewState,
    SimpleBBox,
    StatementViewState,
    ViewState,
    WhileViewState
} from "../ViewState";
import { DraftStatementViewState } from "../ViewState/draft";

let allEndpoints: Map<string, Endpoint> = new Map<string, Endpoint>();
let currentFnBody: FunctionBodyBlock | ExpressionFunctionBody;
const allDiagnostics: Diagnostic[] = [];

class InitVisitor implements Visitor {
    public beginVisitSTNode(node: STNode, parent?: STNode) {
        if (!node.viewState) {
            node.viewState = new ViewState();
        }
        this.initStatement(node, this.removeXMLNameSpaces(parent));
    }

    public beginVisitModulePart(node: ModulePart, parent?: STNode) {
        if (!node.viewState) {
            node.viewState = new CompilationUnitViewState();
        }
    }

    public beginVisitFunctionDefinition(node: FunctionDefinition, parent?: STNode) {
        if (!node.viewState) {
            const viewState = new FunctionViewState();
            node.viewState = viewState;
        } else {
            const viewState = node.viewState as FunctionViewState;
            if (viewState.initPlus) {
                viewState.initPlus = undefined;
            }
        }
    }

    public beginVisitListenerDeclaration(node: ListenerDeclaration, parent?: STNode) {
        if (!node.viewState) {
            const viewState = new ModuleMemberViewState();
            node.viewState = viewState;
        }
    }

    public beginVisitModuleVarDecl(node: ModuleVarDecl) {
        if (!node.viewState) {
            const viewState = new ModuleMemberViewState();
            node.viewState = viewState;
        }
    }

    public beginVisitTypeDefinition(node: TypeDefinition) {
        if (!node.viewState) {
            const viewState = new ModuleMemberViewState();
            node.viewState = viewState;
        }
    }

    public beginVisitResourceAccessorDefinition(node: ResourceAccessorDefinition, parent?: STNode) {
        if (!node.viewState) {
            const viewState = new FunctionViewState();
            node.viewState = viewState;
        }
    }

    public beginVisitObjectMethodDefinition(node: ObjectMethodDefinition, parent?: STNode) {
        if (!node.viewState) {
            const viewState = new FunctionViewState();
            node.viewState = viewState;
        }
    }

    public beginVisitServiceDeclaration(node: ServiceDeclaration, parent?: STNode) {
        node.viewState = new ServiceViewState();
    }

    public beginVisitFunctionBodyBlock(node: FunctionBodyBlock, parent?: STNode) {
        currentFnBody = node;
        allEndpoints = new Map<string, Endpoint>();
        this.visitBlock(node, parent);
    }

    public beginVisitBlockStatement(node: BlockStatement, parent?: STNode) {
        if (STKindChecker.isFunctionBodyBlock(parent) || STKindChecker.isBlockStatement(parent)) {
            this.initStatement(node, parent);
        } else {
            this.visitBlock(node, parent);
        }
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

    public endVisitWhileStatement(node: WhileStatement) {
        node.viewState = new WhileViewState();
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
            }
        }
    }

    public endVisitTypeCastExpression(node: TypeCastExpression, parent?: STNode) {
        node.viewState = new StatementViewState();
        if (isSTActionInvocation(node) && node.expression) {
            if (node.expression.kind === "RemoteMethodCallAction") {
                const stmtViewState: StatementViewState = node.viewState as StatementViewState;
                const remoteCall: RemoteMethodCallAction = node.expression as RemoteMethodCallAction;
                const simpleName: SimpleNameReference = remoteCall.expression as SimpleNameReference;
                stmtViewState.action.endpointName = simpleName.name.value;
                const actionName: SimpleNameReference = remoteCall.methodName as SimpleNameReference;
                stmtViewState.action.actionName = actionName.name.value;

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
        node.viewState = new BlockViewState();
        currentFnBody = node;
        allEndpoints = new Map<string, Endpoint>();
        // this.visitBlock(node, parent);
        node.viewState.isEndComponentAvailable = true;
    }

    public endVisitExpressionFunctionBody(node: ExpressionFunctionBody) {
        // todo: Check if this is the function to replace endVisitExpressionStatement
        const blockViewState: BlockViewState = node.viewState;
        blockViewState.connectors = allEndpoints;
        currentFnBody = undefined;
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

                if (currentFnBody && STKindChecker.isFunctionBodyBlock(currentFnBody) && currentFnBody.VisibleEndpoints) {
                    const callerParam = currentFnBody.VisibleEndpoints.find((vEP: any) => vEP.isCaller);
                    stmtViewState.isCallerAction = callerParam && callerParam.name === varRef.name.value;
                }
            } else if (STKindChecker.isRemoteMethodCallAction(node.expression)) {
                const remoteAction: RemoteMethodCallAction = node.expression as RemoteMethodCallAction;
                const varRef: SimpleNameReference = remoteAction.expression as SimpleNameReference;
                stmtViewState.action.endpointName = varRef.name.value;
                stmtViewState.action.actionName = remoteAction.methodName.name.value;

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

    public beginVisitDoStatement(node: DoStatement, parent?: STNode) {
        if (!node.viewState) {
            node.viewState = new DoViewState();
        }
        const viewState = new BlockViewState();
        if (node.viewState && node.viewState.isFirstInFunctionBody) {
            const doViewState: DoViewState = node.viewState as DoViewState;
            if (node.blockStatement) {
                viewState.isDoBlock = true;
            }

            if (node.onFailClause) {
                const onFailViewState: OnErrorViewState = new OnErrorViewState();
                onFailViewState.isFirstInFunctionBody = true;
                node.onFailClause.viewState = onFailViewState;
            }
        } else {
            this.initStatement(node, parent);
        }

        if (node.blockStatement) {
            node.blockStatement.viewState = viewState;
        }
    }

    public beginVisitOnFailClause(node: OnFailClause, parent?: STNode) {
        if (!node.viewState) {
            node.viewState = new OnErrorViewState();
        }
        const viewState = new BlockViewState();
        if (node.viewState && node.viewState.isFirstInFunctionBody && node.blockStatement) {
            viewState.isOnErrorBlock = true;
        }

        if (node.blockStatement) {
            node.blockStatement.viewState = viewState;
        }
    }

    private initStatement(node: STNode, parent?: STNode) {
        node.viewState = new StatementViewState();
        const stmtViewState: StatementViewState = node.viewState;
        if (STKindChecker.isLocalVarDecl(node)) {

            // todo: In here we need to catch only the action invocations.
            if (isSTActionInvocation(node)) {
                stmtViewState.isAction = true;
            }

            // Check whether node is an endpoint initialization.
            if (node.typeData && node.typeData.isEndpoint) {
                const bindingPattern: CaptureBindingPattern = node.typedBindingPattern.bindingPattern as CaptureBindingPattern;
                stmtViewState.endpoint.epName = bindingPattern.variableName.value;
                const endpoint = allEndpoints.get(stmtViewState.endpoint.epName);
                if (endpoint) {
                    const vEp = endpoint.visibleEndpoint;
                    stmtViewState.isEndpoint = true;
                }
            }

            // todo: need to fix these with invocation data
            if (node.initializer && stmtViewState.isAction) {
                if (node.initializer.kind === "RemoteMethodCallAction") {
                    const remoteActionCall: RemoteMethodCallAction = node.initializer as RemoteMethodCallAction;
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
                    if (!allEndpoints.has(stmtViewState.action.endpointName)) {
                        stmtViewState.isAction = false;
                        return;
                    }
                } else if (node.initializer.kind === "CheckAction") {
                    const checkExpr: CheckAction = node.initializer as CheckAction;
                    const remoteActionCall: RemoteMethodCallAction = checkExpr.expression as RemoteMethodCallAction;
                    const typeInfo: any = remoteActionCall?.typeData?.symbol?.typeDescriptor;
                    if (typeInfo?.name === "BulkClient") {
                        stmtViewState.hidden = true;
                    }
                    const checkExprViewState: StatementViewState = checkExpr.viewState as StatementViewState;
                    stmtViewState.action.endpointName = checkExprViewState.action.endpointName;
                    stmtViewState.action.actionName = checkExprViewState.action.actionName;
                    stmtViewState.isCallerAction = checkExprViewState.isCallerAction;
                    if (!allEndpoints.has(stmtViewState.action.endpointName)) {
                        stmtViewState.isAction = false;
                        return;
                    }
                } else if (node.initializer.kind === "TypeCastExpression") {
                    const typeCastExpression: TypeCastExpression = node.initializer as TypeCastExpression;
                    if (typeCastExpression.expression.kind === "RemoteMethodCallAction") {
                        const remoteActionCall: RemoteMethodCallAction = typeCastExpression.expression as RemoteMethodCallAction;
                        const typeInfo: any = remoteActionCall?.typeData?.symbol?.typeDescriptor;
                        if (typeInfo?.name === "BulkClient") {
                            stmtViewState.hidden = true;
                        }
                    }
                    const typeCastViewState: StatementViewState = typeCastExpression.viewState as StatementViewState;
                    stmtViewState.action.endpointName = typeCastViewState.action.endpointName;
                    stmtViewState.action.actionName = typeCastViewState.action.actionName;
                    stmtViewState.isCallerAction = typeCastViewState.isCallerAction;
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
        let isDoBlock: boolean = false;
        let isOnErrorBlock: boolean = false;
        if (node.viewState) {
            const viewState: BlockViewState = node.viewState as BlockViewState;
            draft = viewState.draft;
            isDoBlock = viewState.isDoBlock;
            isOnErrorBlock = viewState.isOnErrorBlock;
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
        node.viewState.isDoBlock = isDoBlock;
        node.viewState.isOnErrorBlock = isOnErrorBlock;

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
                    callerParamName = callerParam?.paramName?.value;
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
                    // Update endpoint lifeline values.
                    const endpointViewState: EndpointViewState = new EndpointViewState();
                    endpointViewState.bBox.w = DefaultConfig.connectorStart.width;
                    endpointViewState.lifeLine.h = DefaultConfig.connectorLine.height;

                    // Update the endpoint sizing values in allEndpoint map.
                    const visibleEndpoint: any = endpoint.visibleEndpoint;
                    const mainEp = endpointViewState;
                    mainEp.isUsed = endpoint.firstAction !== undefined;
                    visibleEndpoint.viewState = mainEp;
                    allEndpoints.set(ep.name, endpoint);
                }
            });
        }
        // evaluating return statement
        if (node.statements.length > 0 && STKindChecker.isReturnStatement(node.statements[node.statements.length - 1])) {
            node.viewState.isEndComponentAvailable = true;
        }

        if (STKindChecker.isFunctionDefinition(parent)) {
            for (const statement of node.statements) {
                if (STKindChecker.isDoStatement(statement)) {
                    const viewState: DoViewState = new DoViewState();
                    viewState.isFirstInFunctionBody = true;
                    statement.viewState = viewState;
                    break;
                }
            };
        }
    }

    private removeXMLNameSpaces(parent?: STNode) {
        if (STKindChecker.isModulePart(parent)) {
            const modulePart = parent as ModulePart;
            const members = modulePart.members.filter(member => {
                if (member.kind !== "ModuleXmlNamespaceDeclaration") {
                    return member;
                }
            })
            modulePart.members = members;
            parent = modulePart;
        } else if (STKindChecker.isServiceDeclaration(parent)) {
            const service = parent as ServiceDeclaration;
            service.members.forEach(member => {
                const body = member.functionBody as FunctionBodyBlock;
                const filteredStatements = body.statements.filter(statement => {
                    if (statement.kind !== "XmlNamespaceDeclaration") {
                        return statement;
                    }
                })
                body.statements = filteredStatements;
                member.functionBody = body;
            })
            parent = service;
        } else if (STKindChecker.isFunctionDefinition(parent)) {
            const body = parent.functionBody as FunctionBodyBlock;
            const filteredStatements = body.statements.filter(statement => {
                if (statement.kind !== "XmlNamespaceDeclaration") {
                    return statement;
                }
            })
            body.statements = filteredStatements;
            parent.functionBody = body;
        }
        return parent;
    }

}

export const visitor = new InitVisitor();
