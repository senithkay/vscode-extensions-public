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
    STNode,
    StringLiteral,
    StringTypeDesc,
    TypedBindingPattern,
    Visitor,
    XmlTypeDesc
} from '@ballerina/syntax-tree';

import { DataMapperViewState, SourcePointViewState } from '../viewstate';
import { InputVariableViewstate } from '../viewstate/input-variable-viewstate';

export class DataMapperInitVisitor implements Visitor {

    beginVisitLocalVarDecl(node: LocalVarDecl) {
        if (!node.dataMapperViewState) {
            const dataMapperViewState = new InputVariableViewstate();
            dataMapperViewState.mappedConstructorInitializer = node.initializer.kind === 'MappingConstructor';
            dataMapperViewState.isInput = true;
            dataMapperViewState.sourcePointViewState = new SourcePointViewState();
            node.typedBindingPattern.dataMapperViewState = dataMapperViewState;

            if (node.dataMapperTypeDescNode) {
                node.dataMapperTypeDescNode.dataMapperViewState = new InputVariableViewstate();
                node.dataMapperTypeDescNode.dataMapperViewState.isInput = true;
            } else if (dataMapperViewState.mappedConstructorInitializer) {
                node.initializer.dataMapperViewState = new InputVariableViewstate();
                node.initializer.dataMapperViewState.isInput = true;
            }

            node.dataMapperViewState = dataMapperViewState;
        }
    }

    beginVisitTypedBindingPattern(node: TypedBindingPattern) {
        if (node.dataMapperViewState) {
            node.bindingPattern.dataMapperViewState = node.dataMapperViewState;
            node.typeDescriptor.dataMapperViewState = node.dataMapperViewState;
        }
    }

    beginVisitCaptureBindingPattern(node: CaptureBindingPattern) {
        if (node.dataMapperViewState) {
            const viewstate = node.dataMapperViewState as InputVariableViewstate;
            viewstate.name = node.variableName.value;
        }
    }

    beginVisitSimpleNameReference(node: SimpleNameReference) {
        if (node.dataMapperViewState) {
            if (node.dataMapperViewState.isInput) {
                const viewstate = node.dataMapperViewState as InputVariableViewstate;
                const typeSymbol = node.typeData.typeSymbol;
                const moduleID = typeSymbol.moduleID;

                if (moduleID) {
                    viewstate.typeInfo = {
                        name: node.name.value,
                        orgName: moduleID.orgName,
                        moduleName: moduleID.moduleName,
                        version: moduleID.version
                    }
                }
            }
        }
    }

    beginVisitStringTypeDesc(node: StringTypeDesc) {
        if (node.dataMapperViewState) {
            node.dataMapperViewState.type = 'string';
        }
    }

    beginVisitIntTypeDesc(node: IntTypeDesc) {
        if (node.dataMapperViewState) {
            node.dataMapperViewState.type = 'int';
        }
    }

    beginVisitFloatTypeDesc(node: FloatTypeDesc) {
        if (node.dataMapperViewState) {
            node.dataMapperViewState.type = 'float';
        }
    }

    beginVisitBooleanTypeDesc(node: BooleanTypeDesc) {
        if (node.dataMapperViewState) {
            node.dataMapperViewState.type = 'boolean';
        }
    }

    beginVisitXmlTypeDesc(node: XmlTypeDesc) {
        if (node.dataMapperViewState) {
            node.dataMapperViewState.type = 'xml'
        }
    }

    beginVisitJsonTypeDesc(node: JsonTypeDesc) {
        if (node.dataMapperViewState) {
                node.dataMapperViewState.type = 'json';
        }
    }

    beginVisitRecordTypeDesc(node: RecordTypeDesc) {
        if (node.dataMapperViewState) {
            const viewstate = node.dataMapperViewState as InputVariableViewstate;
            if (viewstate.isInput) {
                node.fields.forEach(field => {
                    const fieldVS = new InputVariableViewstate();
                    fieldVS.sourcePointViewState = new SourcePointViewState();
                    fieldVS.isInput = true;
                    field.dataMapperViewState = fieldVS;
                })
            }
        }
    }

    beginVisitRecordField(node: RecordField) {
        if (node.dataMapperViewState) {
            if (node.dataMapperViewState.isInput) {
                const viewstate = node.dataMapperViewState as InputVariableViewstate;
                viewstate.name = node.fieldName.value;
                node.typeName.dataMapperViewState = viewstate;
            }
        }
    }

    beginVisitQualifiedNameReference(node: QualifiedNameReference) {
        // todo: handle
    }

    endVisitLocalVarDecl(node: LocalVarDecl) {
        if (node.dataMapperViewState) {
            const viewstate = node.dataMapperViewState as InputVariableViewstate;
            if (!viewstate.type) {
                viewstate.type = 'record';
            }
        }
    }

    beginVisitMappingConstructor(node: MappingConstructor) {
        if (node.dataMapperViewState) {
            node.dataMapperViewState.type = 'map';
            if (node.dataMapperViewState.isInput) {
                node.fields.filter(field => field.kind !== "CommaToken").forEach(field => {
                    field.dataMapperViewState = new InputVariableViewstate();
                    field.dataMapperViewState.isInput = true;
                })
            }
        }
    }

    beginVisitSpecificField(node: SpecificField) {
        if (node.dataMapperViewState) {
            if (node.dataMapperViewState.isInput) {
                const viewstate = node.dataMapperViewState as InputVariableViewstate;
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
                    node.valueExpr.dataMapperViewState = viewstate;
                }
            }
        }
    }

    beginVisitStringLiteral(node: StringLiteral) {
        if (node.dataMapperViewState) {
            node.dataMapperViewState.type = 'string';
        }
    }

    beginVisitBooleanLiteral(node: BooleanLiteral) {
        if (node.dataMapperViewState) {
            node.dataMapperViewState.type = 'boolean';
        }
    }

    beginVisitNumericLiteral(node: NumericLiteral) {
        if (node.dataMapperViewState) {
            node.dataMapperViewState.type = 'float';
        }
    }
}
