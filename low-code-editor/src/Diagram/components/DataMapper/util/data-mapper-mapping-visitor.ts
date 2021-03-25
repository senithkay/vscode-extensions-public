/*
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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
    ArrayTypeDesc, FieldAccess,
    LocalVarDecl,
    MappingConstructor,
    ReturnStatement,
    SimpleNameReference,
    SpecificField,
    Visitor
} from "@ballerina/syntax-tree";

import { StatementViewState } from "../../../view-state";
import { DraftUpdatePosition } from "../../../view-state/draft";
import { ConnectionViewState, SourcePointViewState, TargetPointViewState } from "../viewstate";
import { DataMapperStatementViewState } from "../viewstate/data-mapper-statement-viewstate";

import { MAIN_TARGET_NAME } from "./data-point-visitor";

export class DataMapperMappingVisitor implements Visitor {
    private isVisitingReturnStatement: boolean = false;
    private nameParts: string[] = [];
    private sourcePoints: Map<string, SourcePointViewState>;
    private targetPoints: Map<string, TargetPointViewState>;

    constructor(sourcePoints: Map<string, SourcePointViewState>, targetPoints: Map<string, TargetPointViewState>) {
        this.sourcePoints = sourcePoints;
        this.targetPoints = targetPoints;
    }

    beginVisitReturnStatement(node: ReturnStatement) {
        if (node.dataMapperViewState) {
            this.isVisitingReturnStatement = true;
            this.targetPoints.get(MAIN_TARGET_NAME).position = node.expression.position;
            node.expression.dataMapperViewState = node.dataMapperViewState;
            this.nameParts.push(MAIN_TARGET_NAME);
        }
    }

    endVisitReturnStatement(node: ReturnStatement) {
        if (node.dataMapperViewState) {
            this.isVisitingReturnStatement = false;
            const statementViewState: DataMapperStatementViewState = node.dataMapperViewState as DataMapperStatementViewState;
            statementViewState.references.forEach(ref => {
                const connectionVS = this._generateConnection(
                    ref,
                    this.generateDataPointName(this.nameParts),
                    node.expression.position
                );

                if (connectionVS) {
                    this.sourcePoints.get(ref).connections.push(connectionVS);
                }
            });
            statementViewState.references = [];
            this.nameParts.splice(this.nameParts.length - 1, 1);
        }
    }

    beginVisitMappingConstructor(node: MappingConstructor) {
        if (node.dataMapperViewState) {
            if (this.isVisitingReturnStatement) {
                node.fields.filter(field => field.kind !== 'CommaToken').forEach(field => {
                    field.dataMapperViewState = new DataMapperStatementViewState();
                })
            }
        }
    }

    beginVisitSpecificField(node: SpecificField) {
        if (node.dataMapperViewState) {
            if (this.isVisitingReturnStatement) {
                this.nameParts.push(node.fieldName.value);
            }
            node.valueExpr.dataMapperViewState = node.dataMapperViewState;
        }
    }

    endVisitSpecificField(node: SpecificField) {
        if (node.dataMapperViewState) {
            if (this.isVisitingReturnStatement) {
                const statementViewState: DataMapperStatementViewState = node.dataMapperViewState as DataMapperStatementViewState;
                statementViewState.references.forEach(ref => {
                    const connectionVS = this._generateConnection(
                        ref,
                        this.generateDataPointName(this.nameParts),
                        node.valueExpr.position
                    );

                    if (connectionVS) {
                        this.sourcePoints.get(ref).connections.push(connectionVS);
                    }
                });
                this.nameParts.splice(this.nameParts.length - 1, 1);

                statementViewState.references = [];
            }
        }
    }

    beginVisitSimpleNameReference(node: SimpleNameReference) {
        if (node.dataMapperViewState) {
            (node.dataMapperViewState as DataMapperStatementViewState).references?.push(node.source);
        }
    }

    beginVisitFieldAccess(node: FieldAccess) {
        if (node.dataMapperViewState) {
            (node.dataMapperViewState as DataMapperStatementViewState).references?.push(node.source);
        }
    }

    generateDataPointName(nameParts: string[]) {
        let name = '';

        nameParts.forEach((part: string, i: number) => {
            name += `${i !== 0 ? '.' : ''}${part}`;
        });

        return name;
    }

    _generateConnection(reference: string, targetName: string, position: DraftUpdatePosition): ConnectionViewState {
        const sourcePointVS = this.sourcePoints.get(reference);
        const targetPointVS = this.targetPoints.get(targetName);

        if (sourcePointVS && targetPointVS) {
            return new ConnectionViewState(
                sourcePointVS.bBox,
                targetPointVS.bBox,
                position
            );
        }

        return undefined;
    }
}
