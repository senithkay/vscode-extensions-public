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
    BooleanLiteral,
    BooleanTypeDesc,
    CaptureBindingPattern,
    FloatTypeDesc,
    IdentifierToken,
    IntTypeDesc,
    JsonTypeDesc,
    LocalVarDecl,
    MappingConstructor,
    NumericLiteral,
    QualifiedNameReference,
    RecordField,
    RecordTypeDesc,
    SimpleNameReference,
    SpecificField,
    STKindChecker,
    STNode,
    StringLiteral,
    StringTypeDesc,
    TypedBindingPattern,
    Visitor,
    XmlTypeDesc
} from '@ballerina/syntax-tree';

import { PrimitiveBalType } from '../../../../ConfigurationSpec/types';
import { DataMapperViewState, InputFieldViewState, SourcePointViewState, TargetPointViewState } from '../viewstate';
import { InputVariableViewstate } from '../viewstate/input-variable-viewstate';

export enum VisitingType {
    INPUT,
    OUTPUT
}

export class DataMapperInitVisitor implements Visitor {
    private visitType: VisitingType;

    constructor(visitType: VisitingType) {
        this.visitType = visitType;
    }

    beginVisitAssignmentStatement(node: AssignmentStatement) {
        if (!node.dataMapperViewState) {
            node.dataMapperViewState = new InputFieldViewState();
        }

        const viewState: InputFieldViewState = node.dataMapperViewState as InputFieldViewState;
        viewState.hasMappedConstructorInitializer = node.expression.kind === 'MappingConstructor';

        // const typedBindingPattern = node.typedBindingPattern as TypedBindingPattern;
        // const bindingPattern = typedBindingPattern.bindingPattern as CaptureBindingPattern;
        // const typeDescriptor = typedBindingPattern.typeDescriptor;

        // if (STKindChecker.isStringTypeDesc(typeDescriptor)) {
        //     viewState.type = PrimitiveBalType.String;
        // } else if (STKindChecker.isIntTypeDesc(typeDescriptor)) {
        //     viewState.type = PrimitiveBalType.Int;
        // } else if (STKindChecker.isFloatTypeDesc(typeDescriptor)) {
        //     viewState.type = PrimitiveBalType.Float;
        // } else if (STKindChecker.isBooleanTypeDesc(typeDescriptor)) {
        //     viewState.type = PrimitiveBalType.Boolean;
        // } else if (STKindChecker.isJsonTypeDesc(typeDescriptor)) {
        //     viewState.type = PrimitiveBalType.Json;
        // } else if (STKindChecker.isXmlTypeDesc(typeDescriptor)) {
        //     viewState.type = PrimitiveBalType.Xml;
        // } else if (STKindChecker.isSimpleNameReference(typeDescriptor)) {
        //     const typeSymbol = node.typeData.typeSymbol;
        //     const moduleID = typeSymbol.moduleID;

        //     if (moduleID) {
        //         viewState.typeInfo = {
        //             name: (typeDescriptor as SimpleNameReference).name.value,
        //             orgName: moduleID.orgName,
        //             moduleName: moduleID.moduleName,
        //             version: moduleID.version
        //         }
        //     }
        // }

        // viewState.name = bindingPattern.variableName.value;

        // if (this.visitType === VisitingType.INPUT) {
        //     viewState.sourcePointViewState = new SourcePointViewState();
        // } else {
        //     if (node.initializer) {
        //         viewState.targetPointViewState = new TargetPointViewState();
        //         viewState.targetPointViewState.position = node.initializer.position;
        //         viewState.targetPointViewState.value = node.initializer.source;
        //         node.initializer.dataMapperViewState = new DataMapperViewState();
        //     }
        // }


        // if (node.dataMapperTypeDescNode && STKindChecker.isRecordTypeDesc(node.dataMapperTypeDescNode)) {
        //     viewState.type = PrimitiveBalType.Record;
        // }
    }

    beginVisitLocalVarDecl(node: LocalVarDecl) {
        if (!node.dataMapperViewState) {
            node.dataMapperViewState = new InputFieldViewState();
        }

        const viewState: InputFieldViewState = node.dataMapperViewState as InputFieldViewState;
        viewState.hasMappedConstructorInitializer = node.initializer.kind === 'MappingConstructor';

        const typedBindingPattern = node.typedBindingPattern as TypedBindingPattern;
        const bindingPattern = typedBindingPattern.bindingPattern as CaptureBindingPattern;
        const typeDescriptor = typedBindingPattern.typeDescriptor;

        if (STKindChecker.isStringTypeDesc(typeDescriptor)) {
            viewState.type = PrimitiveBalType.String;
        } else if (STKindChecker.isIntTypeDesc(typeDescriptor)) {
            viewState.type = PrimitiveBalType.Int;
        } else if (STKindChecker.isFloatTypeDesc(typeDescriptor)) {
            viewState.type = PrimitiveBalType.Float;
        } else if (STKindChecker.isBooleanTypeDesc(typeDescriptor)) {
            viewState.type = PrimitiveBalType.Boolean;
        } else if (STKindChecker.isJsonTypeDesc(typeDescriptor)) {
            viewState.type = PrimitiveBalType.Json;
        } else if (STKindChecker.isXmlTypeDesc(typeDescriptor)) {
            viewState.type = PrimitiveBalType.Xml;
        } else if (STKindChecker.isSimpleNameReference(typeDescriptor)) {
            const typeSymbol = node.typeData.typeSymbol;
            const moduleID = typeSymbol.moduleID;

            if (moduleID) {
                viewState.typeInfo = {
                    name: (typeDescriptor as SimpleNameReference).name.value,
                    orgName: moduleID.orgName,
                    moduleName: moduleID.moduleName,
                    version: moduleID.version
                }
            }
        }

        viewState.name = bindingPattern.variableName.value;

        if (this.visitType === VisitingType.INPUT) {
            viewState.sourcePointViewState = new SourcePointViewState();
        } else {
            if (node.initializer) {
                viewState.targetPointViewState = new TargetPointViewState();
                viewState.targetPointViewState.position = node.initializer.position;
                viewState.targetPointViewState.value = node.initializer.source;
                node.initializer.dataMapperViewState = new DataMapperViewState();
            }
        }


        if (node.dataMapperTypeDescNode && STKindChecker.isRecordTypeDesc(node.dataMapperTypeDescNode)) {
            viewState.type = PrimitiveBalType.Record;
        }
    }

    beginVisitRecordTypeDesc(node: RecordTypeDesc) {
        if (!node.dataMapperViewState) {
            node.dataMapperViewState = new InputFieldViewState();
        }

        node.dataMapperViewState.type = PrimitiveBalType.Record;
    }

    beginVisitRecordField(node: RecordField) {
        if (!node.dataMapperViewState) {
            node.dataMapperViewState = new InputFieldViewState();
        }

        const viewState: InputFieldViewState = node.dataMapperViewState as InputFieldViewState;
        const typeName = node.typeName;
        viewState.name = node.fieldName.value;

        if (STKindChecker.isStringTypeDesc(typeName)) {
            viewState.type = PrimitiveBalType.String;
        } else if (STKindChecker.isIntTypeDesc(typeName)) {
            viewState.type = PrimitiveBalType.Int;
        } else if (STKindChecker.isFloatTypeDesc(typeName)) {
            viewState.type = PrimitiveBalType.Float;
        } else if (STKindChecker.isBooleanTypeDesc(typeName)) {
            viewState.type = PrimitiveBalType.Boolean;
        } else if (STKindChecker.isJsonTypeDesc(typeName)) {
            viewState.type = PrimitiveBalType.Json;
        } else if (STKindChecker.isXmlTypeDesc(typeName)) {
            viewState.type = PrimitiveBalType.Xml;
        } else if (STKindChecker.isSimpleNameReference(typeName)) {
            const typeSymbol = node.typeData.typeSymbol;
            const moduleID = typeSymbol.moduleID;

            if (moduleID) {
                viewState.typeInfo = {
                    name: (typeName as SimpleNameReference).name.value,
                    orgName: moduleID.orgName,
                    moduleName: moduleID.moduleName,
                    version: moduleID.version
                }
            }
        }

        if (node.dataMapperTypeDescNode && STKindChecker.isRecordTypeDesc(node.dataMapperTypeDescNode)) {
            viewState.type = PrimitiveBalType.Record;
        }

        if (this.visitType === VisitingType.INPUT) {
            viewState.sourcePointViewState = new SourcePointViewState();
        } else {
            viewState.targetPointViewState = new TargetPointViewState();
        }
    }

    beginVisitSpecificField(node: SpecificField) {
        if (!node.dataMapperViewState) {
            node.dataMapperViewState = new InputFieldViewState();
        }
        const viewstate = node.dataMapperViewState as InputFieldViewState;

        switch (node.fieldName.kind) {
            case 'IdentifierToken':
                viewstate.name = (node.fieldName as IdentifierToken).value;
                break;
            case 'StringLiteral':
                viewstate.name = (node.fieldName as StringLiteral).literalToken.value;
                break;
            default:
            // ignored
        }

        if (node.valueExpr) {
            if (STKindChecker.isStringLiteral(node.valueExpr)) {
                viewstate.type = 'string';
            } else if (STKindChecker.isBooleanLiteral(node.valueExpr)) {
                viewstate.type = 'boolean';
            } else if (STKindChecker.isNumericLiteral(node.valueExpr)) {
                viewstate.type = 'float';
            } else if (STKindChecker.isMappingConstructor(node.valueExpr)) {
                viewstate.type = 'mapconstructor'; // TODO: check for the correct term
            }

            if (this.visitType === VisitingType.OUTPUT && !viewstate.targetPointViewState) {
                viewstate.targetPointViewState = new TargetPointViewState();
                viewstate.targetPointViewState.value = node.valueExpr.source;
                viewstate.targetPointViewState.position = node.valueExpr.position;
            }

            node.valueExpr.dataMapperViewState = new DataMapperViewState();
        }

        if (this.visitType === VisitingType.INPUT) {
            viewstate.sourcePointViewState = new SourcePointViewState();
        }
    }
}
