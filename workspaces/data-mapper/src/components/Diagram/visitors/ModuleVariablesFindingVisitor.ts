/*
 * Copyright (c) 2023, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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
import { STSymbolInfo } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import {
    FieldAccess,
    OptionalFieldAccess,
    SimpleNameReference,
    STKindChecker,
    STNode,
    Visitor
} from "@wso2-enterprise/syntax-tree";

import { ModuleVariable, ModuleVarKind } from "../Node/ModuleVariable";

export class ModuleVariablesFindingVisitor implements Visitor {
    private readonly moduleVariables: Map<string, ModuleVariable>;
    private queryExpressionDepth: number;
    private moduleVarDecls: Map<string, STNode>;
    private constDecls: Map<string, STNode>;
    private configurables: Map<string, STNode>;

    constructor(symbolInfo: STSymbolInfo) {
        this.moduleVariables = new Map<string, ModuleVariable>();
        this.moduleVarDecls = symbolInfo.moduleVariables;
        this.constDecls = symbolInfo.constants;
        this.configurables = symbolInfo.configurables;
        this.queryExpressionDepth = 0
    }

    public beginVisitFieldAccess(node: FieldAccess, parent?: STNode) {
        if ((!parent || (!STKindChecker.isFieldAccess(parent) && !STKindChecker.isOptionalFieldAccess(parent)))
            && this.queryExpressionDepth === 0
        ) {
            const varName = node.source.trim().split('.')[0];
            const moduleVarKind = this.getModuleVarKind(varName);
            if (moduleVarKind !== undefined) {
                this.moduleVariables.set(varName, {
                    kind: moduleVarKind,
                    node
                });
            }
        }
    }

    public beginVisitOptionalFieldAccess(node: OptionalFieldAccess, parent?: STNode) {
        if ((!parent || (!STKindChecker.isFieldAccess(parent) && !STKindChecker.isOptionalFieldAccess(parent)))
            && this.queryExpressionDepth === 0
        ) {
            const varName = node.source.trim().split('.')[0];
            const moduleVarKind = this.getModuleVarKind(varName);
            if (moduleVarKind !== undefined) {
                this.moduleVariables.set(varName, {
                    kind: moduleVarKind,
                    node
                });
            }
        }
    }


    public beginVisitSimpleNameReference(node: SimpleNameReference, parent?: STNode) {
        if (STKindChecker.isIdentifierToken(node.name)
            && (!parent
                || (parent && !STKindChecker.isFieldAccess(parent) && !STKindChecker.isOptionalFieldAccess(parent)))
            && this.queryExpressionDepth === 0
        ) {
            const moduleVarKind = this.getModuleVarKind(node.name.value);
            if (moduleVarKind !== undefined) {
                this.moduleVariables.set(node.name.value, {
                    kind: moduleVarKind,
                    node
                });
            }
        }
    }

    public beginVisitQueryExpression() {
        this.queryExpressionDepth += 1;
    }

    public endVisitQueryExpression(){
        this.queryExpressionDepth -= 1;
    }

    private getModuleVarKind(varName: string) {
        let kind: ModuleVarKind;

        this.constDecls.forEach((node, key) => {
            if (key === varName && !kind) {
                kind = ModuleVarKind.Constant;
            }
        });
        this.configurables.forEach((node, key) => {
            if (key === varName && !kind) {
                kind = ModuleVarKind.Configurable;
            }
        })
        this.moduleVarDecls.forEach((node, key) => {
            if (key === varName && !kind) {
                kind = ModuleVarKind.Variable;
            }
        })

        return kind;
    }

    public getModuleVariables() {
        return this.moduleVariables;
    }

}
