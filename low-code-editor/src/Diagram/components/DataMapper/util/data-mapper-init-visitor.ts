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
    BinaryExpression,
    CaptureBindingPattern,
    CheckAction,
    CheckExpression,
    FieldAccess,
    IdentifierToken,
    LocalVarDecl,
    MethodCall,
    PositionalArg,
    QualifiedNameReference,
    RecordField,
    RecordTypeDesc,
    SimpleNameReference,
    SpecificField,
    STKindChecker,
    STNode,
    StringLiteral,
    TypeCastExpression,
    TypedBindingPattern,
    Visitor,
} from '@ballerina/syntax-tree';
import { types } from 'joi';

import { PrimitiveBalType } from '../../../../ConfigurationSpec/types';
import { DataMapperViewState, FieldViewState, SourcePointViewState, TargetPointViewState } from '../viewstate';

import { CONSTANT_TYPE } from './datamapper-constant-visitor';

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
            node.dataMapperViewState = new FieldViewState();
        }

        const viewState: FieldViewState = node.dataMapperViewState as FieldViewState;
        viewState.hasMappedConstructorInitializer = node.expression.kind === 'MappingConstructor';

        if (STKindChecker.isSimpleNameReference(node.varRef)) {
            const varRef: SimpleNameReference = node.varRef as SimpleNameReference;
            viewState.name = varRef.name.value;
            const typeSymbol = varRef.typeData?.typeSymbol;
            const moduleID = typeSymbol?.moduleID;

            if (typeSymbol.typeKind) {
                viewState.type = typeSymbol.typeKind;
            }

            if (moduleID) {
                viewState.typeInfo = {
                    name: typeSymbol.name,
                    orgName: moduleID.orgName,
                    moduleName: moduleID.moduleName,
                    version: moduleID.version
                }
            }
        }

        if (this.visitType === VisitingType.INPUT) {
            viewState.sourcePointViewState = new SourcePointViewState();
        } else {
            if (node.expression) {
                viewState.targetPointViewState = new TargetPointViewState();
                viewState.targetPointViewState.position = node.expression.position;
                viewState.targetPointViewState.value = node.expression.source;
                viewState.targetPointViewState.type = viewState.type;
                node.expression.dataMapperViewState = new DataMapperViewState();

                const initializerVS = new FieldViewState();
                if (STKindChecker.isStringLiteral(node.expression)
                    || STKindChecker.isBooleanLiteral(node.expression)
                    || STKindChecker.isNumericLiteral(node.expression)) {

                    initializerVS.type = CONSTANT_TYPE;
                    initializerVS.value = node.expression.literalToken.value;
                    initializerVS.sourcePointViewState = new SourcePointViewState();
                    node.expression.dataMapperViewState = initializerVS;
                }
            }
        }

        if (node.dataMapperTypeDescNode && STKindChecker.isRecordTypeDesc(node.dataMapperTypeDescNode)) {
            viewState.type = PrimitiveBalType.Record;
        }

    }

    beginVisitLocalVarDecl(node: LocalVarDecl) {
        if (!node.dataMapperViewState) {
            node.dataMapperViewState = new FieldViewState();
        }

        const viewState: FieldViewState = node.dataMapperViewState as FieldViewState;
        viewState.hasMappedConstructorInitializer = node.initializer.kind === 'MappingConstructor';

        const typedBindingPattern = node.typedBindingPattern as TypedBindingPattern;
        const bindingPattern = typedBindingPattern.bindingPattern as CaptureBindingPattern;
        const typeDescriptor = typedBindingPattern.typeDescriptor;

        setViewStateTypeInformation(viewState, typeDescriptor, node);

        viewState.name = bindingPattern.variableName.value;

        if (this.visitType === VisitingType.INPUT) {
            viewState.sourcePointViewState = new SourcePointViewState();
        } else {
            if (node.initializer) {
                viewState.targetPointViewState = new TargetPointViewState();
                viewState.targetPointViewState.position = node.initializer.position;
                viewState.targetPointViewState.value = node.initializer.source;
                viewState.targetPointViewState.type = viewState.type;
                node.initializer.dataMapperViewState = new DataMapperViewState();

                const initializerVS = new FieldViewState();
                if (STKindChecker.isStringLiteral(node.initializer)
                    || STKindChecker.isBooleanLiteral(node.initializer)
                    || STKindChecker.isNumericLiteral(node.initializer)) {

                    initializerVS.type = CONSTANT_TYPE;
                    initializerVS.value = node.initializer.literalToken.value;
                    initializerVS.sourcePointViewState = new SourcePointViewState();
                    node.initializer.dataMapperViewState = initializerVS;
                }
            }
        }


        if (node.dataMapperTypeDescNode && STKindChecker.isRecordTypeDesc(node.dataMapperTypeDescNode)) {
            viewState.type = PrimitiveBalType.Record;
        }
    }

    beginVisitRecordTypeDesc(node: RecordTypeDesc) {
        if (!node.dataMapperViewState) {
            node.dataMapperViewState = new FieldViewState();
        }

        node.dataMapperViewState.type = PrimitiveBalType.Record;
    }

    beginVisitRecordField(node: RecordField) {
        if (!node.dataMapperViewState) {
            node.dataMapperViewState = new FieldViewState();
        }

        const viewState: FieldViewState = node.dataMapperViewState as FieldViewState;
        const typeName = node.typeName;
        viewState.name = node.fieldName.value;

        setViewStateTypeInformation(viewState, typeName, node);

        if (node.dataMapperTypeDescNode && STKindChecker.isRecordTypeDesc(node.dataMapperTypeDescNode)) {
            viewState.type = PrimitiveBalType.Record;
        }

        if (node.questionMarkToken) {
            viewState.isOptionalType = true;
        }

        if (this.visitType === VisitingType.INPUT) {
            viewState.sourcePointViewState = new SourcePointViewState();
        } else {
            viewState.targetPointViewState = new TargetPointViewState();
        }
    }

    beginVisitSpecificField(node: SpecificField) {
        if (!node.dataMapperViewState) {
            node.dataMapperViewState = new FieldViewState();
        }
        const viewstate = node.dataMapperViewState as FieldViewState;

        switch (node.fieldName.kind) {
            case 'IdentifierToken':
                viewstate.name = (node.fieldName as IdentifierToken).value;
                break;
            case 'StringLiteral':
                const tokenValue = (node.fieldName as StringLiteral).literalToken.value;
                const regexForValWithQuotes = new RegExp("\"(.*?)\"$");
                if (regexForValWithQuotes.test(tokenValue)) {
                    const matchedVal = tokenValue.match(regexForValWithQuotes);
                    if (matchedVal.length > 1) {
                        viewstate.name = matchedVal[1];
                    }
                } else {
                    viewstate.name = tokenValue;
                }
                break;
            default:
            // ignored
        }

        if (node.typeData) {
            const typeSymbol = node.typeData.typeSymbol;
            if (typeSymbol) {
                setTypeFromTypeSymbol(viewstate, typeSymbol);
            }
        }


        if (node.valueExpr) {
            const valueExprVS = new FieldViewState();
            viewstate.hasMappedConstructorInitializer = STKindChecker.isMappingConstructor(node.valueExpr);

            if (STKindChecker.isStringLiteral(node.valueExpr)) {
                valueExprVS.type = CONSTANT_TYPE;
                valueExprVS.value = node.valueExpr.literalToken.value;
                if (this.visitType === VisitingType.OUTPUT) {
                    valueExprVS.sourcePointViewState = new SourcePointViewState();
                }
            } else if (STKindChecker.isBooleanLiteral(node.valueExpr)) {
                valueExprVS.type = CONSTANT_TYPE;
                valueExprVS.value = node.valueExpr.literalToken.value;
                if (this.visitType === VisitingType.OUTPUT) {
                    valueExprVS.sourcePointViewState = new SourcePointViewState();
                }
            } else if (STKindChecker.isNumericLiteral(node.valueExpr)) {
                valueExprVS.type = CONSTANT_TYPE;
                valueExprVS.value = node.valueExpr.literalToken.value;
                if (this.visitType === VisitingType.OUTPUT) {
                    valueExprVS.sourcePointViewState = new SourcePointViewState();
                }
            }

            if (this.visitType === VisitingType.OUTPUT && !viewstate.targetPointViewState) {
                viewstate.targetPointViewState = new TargetPointViewState();
                viewstate.targetPointViewState.value = node.valueExpr.source;
                viewstate.targetPointViewState.type = viewstate.type;
                viewstate.targetPointViewState.unionType = viewstate.unionType;
                viewstate.targetPointViewState.position = node.valueExpr.position;
            }

            node.valueExpr.dataMapperViewState = valueExprVS;
        }


        if (this.visitType === VisitingType.INPUT) {
            viewstate.sourcePointViewState = new SourcePointViewState();
        }
    }

    beginVisitBinaryExpression(node: BinaryExpression) {
        if (!node.dataMapperViewState) {
            node.dataMapperViewState = new DataMapperViewState();
        }

        node.lhsExpr.dataMapperViewState = new DataMapperViewState();
        node.rhsExpr.dataMapperViewState = new DataMapperViewState();
    }

    beginVisitCheckExpression(node: CheckExpression) {
        if (!node.dataMapperViewState) {
            node.dataMapperViewState = new DataMapperViewState();
        }

        node.expression.dataMapperViewState = new DataMapperViewState();
    }

    beginVisitMethodCall(node: MethodCall) {
        if (!node.dataMapperViewState) {
            node.dataMapperViewState = new DataMapperViewState();
        }

        node.expression.dataMapperViewState = new DataMapperViewState();
    }

    beginVisitPositionalArg(node: PositionalArg) {
        if (!node.dataMapperViewState) {
            node.dataMapperViewState = new DataMapperViewState();
        }

        node.expression.dataMapperViewState = new DataMapperViewState();
    }

    beginVisitTypeCastExpression(node: TypeCastExpression) {
        if (!node.dataMapperViewState) {
            node.dataMapperViewState = new DataMapperViewState();
        }

        node.expression.dataMapperViewState = new DataMapperViewState();
    }
}

function setTypeFromTypeSymbol(viewstate: FieldViewState, typeSymbol: any) {
    switch (typeSymbol.typeKind) {
        case PrimitiveBalType.String:
            viewstate.type = PrimitiveBalType.String;
            break;
        case PrimitiveBalType.Int:
            viewstate.type = PrimitiveBalType.Int;
            break;
        case PrimitiveBalType.Float:
            viewstate.type = PrimitiveBalType.Float;
            break;
        case PrimitiveBalType.Boolean:
            viewstate.type = PrimitiveBalType.Boolean;
            break;
        case PrimitiveBalType.Json:
            viewstate.type = PrimitiveBalType.Json;
            break;
        case PrimitiveBalType.Union:
            viewstate.type = PrimitiveBalType.Union;
            viewstate.unionType = typeSymbol.signature;
            break;
        case 'typeReference':
            const moduleID = typeSymbol?.moduleID;

            viewstate.type = 'record';

            if (moduleID) {
                viewstate.typeInfo = {
                    name: typeSymbol.name,
                    orgName: moduleID.orgName,
                    moduleName: moduleID.moduleName,
                    version: moduleID.version
                }
            }
            break;
        default:
        // TODO: check if applicable
    }
}

function setViewStateTypeInformation(viewState: FieldViewState, typeDescriptor: STNode, parentNode: STNode) {
    if (STKindChecker.isVarTypeDesc(typeDescriptor)) {
        viewState.type = PrimitiveBalType.Var;
    } else if (STKindChecker.isDecimalTypeDesc(typeDescriptor)) {
        viewState.type = 'decimal';
    } else if (STKindChecker.isStringTypeDesc(typeDescriptor)) {
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
    } else if (STKindChecker.isUnionTypeDesc(typeDescriptor)) {
        viewState.type = PrimitiveBalType.Union;
        viewState.unionType = typeDescriptor.source.trim();
    } else if (STKindChecker.isSimpleNameReference(typeDescriptor)) {
        const typeSymbol = parentNode.typeData.typeSymbol;
        const moduleID = typeSymbol.moduleID;

        if (moduleID) {
            viewState.typeInfo = {
                name: (typeDescriptor as SimpleNameReference).name.value,
                orgName: moduleID.orgName,
                moduleName: moduleID.moduleName,
                version: moduleID.version
            }
        }
    } else if (STKindChecker.isRecordTypeDesc(typeDescriptor)) {
        viewState.type = PrimitiveBalType.Record;
        viewState.hasInlineRecordDescription = true;
    } else if (STKindChecker.isQualifiedNameReference(typeDescriptor)) {
        const typeSymbol = parentNode.typeData.typeSymbol;
        const moduleID = typeSymbol.moduleID;
        viewState.type = `${typeDescriptor.modulePrefix.value}:${typeDescriptor.identifier.value}`;

        if (moduleID) {
            viewState.typeInfo = {
                name: typeDescriptor.identifier.value,
                orgName: moduleID.orgName,
                moduleName: moduleID.moduleName,
                version: moduleID.version
            }
        }
    } else if (STKindChecker.isOptionalTypeDesc(typeDescriptor)) {
        const realTypeDescNode = typeDescriptor.typeDescriptor;
        viewState.isOptionalType = true;
        setViewStateTypeInformation(viewState, realTypeDescNode, parentNode);
    }

}
