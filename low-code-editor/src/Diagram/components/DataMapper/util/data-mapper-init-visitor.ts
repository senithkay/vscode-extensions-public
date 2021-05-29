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
    CheckExpression,
    FieldAccess,
    IdentifierToken,
    LocalVarDecl,
    MappingConstructor,
    MethodCall,
    RecordField,
    RecordTypeDesc,
    SimpleNameReference,
    SpecificField,
    STKindChecker,
    StringLiteral,
    TypedBindingPattern,
    Visitor,
} from '@ballerina/syntax-tree';
import { Method } from 'axios';
import { expression } from 'joi';

import { PrimitiveBalType } from '../../../../ConfigurationSpec/types';
import { DataMapperViewState, FieldViewState, SourcePointViewState, TargetPointViewState } from '../viewstate';

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
        } else if (STKindChecker.isRecordTypeDesc(typeDescriptor)) {
            viewState.type = PrimitiveBalType.Record;
            viewState.hasInlineRecordDescription = true;
        }

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
        } else if (STKindChecker.isUnionTypeDesc(typeName)) {
            viewState.type = PrimitiveBalType.Union;
            viewState.unionType = typeName.source.trim();
        } else if (STKindChecker.isRecordTypeDesc(typeName)) {
            viewState.type = PrimitiveBalType.Record;
            viewState.hasInlineRecordDescription = true;
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

        if (node.valueExpr) {
            if (STKindChecker.isStringLiteral(node.valueExpr)) {
                viewstate.type = 'string';
            } else if (STKindChecker.isBooleanLiteral(node.valueExpr)) {
                viewstate.type = 'boolean';
            } else if (STKindChecker.isNumericLiteral(node.valueExpr)) {
                viewstate.type = 'union';
                viewstate.unionType = 'int|float';
            } else if (STKindChecker.isMappingConstructor(node.valueExpr)) {
                viewstate.type = 'mapconstructor'; // TODO: check for the correct term
            } else if (STKindChecker.isSimpleNameReference(node.valueExpr)) {
                const simpleNameRefNode = node.valueExpr as SimpleNameReference;
                if (simpleNameRefNode.typeData) {
                    const typeSymbol = simpleNameRefNode.typeData.typeSymbol;
                    if (typeSymbol) {
                        viewstate.type = typeSymbol.typeKind;
                    }
                }
            } else if (STKindChecker.isMethodCall(node.valueExpr)) {
                const methodCallNode: MethodCall = node.valueExpr as MethodCall;
                methodCallNode.expression.dataMapperViewState = new DataMapperViewState();

                if (methodCallNode.typeData) {
                    const typeSymbol = methodCallNode.typeData.typeSymbol;
                    if (typeSymbol) {
                        viewstate.type = typeSymbol.typeKind;
                    }
                }
            } else if (STKindChecker.isFieldAccess(node.valueExpr)) {
                const fieldAccessNode: FieldAccess = node.valueExpr as FieldAccess;
                if (fieldAccessNode.typeData) {
                    const typeSymbol = fieldAccessNode.typeData.typeSymbol;
                    if (typeSymbol) {
                        switch (typeSymbol.typeKind) {
                            case 'int':
                            case 'float':
                                viewstate.type = 'union';
                                viewstate.unionType = 'int|float';;
                                break;
                            default:
                                viewstate.type = typeSymbol.typeKind;
                        }
                    }
                }
            } else if (STKindChecker.isBinaryExpression(node.valueExpr)) {
                const binaryExp: BinaryExpression = node.valueExpr as BinaryExpression;
                if (binaryExp.typeData) {
                    const typeSymbol = binaryExp.typeData.typeSymbol;
                    if (typeSymbol) {
                        switch (typeSymbol.typeKind) {
                            case 'int':
                            case 'float':
                                viewstate.type = 'union';
                                viewstate.unionType = 'int|float';;
                                break;
                            default:
                                viewstate.type = typeSymbol.typeKind;
                        }
                    }
                }
            }

            if (this.visitType === VisitingType.OUTPUT && !viewstate.targetPointViewState) {
                viewstate.targetPointViewState = new TargetPointViewState();
                viewstate.targetPointViewState.value = node.valueExpr.source;
                viewstate.targetPointViewState.type = viewstate.type;
                viewstate.targetPointViewState.unionType = viewstate.unionType;
                viewstate.targetPointViewState.position = node.valueExpr.position;
            }

            node.valueExpr.dataMapperViewState = new DataMapperViewState();
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
}
