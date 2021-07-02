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

import { AssignmentStatement, BooleanLiteral, LocalVarDecl, NumericLiteral, RecordField, RecordFieldWithDefaultValue, RequiredParam, SpecificField, STKindChecker, StringLiteral, Visitor } from "@ballerina/syntax-tree";

import { FieldViewState, SourcePointViewState, TargetPointViewState } from "../viewstate";

// export const MAIN_TARGET_NAME = 'MAIN_TARGET';
// export const OUTPUT_OFFSET_GAP = 560;

export class DataPointVisitor implements Visitor {
    private _sourcePointMap: Map<string, SourcePointViewState> = new Map();
    private _targetPointMap: Map<string, TargetPointViewState> = new Map();
    private _constantPointMap: Map<string, SourcePointViewState> = new Map();
    private nameComponents: string[] = [];
    private outPutOffsetGap: number = 0;
    private readonly sourceTypeX: number = 0;
    // private hasDataMapperTypeDesc: boolean;
    // private hasInlineTypeDesc: boolean;
    private hasMappingConstructor: boolean;

    constructor(maxFieldWidth: number, outputOffsetGap: number) {
        this.sourceTypeX = maxFieldWidth - 25;
        this.outPutOffsetGap = outputOffsetGap
    }

    get sourcePointMap(): Map<string, SourcePointViewState> {
        return this._sourcePointMap;
    }

    get targetPointMap(): Map<string, TargetPointViewState> {
        return this._targetPointMap;
    }

    get constantPointMap(): Map<string, SourcePointViewState> {
        return this._constantPointMap;
    }

    generateDataPointName(nameParts: string[]) {
        let name = '';

        nameParts.forEach((part: string, i: number) => {
            name += `${i !== 0 ? '.' : ''}${part}`;
        });

        return name;
    }

    beginVisitRequiredParam(node: RequiredParam) {
        if (node.dataMapperViewState) {
            const viewstate = node.dataMapperViewState as FieldViewState;
            this.nameComponents.push(viewstate.name);

            if (viewstate.isOptionalType && this.nameComponents.length > 1) {
                this.nameComponents[this.nameComponents.length - 2]
                    = `${this.nameComponents[this.nameComponents.length - 2]}?`
            }

            if (viewstate.sourcePointViewState) {
                viewstate.sourcePointViewState.bBox.x = this.sourceTypeX;
                viewstate.sourcePointViewState.bBox.y = viewstate.bBox.y;
                viewstate.sourcePointViewState.type = viewstate.type;
                viewstate.sourcePointViewState.connections = [];
                viewstate.sourcePointViewState.isOptionalType = viewstate.isOptionalType;
                viewstate.sourcePointViewState.text = this.generateDataPointName(this.nameComponents);
                this._sourcePointMap.set(this.generateDataPointName(this.nameComponents), viewstate.sourcePointViewState);
            }

            if (viewstate.targetPointViewState) {
                viewstate.targetPointViewState.bBox.x = this.outPutOffsetGap;
                viewstate.targetPointViewState.bBox.y = viewstate.bBox.y;
                viewstate.targetPointViewState.type = viewstate.type;
                viewstate.targetPointViewState.isOptionalType = viewstate.isOptionalType;
                this._targetPointMap.set(this.generateDataPointName(this.nameComponents), viewstate.targetPointViewState);
            }
        }
    }

    endVisitRequiredParam(node: RequiredParam) {
        if (node.dataMapperViewState) {
            const viewstate = node.dataMapperViewState as FieldViewState;

            if (viewstate.isOptionalType && this.nameComponents.length > 1) {
                this.nameComponents[this.nameComponents.length - 2]
                    = this.nameComponents[this.nameComponents.length - 2]
                        .substring(0, this.nameComponents[this.nameComponents.length - 2].length - 1);
            }

            this.nameComponents.splice(this.nameComponents.length - 1, 1);
            // this.hasDataMapperTypeDesc = false;
        }
    }

    beginVisitAssignmentStatement(node: AssignmentStatement) {
        if (node.dataMapperViewState) {
            const viewState = node.dataMapperViewState as FieldViewState;
            this.nameComponents.push(viewState.name);
            if (viewState.isOptionalType && this.nameComponents.length > 1) {
                this.nameComponents[this.nameComponents.length - 2]
                    = `${this.nameComponents[this.nameComponents.length - 2]}?`
            }
            // this.hasDataMapperTypeDesc = node.dataMapperTypeDescNode !== undefined;
            this.hasMappingConstructor = STKindChecker.isMappingConstructor(node.expression);

            if (viewState.sourcePointViewState) {
                viewState.sourcePointViewState.bBox.x = this.sourceTypeX;
                viewState.sourcePointViewState.bBox.y = viewState.bBox.y;
                viewState.sourcePointViewState.connections = [];
                viewState.sourcePointViewState.type = viewState.type;
                viewState.sourcePointViewState.text = this.generateDataPointName(this.nameComponents);
                this._sourcePointMap.set(this.generateDataPointName(this.nameComponents), viewState.sourcePointViewState);
            }

            if (viewState.targetPointViewState) {
                viewState.targetPointViewState.bBox.x = this.outPutOffsetGap;
                viewState.targetPointViewState.bBox.y = viewState.bBox.y;
                viewState.targetPointViewState.type = viewState.type;
                this._targetPointMap.set(this.generateDataPointName(this.nameComponents), viewState.targetPointViewState);
            }
        }
    }

    endVisitAssignmentStatement(node: AssignmentStatement) {
        if (node.dataMapperViewState) {
            const viewState = node.dataMapperViewState as FieldViewState;

            if (viewState.isOptionalType && this.nameComponents.length > 1) {
                this.nameComponents[this.nameComponents.length - 2]
                    = this.nameComponents[this.nameComponents.length - 2]
                        .substring(0, this.nameComponents[this.nameComponents.length - 2].length - 1);
            }

            this.nameComponents.splice(this.nameComponents.length - 1, 1);
            // this.hasDataMapperTypeDesc = false;
        }
    }

    beginVisitLocalVarDecl(node: LocalVarDecl) {
        if (node.dataMapperViewState) {
            const viewstate = node.dataMapperViewState as FieldViewState;
            this.nameComponents.push(viewstate.name);

            if (viewstate.isOptionalType && this.nameComponents.length > 1) {
                this.nameComponents[this.nameComponents.length - 2]
                    = `${this.nameComponents[this.nameComponents.length - 2]}?`
            }

            // this.hasDataMapperTypeDesc = node.dataMapperTypeDescNode !== undefined;
            // this.hasInlineTypeDesc = viewstate.hasInlineRecordDescription;
            this.hasMappingConstructor = STKindChecker.isMappingConstructor(node.initializer);

            if (viewstate.sourcePointViewState) {
                viewstate.sourcePointViewState.bBox.x = this.sourceTypeX;
                viewstate.sourcePointViewState.bBox.y = viewstate.bBox.y;
                viewstate.sourcePointViewState.type = viewstate.type;
                viewstate.sourcePointViewState.connections = [];
                viewstate.sourcePointViewState.isOptionalType = viewstate.isOptionalType;
                viewstate.sourcePointViewState.text = this.generateDataPointName(this.nameComponents);
                this._sourcePointMap.set(this.generateDataPointName(this.nameComponents), viewstate.sourcePointViewState);
            }

            if (viewstate.targetPointViewState) {
                viewstate.targetPointViewState.bBox.x = this.outPutOffsetGap;
                viewstate.targetPointViewState.bBox.y = viewstate.bBox.y;
                viewstate.targetPointViewState.type = viewstate.type;
                viewstate.targetPointViewState.isOptionalType = viewstate.isOptionalType;
                this._targetPointMap.set(this.generateDataPointName(this.nameComponents), viewstate.targetPointViewState);
            }
        }
    }

    endVisitLocalVarDecl(node: LocalVarDecl) {
        if (node.dataMapperViewState) {
            const viewstate = node.dataMapperViewState as FieldViewState;

            if (viewstate.isOptionalType && this.nameComponents.length > 1) {
                this.nameComponents[this.nameComponents.length - 2]
                    = this.nameComponents[this.nameComponents.length - 2]
                        .substring(0, this.nameComponents[this.nameComponents.length - 2].length - 1);
            }

            this.nameComponents.splice(this.nameComponents.length - 1, 1);
            // this.hasDataMapperTypeDesc = false;
        }
    }

    beginVisitRecordField(node: RecordField) {
        if (node.dataMapperViewState && !this.hasMappingConstructor) {
            const viewstate = node.dataMapperViewState as FieldViewState;
            this.nameComponents.push(viewstate.name);

            if (viewstate.isOptionalType && this.nameComponents.length > 1) {
                this.nameComponents[this.nameComponents.length - 2]
                    = `${this.nameComponents[this.nameComponents.length - 2]}?`
            }

            if (viewstate.sourcePointViewState) {
                viewstate.sourcePointViewState.bBox.x = this.sourceTypeX;
                viewstate.sourcePointViewState.bBox.y = viewstate.bBox.y;
                viewstate.sourcePointViewState.connections = [];
                viewstate.sourcePointViewState.isOptionalType = viewstate.isOptionalType;
                viewstate.sourcePointViewState.type = viewstate.type;
                viewstate.sourcePointViewState.text = this.generateDataPointName(this.nameComponents);
                this._sourcePointMap.set(this.generateDataPointName(this.nameComponents), viewstate.sourcePointViewState);
            }

            if (viewstate.targetPointViewState) {
                viewstate.targetPointViewState.bBox.x = this.outPutOffsetGap;
                viewstate.targetPointViewState.bBox.y = viewstate.bBox.y;
                viewstate.targetPointViewState.type = viewstate.type;
                viewstate.targetPointViewState.isOptionalType = viewstate.isOptionalType;
                this._targetPointMap.set(this.generateDataPointName(this.nameComponents), viewstate.targetPointViewState);
            }
        }
    }

    beginVisitResourcePathSegmentParam(node: any) {
        if (node.dataMapperViewState) {
            const viewstate = node.dataMapperViewState as FieldViewState;
            this.nameComponents.push(viewstate.name);

            if (viewstate.sourcePointViewState) {
                viewstate.sourcePointViewState.bBox.x = this.sourceTypeX;
                viewstate.sourcePointViewState.bBox.y = viewstate.bBox.y;
                viewstate.sourcePointViewState.connections = [];
                viewstate.sourcePointViewState.isOptionalType = viewstate.isOptionalType;
                viewstate.sourcePointViewState.type = viewstate.type;
                viewstate.sourcePointViewState.text = this.generateDataPointName(this.nameComponents);
                this._sourcePointMap.set(this.generateDataPointName(this.nameComponents), viewstate.sourcePointViewState);
            }
        }
    }

    endVisitResourcePathSegmentParam(node: any) {
        if (node.dataMapperViewState) {
            this.nameComponents.splice(this.nameComponents.length - 1, 1);
        }
    }

    endVisitRecordField(node: RecordField) {
        if (node.dataMapperViewState && !this.hasMappingConstructor) {
            const viewstate = node.dataMapperViewState as FieldViewState;

            if (viewstate.isOptionalType && this.nameComponents.length > 1) {
                this.nameComponents[this.nameComponents.length - 2]
                    = this.nameComponents[this.nameComponents.length - 2]
                        .substring(0, this.nameComponents[this.nameComponents.length - 2].length - 1);
            }

            this.nameComponents.splice(this.nameComponents.length - 1, 1);
        }
    }

    beginVisitRecordFieldWithDefaultValue(node: RecordFieldWithDefaultValue) {
        if (node.dataMapperViewState && !this.hasMappingConstructor) {
            const viewstate = node.dataMapperViewState as FieldViewState;
            this.nameComponents.push(viewstate.name);

            if (viewstate.isOptionalType && this.nameComponents.length > 1) {
                this.nameComponents[this.nameComponents.length - 2]
                    = `${this.nameComponents[this.nameComponents.length - 2]}?`
            }

            if (viewstate.sourcePointViewState) {
                viewstate.sourcePointViewState.bBox.x = this.sourceTypeX;
                viewstate.sourcePointViewState.bBox.y = viewstate.bBox.y;
                viewstate.sourcePointViewState.connections = [];
                viewstate.sourcePointViewState.isOptionalType = viewstate.isOptionalType;
                viewstate.sourcePointViewState.type = viewstate.type;
                viewstate.sourcePointViewState.text = this.generateDataPointName(this.nameComponents);
                this._sourcePointMap.set(this.generateDataPointName(this.nameComponents), viewstate.sourcePointViewState);
            }

            if (viewstate.targetPointViewState) {
                viewstate.targetPointViewState.bBox.x = this.outPutOffsetGap;
                viewstate.targetPointViewState.bBox.y = viewstate.bBox.y;
                viewstate.targetPointViewState.type = viewstate.type;
                viewstate.targetPointViewState.isOptionalType = viewstate.isOptionalType;
                this._targetPointMap.set(this.generateDataPointName(this.nameComponents), viewstate.targetPointViewState);
            }
        }
    }

    endVisitRecordFieldWithDefaultValue(node: RecordFieldWithDefaultValue) {
        if (node.dataMapperViewState && !this.hasMappingConstructor) {
            const viewstate = node.dataMapperViewState as FieldViewState;

            if (viewstate.isOptionalType && this.nameComponents.length > 1) {
                this.nameComponents[this.nameComponents.length - 2]
                    = this.nameComponents[this.nameComponents.length - 2]
                        .substring(0, this.nameComponents[this.nameComponents.length - 2].length - 1);
            }

            this.nameComponents.splice(this.nameComponents.length - 1, 1);
        }
    }

    beginVisitSpecificField(node: SpecificField) {
        if (node.dataMapperViewState && this.hasMappingConstructor) {
            const viewstate = node.dataMapperViewState as FieldViewState;
            this.nameComponents.push(viewstate.name);

            if (viewstate.isOptionalType && this.nameComponents.length > 1) {
                this.nameComponents[this.nameComponents.length - 2]
                    = `${this.nameComponents[this.nameComponents.length - 2]}?`
            }

            if (viewstate.sourcePointViewState) {
                viewstate.sourcePointViewState.bBox.x = this.sourceTypeX;
                viewstate.sourcePointViewState.bBox.y = viewstate.bBox.y;
                viewstate.sourcePointViewState.text = this.generateDataPointName(this.nameComponents);
                viewstate.sourcePointViewState.type = viewstate.type;
                viewstate.sourcePointViewState.connections = [];
                this._sourcePointMap.set(this.generateDataPointName(this.nameComponents), viewstate.sourcePointViewState);
            }

            if (viewstate.targetPointViewState) {
                viewstate.targetPointViewState.bBox.x = this.outPutOffsetGap;
                viewstate.targetPointViewState.bBox.y = viewstate.bBox.y;
                viewstate.targetPointViewState.type = viewstate.type;
                this._targetPointMap.set(this.generateDataPointName(this.nameComponents), viewstate.targetPointViewState);
            }
        }
    }

    endVisitSpecificField(node: SpecificField) {
        if (node.dataMapperViewState && this.hasMappingConstructor) {
            const viewstate = node.dataMapperViewState as FieldViewState;

            if (viewstate.isOptionalType && this.nameComponents.length > 1) {
                this.nameComponents[this.nameComponents.length - 2]
                    = this.nameComponents[this.nameComponents.length - 2]
                        .substring(0, this.nameComponents[this.nameComponents.length - 2].length - 1);
            }
            this.nameComponents.splice(this.nameComponents.length - 1, 1);
        }
    }

    beginVisitStringLiteral(node: StringLiteral) {
        const viewstate = node.dataMapperViewState;

        if (viewstate && viewstate instanceof FieldViewState && viewstate.sourcePointViewState) {
            viewstate.sourcePointViewState.bBox.x = this.sourceTypeX;
            viewstate.sourcePointViewState.bBox.y = viewstate.bBox.y;
            viewstate.sourcePointViewState.text = viewstate.value;
            viewstate.sourcePointViewState.connections = [];
            this.constantPointMap.set(viewstate.value, viewstate.sourcePointViewState);
        }
    }

    beginVisitBooleanLiteral(node: BooleanLiteral) {
        const viewstate = node.dataMapperViewState;

        if (viewstate && viewstate instanceof FieldViewState && viewstate.sourcePointViewState) {
            viewstate.sourcePointViewState.bBox.x = this.sourceTypeX;
            viewstate.sourcePointViewState.bBox.y = viewstate.bBox.y;
            viewstate.sourcePointViewState.text = viewstate.value;
            viewstate.sourcePointViewState.connections = [];
            this.constantPointMap.set(viewstate.value, viewstate.sourcePointViewState);
        }
    }

    beginVisitNumericLiteral(node: NumericLiteral) {
        const viewstate = node.dataMapperViewState;

        if (viewstate && viewstate instanceof FieldViewState && viewstate.sourcePointViewState) {
            viewstate.sourcePointViewState.bBox.x = this.sourceTypeX;
            viewstate.sourcePointViewState.bBox.y = viewstate.bBox.y;
            viewstate.sourcePointViewState.text = viewstate.value;
            viewstate.sourcePointViewState.connections = [];
            this.constantPointMap.set(viewstate.value, viewstate.sourcePointViewState);
        }
    }
}
