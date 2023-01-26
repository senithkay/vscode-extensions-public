import {
    ActionStatement,
    AssignmentStatement,
    BlockStatement,
    CallStatement,
    CaptureBindingPattern,
    CheckAction,
    ExpressionFunctionBody,
    FieldAccess,
    ForeachStatement,
    FunctionBodyBlock,
    FunctionDefinition,
    IfElseStatement,
    ListenerDeclaration,
    LocalVarDecl,
    ModulePart,
    ModuleVarDecl,
    NamedWorkerDeclaration,
    ObjectField,
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

import { Endpoint } from "../Types/type";
import {
    BlockViewState,
    CollapseViewState,
    CompilationUnitViewState,
    ElseViewState,
    EndpointViewState,
    ForEachViewState,
    FunctionViewState,
    IfViewState,
    ModuleMemberViewState,
    PlusViewState,
    ServiceViewState,
    SimpleBBox,
    StatementViewState,
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

    constructor(parentConnectors?: Map<string, Endpoint>, offsetValue: number = 0) {
        this.parentConnectors = parentConnectors;
        this.offsetValue = offsetValue;
    }

    public beginVisitSTNode(node: STNode, parent?: STNode) {
        // node.viewState = new ViewState();
        this.initStatement(node, this.removeXMLNameSpaces(parent));
    }

    public beginVisitModulePart(node: ModulePart, parent?: STNode) {
        node.viewState = new CompilationUnitViewState();
    }

    public beginVisitFunctionDefinition(node: FunctionDefinition, parent?: STNode) {
        const viewState = new FunctionViewState();
        node.viewState = viewState;

        if (viewState.initPlus) {
            viewState.initPlus = undefined;
        }
        this.allEndpoints = new Map<string, Endpoint>();
    }

    public beginVisitListenerDeclaration(node: ListenerDeclaration, parent?: STNode) {
        const viewState = new ModuleMemberViewState();
        node.viewState = viewState;
    }

    public beginVisitModuleVarDecl(node: ModuleVarDecl) {
        const viewState = new ModuleMemberViewState();
        node.viewState = viewState;

        if (node.typeData && node.typeData.isEndpoint) {
            const bindingPattern = node.typedBindingPattern.bindingPattern as CaptureBindingPattern;
            if (this.allEndpoints.get(bindingPattern.variableName.value)) {
                node.viewState.endpoint.epName = bindingPattern.variableName.value;
                node.viewState.isEndpoint = true;
            }
        }
    }

    public beginVisitObjectField(node: ObjectField) {
        const viewState = new ModuleMemberViewState();
        node.viewState = viewState;

        if (node.typeData && node.typeData.isEndpoint) {
            const fieldName = node.fieldName.value;
            if (this.allEndpoints.get(fieldName)) {
                node.viewState.endpoint.epName = fieldName;
                node.viewState.isEndpoint = true;
            }
        }
    }

    public beginVisitRequiredParam(node: RequiredParam, parent?: STNode): void {
        const viewState = new ModuleMemberViewState();
        node.viewState = viewState;

        if (node.typeData && node.typeData.isEndpoint) {
            const endpointName = node.paramName?.value;
            if (endpointName) {
                node.viewState.endpoint.epName = endpointName;
                node.viewState.isEndpoint = true;
            }
        }
    }

    public beginVisitTypeDefinition(node: TypeDefinition) {
        const viewState = new ModuleMemberViewState();
        node.viewState = viewState;
    }

    public beginVisitResourceAccessorDefinition(node: ResourceAccessorDefinition, parent?: STNode) {
        const viewState = new FunctionViewState();
        node.viewState = viewState;
        this.allEndpoints = new Map<string, Endpoint>();
    }

    public beginVisitObjectMethodDefinition(node: ObjectMethodDefinition, parent?: STNode) {
        const viewState = new FunctionViewState();
        node.viewState = viewState;
        this.allEndpoints = new Map<string, Endpoint>();
    }

    public beginVisitServiceDeclaration(node: ServiceDeclaration, parent?: STNode) {
        node.viewState = new ServiceViewState();
        this.allEndpoints = new Map<string, Endpoint>();
    }

    public beginVisitFunctionBodyBlock(node: FunctionBodyBlock, parent?: STNode) {
        currentFnBody = node;
        this.allEndpoints = new Map<string, Endpoint>();
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
        node.viewState = new StatementViewState();
        this.initStatement(node, parent);
    }

    public beginVisitCheckAction(node: CheckAction, parent?: STNode) { // todo: Check panic is also replaced by this method
        node.viewState = new StatementViewState();
        const actionNode: STNode = isSTActionInvocation(node);
        const stmtViewState = node.viewState as StatementViewState;

        if (node.expression && actionNode) { // todo : need to find the right method from STTypeChecker
            // tslint:disable: prefer-conditional-expression
            // Adding conditional expression will reduce the readability
            let simpleName: string;
            let actionName;
            if (STKindChecker.isRemoteMethodCallAction(actionNode)) {
                if (STKindChecker.isFieldAccess(actionNode.expression)) {
                    simpleName = (actionNode.expression.fieldName as SimpleNameReference).name.value;
                } else {
                    simpleName = (actionNode.expression as SimpleNameReference).name.value;
                }
            } else if (actionNode.kind === 'ClientResourceAccessAction') {
                // TODO: fix syntax-tree lib and update any types
                if (STKindChecker.isFieldAccess((actionNode as any).expression)) {
                    simpleName = ((actionNode as any).expression.fieldName as SimpleNameReference).name.value;
                } else {
                    simpleName = ((actionNode as any).expression as SimpleNameReference).name.value;
                }
            }
            stmtViewState.action.endpointName = simpleName;
            actionName = (actionNode as any).methodName;
            if (actionName) {
                stmtViewState.action.actionName = actionName.name.value;
            } else if (currentFnBody && STKindChecker.isFunctionBodyBlock(currentFnBody)
                && currentFnBody.VisibleEndpoints) {

                const vp = currentFnBody.VisibleEndpoints?.find(ep => ep.name === simpleName);
                switch (vp?.moduleName) {
                    case 'http':
                        stmtViewState.action.actionName = 'get';
                        break;
                }
            }
            if (currentFnBody && STKindChecker.isFunctionBodyBlock(currentFnBody) && currentFnBody.VisibleEndpoints) {
                const callerParam = currentFnBody.VisibleEndpoints.find((vEP: any) => vEP.isCaller);
                stmtViewState.isCallerAction = callerParam && callerParam.name === simpleName;
            }
        }
    }

    public endVisitCallStatement(node: CallStatement, parent?: STNode) {
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
        node.viewState = new StatementViewState();
    }


    public beginVisitForeachStatement(node: ForeachStatement) {
        node.viewState = new ForEachViewState();
    }

    public beginVisitWhileStatement(node: WhileStatement) {
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

    public beginVisitTypeCastExpression(node: TypeCastExpression, parent?: STNode) {
        node.viewState = new StatementViewState();
    }

    public endVisitTypeCastExpression(node: TypeCastExpression, parent?: STNode) {
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
            if (currentVp && parentEp.visibleEndpoint.moduleName === currentVp.visibleEndpoint.moduleName
                && parentEp.visibleEndpoint.orgName === currentVp.visibleEndpoint.orgName) {
                parentEp.isExpandedPoint = true;
                parentEp.offsetValue = this.offsetValue;
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
        node.viewState = new StatementViewState();
    }

    public endVisitLocalVarDecl(node: LocalVarDecl, parent?: STNode) {
        this.initStatement(node, parent);
    }

    public beginVisitExpressionFunctionBody(node: ExpressionFunctionBody) {
        // todo: Check if this is the function to replace beginVisitExpressionStatement
        node.viewState = new BlockViewState();
        currentFnBody = node;
        this.allEndpoints = new Map<string, Endpoint>();
        // this.visitBlock(node, parent);
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
        }
    }

    public beginVisitNamedWorkerDeclaration(node: NamedWorkerDeclaration) {
        node.viewState = new WorkerDeclarationViewState();
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
                if (node.initializer.kind === "RemoteMethodCallAction" || node.initializer.kind === 'ClientResourceAccessAction') {
                    const remoteActionCall: RemoteMethodCallAction = node.initializer as RemoteMethodCallAction;
                    const typeInfo: any = remoteActionCall?.typeData?.symbol?.typeDescriptor;
                    if (typeInfo?.name === "BaseClient") {
                        stmtViewState.hidden = true;
                    }

                    let simpleName: SimpleNameReference;

                    if (STKindChecker.isSimpleNameReference(remoteActionCall.expression)) {
                        simpleName = remoteActionCall.expression as SimpleNameReference;
                    } else if (STKindChecker.isFieldAccess(remoteActionCall.expression)) {
                        const fieldAccessNode: FieldAccess = remoteActionCall.expression as FieldAccess;
                        simpleName = fieldAccessNode.fieldName as SimpleNameReference;
                    }

                    stmtViewState.action.endpointName = simpleName.name.value;
                    const actionName: SimpleNameReference = remoteActionCall.methodName as SimpleNameReference;
                    if (actionName) {
                        stmtViewState.action.actionName = actionName.name.value;
                    } else if (node.initializer.kind === 'ClientResourceAccessAction'
                        && currentFnBody && STKindChecker.isFunctionBodyBlock(currentFnBody)
                        && currentFnBody.VisibleEndpoints) {

                        const vp = currentFnBody.VisibleEndpoints?.find(ep => ep.name === simpleName.name.value);
                        switch (vp?.moduleName) {
                            case 'http':
                                stmtViewState.action.actionName = 'get';
                                break;
                        }
                    }
                    stmtViewState.isAction = true;
                    if (currentFnBody
                        && STKindChecker.isFunctionBodyBlock(currentFnBody)
                        && currentFnBody.VisibleEndpoints) {
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
                    const filteredStatements = body.statements?.filter(statement => {
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
