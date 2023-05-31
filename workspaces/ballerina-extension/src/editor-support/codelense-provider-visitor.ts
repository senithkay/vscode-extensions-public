/**
 * Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com) All Rights Reserved.
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */

import {
    STNode,
    Visitor,
    FunctionDefinition,
    ServiceDeclaration,
    ObjectMethodDefinition,
    ResourceAccessorDefinition,
    STKindChecker
} from "@wso2-enterprise/syntax-tree";
import { PALETTE_COMMANDS } from "../project";
import { CodeLens, Range, Uri } from "vscode";
import { log } from "console";

export class CodeLensProviderVisitor implements Visitor {
    activeEditorUri: Uri;
    codeLenses: CodeLens[] = [];
    supportedServiceTypes: string[] = ["http", "graphql"];

    constructor(activeEditorUri: Uri) {
        this.activeEditorUri = activeEditorUri;
    }

    public beginVisitFunctionDefinition(node: FunctionDefinition, parent?: STNode): void {
        this.createVisulizeCodeLens(node.functionName.position, node.position);
    }

    public beginVisitServiceDeclaration(node: ServiceDeclaration, parent?: STNode): void {
        if (node.expressions.length > 0) {
            const expr = node.expressions[0];
            if ((STKindChecker.isExplicitNewExpression(expr) &&
                expr.typeDescriptor &&
                STKindChecker.isQualifiedNameReference(expr.typeDescriptor) &&
                this.supportedServiceTypes.includes(expr.typeDescriptor.modulePrefix.value)) ||
                (STKindChecker.isSimpleNameReference(expr) &&
                    this.supportedServiceTypes.includes(expr.typeData.typeSymbol.moduleID.moduleName))) {
                this.createVisulizeCodeLens(node.serviceKeyword.position, node.position);
            }
        }
    }

    public beginVisitObjectMethodDefinition(node: ObjectMethodDefinition, parent?: STNode): void {
        this.createVisulizeCodeLens(node.functionKeyword.position, node.position);
    }

    public beginVisitResourceAccessorDefinition(node: ResourceAccessorDefinition, parent?: STNode): void {
        this.createVisulizeCodeLens(node.qualifierList[0].position, node.position);
    }

    private createVisulizeCodeLens(range: any, position: any) {
        const codeLens = new CodeLens(new Range(
            range.startLine,
            range.startColumn,
            range.endLine,
            range.endColumn
        ));
        codeLens.command = {
            title: "Visualize",
            tooltip: "Open this code block in low code view",
            command: PALETTE_COMMANDS.OPEN_IN_DIAGRAM,
            arguments: [this.activeEditorUri.fsPath, position]
        };
        this.codeLenses.push(codeLens);
    }

    public getCodeLenses(): CodeLens[] {
        return this.codeLenses;
    }
}
