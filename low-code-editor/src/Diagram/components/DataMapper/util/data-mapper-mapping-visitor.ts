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
    AssignmentStatement,
    FieldAccess,
    LocalVarDecl,
    OptionalFieldAccess,
    SimpleNameReference,
    SpecificField,
    STKindChecker,
    Visitor
} from "@ballerina/syntax-tree";

import { DraftUpdatePosition } from "../../../view-state/draft";
import { ConnectionViewState, FieldViewState, SourcePointViewState, TargetPointViewState } from "../viewstate";


export class DataMapperMappingVisitor implements Visitor {
    private isVisitingReturnStatement: boolean = false;
    private nameParts: string[] = [];
    private sourcePoints: Map<string, SourcePointViewState>;
    private targetPoints: Map<string, TargetPointViewState>;
    private constantPoints: Map<string, SourcePointViewState>;
    private references: string[] = [];
    private missingVariableRefName: string[] = [];
    private squashConstants: boolean;

    constructor(
        sourcePoints: Map<string, SourcePointViewState>,
        targetPoints: Map<string, TargetPointViewState>,
        constantPoints: Map<string, SourcePointViewState>,
        squashConstants?: boolean) {

        this.sourcePoints = sourcePoints;
        this.targetPoints = targetPoints;
        this.constantPoints = constantPoints;
        this.squashConstants = squashConstants;
    }

    beginVisitAssignmentStatement(node: AssignmentStatement) {
        if (node.dataMapperViewState) {
            const viewState = node.dataMapperViewState as FieldViewState;
            this.nameParts.push(viewState.name);

            if (viewState.isOptionalType && this.nameParts.length > 1) {
                this.nameParts[this.nameParts.length - 2]
                    = `${this.nameParts[this.nameParts.length - 2]}?`
            }
            const targetPoint = this.targetPoints.get(this.generateDataPointName(this.nameParts));
            if (targetPoint) {
                targetPoint.position = node.expression.position;
                targetPoint.value = node.expression.source;
            }
        }
    }

    endVisitAssignmentStatement(node: AssignmentStatement) {
        if (node.dataMapperViewState) {
            const viewstate = node.dataMapperViewState as FieldViewState;
            this.references.forEach(ref => {
                let dataPointRef;
                const refArray = ref.split('.');
                const sourceMapRef = this.sourcePoints;

                do {
                    dataPointRef = this.sourcePoints.get(this.generateDataPointName(refArray));
                    if (dataPointRef === undefined && refArray.length > 1) {
                        refArray.splice(refArray.length - 1, 1);

                        if (/.*\?$/gm.test(refArray[refArray.length - 1])) {
                            refArray[refArray.length - 1]
                                = refArray[refArray.length - 1]
                                    .substring(0, refArray[refArray.length - 1].length - 1);
                        }
                    }
                } while (dataPointRef === undefined && refArray.length > 1);

                if (!dataPointRef) {
                    dataPointRef = this.sourcePoints.get(this.generateDataPointName(refArray));
                }

                if (dataPointRef) {
                    const connectionVS = this._generateConnection(
                        this.generateDataPointName(refArray),
                        this.generateDataPointName(this.nameParts),
                        node.expression.position
                    );
                    dataPointRef.connections.push(connectionVS);
                } else {
                    const name = this.generateDataPointName(refArray);
                    if (this.missingVariableRefName.indexOf(name) === -1) {
                        this.missingVariableRefName.push(name);
                    }
                }
            });

            if (node.expression) {
                if (STKindChecker.isStringLiteral(node.expression)
                    || STKindChecker.isBooleanLiteral(node.expression)
                    || STKindChecker.isNumericLiteral(node.expression)) {

                    const targetPointVS = this.targetPoints.get(this.generateDataPointName(this.nameParts));

                    if (this.squashConstants) {
                        const sourcePointVS = this.constantPoints.get(node.expression.literalToken.value);

                        if (sourcePointVS && targetPointVS) {
                            sourcePointVS.connections.push(
                                new ConnectionViewState(
                                    sourcePointVS,
                                    targetPointVS,
                                    node.expression.position
                                )
                            );
                        }
                    } else {
                        (node.expression.dataMapperViewState as FieldViewState).sourcePointViewState.connections.push(
                            new ConnectionViewState(
                                (node.expression.dataMapperViewState as FieldViewState).sourcePointViewState,
                                targetPointVS,
                                node.expression.position
                            )
                        )
                    }
                }
            }

            if (viewstate.isOptionalType && this.nameParts.length > 1) {
                this.nameParts[this.nameParts.length - 2]
                    = this.nameParts[this.nameParts.length - 2]
                        .substring(0, this.nameParts[this.nameParts.length - 2].length - 1);
            }

            this.nameParts.splice(this.nameParts.length - 1, 1);
            this.references = [];
        }
    }

    beginVisitLocalVarDecl(node: LocalVarDecl) {
        if (node.dataMapperViewState) {
            const viewState = node.dataMapperViewState as FieldViewState;
            this.nameParts.push(viewState.name);
            if (viewState.isOptionalType && this.nameParts.length > 1) {
                this.nameParts[this.nameParts.length - 2]
                    = `${this.nameParts[this.nameParts.length - 2]}?`
            }
            const targetPoint = this.targetPoints.get(this.generateDataPointName(this.nameParts));
            if (targetPoint) {
                targetPoint.position = node.initializer.position;
                targetPoint.value = node.initializer.source;
            }
        }
    }

    endVisitLocalVarDecl(node: LocalVarDecl) {
        if (node.dataMapperViewState) {
            const viewstate = node.dataMapperViewState as FieldViewState;
            this.references.forEach(ref => {
                let dataPointRef;
                const refArray = ref.split('.');
                const sourceMapRef = this.sourcePoints;

                do {
                    dataPointRef = this.sourcePoints.get(this.generateDataPointName(refArray));
                    if (dataPointRef === undefined && refArray.length > 1) {
                        refArray.splice(refArray.length - 1, 1);

                        if (/.*\?$/gm.test(refArray[refArray.length - 1])) {
                            refArray[refArray.length - 1]
                                = refArray[refArray.length - 1]
                                    .substring(0, refArray[refArray.length - 1].length - 1);
                        }
                    }
                } while (dataPointRef === undefined && refArray.length > 1);

                if (!dataPointRef) {
                    dataPointRef = this.sourcePoints.get(this.generateDataPointName(refArray));
                }

                if (dataPointRef) {
                    const connectionVS = this._generateConnection(
                        this.generateDataPointName(refArray),
                        this.generateDataPointName(this.nameParts),
                        node.initializer.position
                    );
                    dataPointRef.connections.push(connectionVS);
                } else {
                    const name = this.generateDataPointName(refArray)
                    if (this.missingVariableRefName.indexOf(name) === -1) {
                        this.missingVariableRefName.push(name);
                    }
                }
            });

            if (node.initializer) {
                if (STKindChecker.isStringLiteral(node.initializer)
                    || STKindChecker.isBooleanLiteral(node.initializer)
                    || STKindChecker.isNumericLiteral(node.initializer)) {

                    const targetPointVS = this.targetPoints.get(this.generateDataPointName(this.nameParts));

                    if (this.squashConstants) {
                        const sourcePointVS = this.constantPoints.get(node.initializer.literalToken.value);

                        if (sourcePointVS && targetPointVS) {
                            sourcePointVS.connections.push(
                                new ConnectionViewState(
                                    sourcePointVS,
                                    targetPointVS,
                                    node.initializer.position
                                )
                            );
                        }
                    } else {
                        (node.initializer.dataMapperViewState as FieldViewState).sourcePointViewState.connections.push(
                            new ConnectionViewState(
                                (node.initializer.dataMapperViewState as FieldViewState).sourcePointViewState,
                                targetPointVS,
                                node.initializer.position
                            )
                        )
                    }

                }
            }

            if (viewstate.isOptionalType && this.nameParts.length > 1) {
                this.nameParts[this.nameParts.length - 2]
                    = this.nameParts[this.nameParts.length - 2]
                        .substring(0, this.nameParts[this.nameParts.length - 2].length - 1);
            }

            this.nameParts.splice(this.nameParts.length - 1, 1);
            this.references = [];
        }
    }

    beginVisitSpecificField(node: SpecificField) {
        if (node.dataMapperViewState) {
            const viewState = node.dataMapperViewState as FieldViewState;
            this.nameParts.push(viewState.name);
            if (viewState.isOptionalType && this.nameParts.length > 1) {
                this.nameParts[this.nameParts.length - 2]
                    = `${this.nameParts[this.nameParts.length - 2]}?`
            }
            const targetPoint = this.targetPoints.get(this.generateDataPointName(this.nameParts));
            if (targetPoint) {
                targetPoint.position = node.valueExpr.position;
                targetPoint.value = node.valueExpr.source;
            }
        }
    }

    endVisitSpecificField(node: SpecificField) {
        if (node.dataMapperViewState) {
            const viewstate = node.dataMapperViewState as FieldViewState;
            this.references.forEach(ref => {
                let dataPointRef;
                const refArray = ref.split('.');

                do {
                    dataPointRef = this.sourcePoints.get(this.generateDataPointName(refArray));
                    if (dataPointRef === undefined && refArray.length > 1) {
                        refArray.splice(refArray.length - 1, 1);

                        if (/.*\?$/gm.test(refArray[refArray.length - 1])) {
                            refArray[refArray.length - 1]
                                = refArray[refArray.length - 1]
                                    .substring(0, refArray[refArray.length - 1].length - 1);
                        }
                    }
                } while (dataPointRef === undefined && refArray.length > 1);

                if (!dataPointRef) {
                    dataPointRef = this.sourcePoints.get(this.generateDataPointName(refArray));
                }

                if (dataPointRef) {
                    const connectionVS = this._generateConnection(
                        this.generateDataPointName(refArray),
                        this.generateDataPointName(this.nameParts),
                        node.valueExpr.position
                    );
                    dataPointRef.connections.push(connectionVS);
                } else {

                    const name = this.generateDataPointName(refArray);
                    if (this.missingVariableRefName.indexOf(name) === -1) {
                        this.missingVariableRefName.push(name);
                    }
                }
            });

            if (node.valueExpr) {
                if (STKindChecker.isStringLiteral(node.valueExpr)
                    || STKindChecker.isBooleanLiteral(node.valueExpr)
                    || STKindChecker.isNumericLiteral(node.valueExpr)) {

                    const targetPointVS = this.targetPoints.get(this.generateDataPointName(this.nameParts));

                    if (this.squashConstants) {
                        const sourcePointVS = this.constantPoints.get(node.valueExpr.literalToken.value);

                        if (sourcePointVS && targetPointVS) {
                            sourcePointVS.connections.push(
                                new ConnectionViewState(
                                    sourcePointVS,
                                    targetPointVS,
                                    node.valueExpr.position
                                )
                            );
                        }
                    } else {
                        (node.valueExpr.dataMapperViewState as FieldViewState).sourcePointViewState.connections.push(
                            new ConnectionViewState(
                                (node.valueExpr.dataMapperViewState as FieldViewState).sourcePointViewState,
                                targetPointVS,
                                node.valueExpr.position
                            )
                        )
                    }
                }
            }

            this.references = [];
            if (viewstate.isOptionalType && this.nameParts.length > 1) {
                this.nameParts[this.nameParts.length - 2]
                    = this.nameParts[this.nameParts.length - 2]
                        .substring(0, this.nameParts[this.nameParts.length - 2].length - 1);
            }
            this.nameParts.splice(this.nameParts.length - 1, 1);
        }
    }

    beginVisitSimpleNameReference(node: SimpleNameReference) {
        if (node.dataMapperViewState) {
            this.references.push(node.source.trim());
        }
    }

    beginVisitOptionalFieldAccess(node: OptionalFieldAccess) {
        if (node.dataMapperViewState) {
            this.references.push(node.source.trim());
        }
    }

    beginVisitFieldAccess(node: FieldAccess) {
        if (node.dataMapperViewState) {
            this.references.push(node.source.trim());
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
                sourcePointVS,
                targetPointVS,
                position
            );
        }

        return undefined;
    }

    public getMissingVarRefList(): string[] {
        return this.missingVariableRefName;
    }
}
