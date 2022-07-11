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
    ListenerDeclaration,
    LocalVarDecl,
    ModulePart,
    ModuleVarDecl,
    NamedWorkerDeclaration,
    NamedWorkerDeclarator,
    ObjectMethodDefinition,
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

import { Endpoint } from "../Types/type";
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
import { WorkerDeclarationViewState } from "../ViewState/worker-declaration";

import { DefaultConfig } from "./default";
import { haveBlockStatement, isEndpointNode, isSTActionInvocation } from "./util";

let currentFnBody: FunctionBodyBlock | ExpressionFunctionBody;

export class InitVisitor implements Visitor {
    private allEndpoints: Map<string, Endpoint> = new Map();
    private parentConnectors: Map<string, Endpoint>;
    private offsetValue: number;

    constructor(parentConnectors: Map<string, Endpoint> = undefined, offsetValue: number = 0) {
        this.parentConnectors = parentConnectors;
        this.offsetValue = offsetValue;
    }

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
        this.allEndpoints = new Map<string, Endpoint>();
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

        if (node.typeData && node.typeData.isEndpoint) {
            const bindingPattern = node.typedBindingPattern.bindingPattern as CaptureBindingPattern;
            if (this.allEndpoints.get(bindingPattern.variableName.value)) {
                node.viewState.endpoint.epName = bindingPattern.variableName.value;
                node.viewState.isEndpoint = true;
            }
        }
    }

    public beginVisitRequiredParam(node: RequiredParam, parent?: STNode): void {
        if (!node.viewState) {
            const viewState = new ModuleMemberViewState();
            node.viewState = viewState;
        }

        if (node.typeData && node.typeData.isEndpoint) {
            const endpointName = node.paramName?.value;
            if (endpointName) {
                node.viewState.endpoint.epName = endpointName;
                node.viewState.isEndpoint = true;
            }
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
        this.allEndpoints = new Map<string, Endpoint>();
    }

    public beginVisitObjectMethodDefinition(node: ObjectMethodDefinition, parent?: STNode) {
        if (!node.viewState) {
            const viewState = new FunctionViewState();
            node.viewState = viewState;
        }
        this.allEndpoints = new Map<string, Endpoint>();
    }

    public beginVisitServiceDeclaration(node: ServiceDeclaration, parent?: STNode) {
        node.viewState = new ServiceViewState();
    }

    public beginVisitFunctionBodyBlock(node: FunctionBodyBlock, parent?: STNode) {
        currentFnBody = node;
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
        this.initStatement(node, parent);
    }

    public beginVisitCheckAction(node: CheckAction, parent?: STNode) { // todo: Check panic is also replaced by this method
        if (!node.viewState) {
            node.viewState = new StatementViewState();
        }

        if (node.expression && isSTActionInvocation(node)) { // todo : need to find the right method from STTypeChecker
            const stmtViewState = node.viewState as StatementViewState;
            const remoteActionCall = node.expression as RemoteMethodCallAction;
            const simpleName = remoteActionCall.expression as SimpleNameReference;
            stmtViewState.action.endpointName = simpleName.name.value;
            const actionName = remoteActionCall.methodName as SimpleNameReference;
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
            const stmtViewState = node.viewState as StatementViewState;
            const expressionViewState = node.expression.viewState as StatementViewState;
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
        if (isSTActionInvocation(node) && node.expression) {
            if (STKindChecker.isCheckAction(node.expression) && STKindChecker.isRemoteMethodCallAction(node.expression.expression)) {
                this.setActionInvocationInfo(node, node.expression.expression);
            } else if (STKindChecker.isRemoteMethodCallAction(node.expression)) {
                this.setActionInvocationInfo(node, node.expression);
            } else {
                const exprViewState = node.expression.viewState as StatementViewState;
                const stmtViewState = node.viewState as StatementViewState;
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
            if (STKindChecker.isRemoteMethodCallAction(node.expression)) {
                const remoteCall = node.expression;
                const stmtViewState = node.viewState as StatementViewState;
                const simpleName = remoteCall.expression as SimpleNameReference;
                stmtViewState.action.endpointName = simpleName.name.value;
                const actionName = remoteCall.methodName as SimpleNameReference;
                stmtViewState.action.actionName = actionName.name.value;

                if (currentFnBody && STKindChecker.isFunctionBodyBlock(currentFnBody) && currentFnBody.VisibleEndpoints) {
                    const callerParam = currentFnBody.VisibleEndpoints.find((vEP: any) => vEP.isCaller);
                    stmtViewState.isCallerAction = callerParam && callerParam.name === simpleName.name.value;
                }
            } else {
                const exprViewState = node.expression.viewState as StatementViewState;
                const stmtViewState = node.viewState as StatementViewState;
                stmtViewState.isCallerAction = exprViewState.isCallerAction;
                stmtViewState.isAction = exprViewState.isAction;
                stmtViewState.action.endpointName = exprViewState.action.endpointName;
                stmtViewState.action.actionName = exprViewState.action.actionName;
            }
        }
    }

    private mapParentEndpointsWithCurrentEndpoints(node: FunctionBodyBlock) {
        this.parentConnectors?.forEach((parentEp: Endpoint, key: string) => {
            // TODO: Check all the conditions to map the correct endpoint
            const currentVp = this.allEndpoints?.get(key); 
            if (currentVp && parentEp.actions.length > 0 && parentEp.visibleEndpoint.moduleName === currentVp.visibleEndpoint.moduleName 
                && parentEp.visibleEndpoint.orgName === currentVp.visibleEndpoint.orgName )
            {
                node.viewState.expandOffSet = this.offsetValue;
                parentEp.isExpandedPoint = true;
                parentEp.visibleEndpoint.viewState.lifeLine.h += node.viewState.bBox.h;
                this.allEndpoints.set(key, parentEp);
            }
        })
    }

    public endVisitFunctionBodyBlock(node: FunctionBodyBlock, parent?: STNode) {
        const blockViewState: BlockViewState = node.viewState;
        this.mapParentEndpointsWithCurrentEndpoints(node);
        blockViewState.connectors = this.allEndpoints;
        blockViewState.hasWorkerDecl = !!node.namedWorkerDeclarator;
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

        node.viewState.isEndComponentAvailable = true;
    }

    public endVisitExpressionFunctionBody(node: ExpressionFunctionBody) {
        // todo: Check if this is the function to replace endVisitExpressionStatement
        const blockViewState: BlockViewState = node.viewState;
        blockViewState.connectors = this.allEndpoints;
        currentFnBody = undefined;
    }

    public beginVisitIfElseStatement(node: IfElseStatement, parent?: STNode) {
        node.viewState = new IfViewState();
        if (!STKindChecker.isElseBlock(parent)) {
            (node.viewState as IfViewState).isMainIfBody = true;
        }
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
                const remoteAction: RemoteMethodCallAction = node.expression.expression;
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

    public beginVisitNamedWorkerDeclaration(node: NamedWorkerDeclaration) {
        if (!node.viewState) {
            node.viewState = new WorkerDeclarationViewState();
        }
    }

    private initStatement(node: STNode, parent?: STNode) {
        node.viewState = new StatementViewState();
        const stmtViewState: StatementViewState = node.viewState;
        // todo: In here we need to catch only the action invocations.
        if (isSTActionInvocation(node) && !haveBlockStatement(node)) {
            stmtViewState.isAction = true;
        }

        if (STKindChecker.isLocalVarDecl(node)) {
            // Check whether node is an endpoint initialization.
            if (isEndpointNode(node)) {
                const bindingPattern: CaptureBindingPattern = node.typedBindingPattern.bindingPattern as CaptureBindingPattern;
                stmtViewState.endpoint.epName = bindingPattern.variableName.value;
                if (this.allEndpoints.has(stmtViewState.endpoint.epName)) {
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

                if (!this.allEndpoints.has(stmtViewState.action.endpointName)) {
                    stmtViewState.isAction = false;
                    return;
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
                if (!this.allEndpoints.has(ep.typeName) && ep.name !== callerParamName) {
                    // Update endpoint lifeline values.
                    const endpointViewState: EndpointViewState = new EndpointViewState();
                    endpointViewState.bBox.w = DefaultConfig.connectorStart.width;
                    endpointViewState.lifeLine.h = DefaultConfig.connectorLine.height;

                    // Update the endpoint sizing values in allEndpoint map.
                    const visibleEndpoint: any = endpoint.visibleEndpoint;
                    const mainEp = endpointViewState;
                    mainEp.isUsed = endpoint.firstAction !== undefined;
                    visibleEndpoint.viewState = mainEp;
                    this.allEndpoints.set(ep.name, endpoint);
                }
            });
        }
        // evaluating return statement
        if (node.statements.length > 0 && STKindChecker.isReturnStatement(node.statements[node.statements.length - 1])) {
            node.viewState.isEndComponentAvailable = true;
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
                if (STKindChecker.isResourceAccessorDefinition(member)) {
                    // TODO check for other functionbody types
                    const body = member.functionBody as FunctionBodyBlock;
                    const filteredStatements = body.statements.filter(statement => {
                        if (statement.kind !== "XmlNamespaceDeclaration") {
                            return statement;
                        }
                    })
                    body.statements = filteredStatements;
                    member.functionBody = body;
                }
            })
            parent = service;
        } else if (STKindChecker.isFunctionDefinition(parent)) {
            const body = parent.functionBody;
            if (STKindChecker.isFunctionBodyBlock(body)) {
                const filteredStatements = body.statements.filter(statement => {
                    if (statement.kind !== "XmlNamespaceDeclaration") {
                        return statement;
                    }
                })
                body.statements = filteredStatements;
                parent.functionBody = body;
            }
        }
        return parent;
    }

    private setActionInvocationInfo(node: ActionStatement, remoteCall: RemoteMethodCallAction) {
        const stmtViewState: StatementViewState = node.viewState as StatementViewState;
        const simpleName: SimpleNameReference = remoteCall.expression as SimpleNameReference;
        stmtViewState.action.endpointName = simpleName.name.value;
        const actionName: SimpleNameReference = remoteCall.methodName as SimpleNameReference;
        stmtViewState.action.actionName = actionName.name.value;

        if (currentFnBody && STKindChecker.isFunctionBodyBlock(currentFnBody) && currentFnBody.VisibleEndpoints) {
            const callerParam = currentFnBody.VisibleEndpoints.find((vEP: any) => vEP.isCaller);
            stmtViewState.isCallerAction = callerParam && callerParam.name === simpleName.name.value;
        }
    }

}

export const initVisitor = new InitVisitor();
