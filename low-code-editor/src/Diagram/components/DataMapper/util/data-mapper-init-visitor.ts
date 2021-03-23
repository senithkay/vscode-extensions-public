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
    ArrayTypeDesc,
    ExplicitAnonymousFunctionExpression, FloatTypeDesc, IntTypeDesc, JsonTypeDesc, RecordField, RecordTypeDesc,
    RequiredParam,
    ReturnTypeDescriptor, SimpleNameReference,
    STNode, StringTypeDesc,
    Visitor, XmlTypeDesc
} from '@ballerina/syntax-tree';

import {
    DataMapperFunctionViewState,
    DataMapperViewState,
    SourcePointViewState, TargetPointViewState,
    TypeDescViewState
} from '../viewstate';


export class DataMapperInitVisitor implements Visitor {
    beginVisitSTNode(node: STNode) {
        if (!node.dataMapperViewState) {
            node.dataMapperViewState = new DataMapperViewState();
        }
    }

    beginVisitExplicitAnonymousFunctionExpression(node: ExplicitAnonymousFunctionExpression) {
        if (!node.dataMapperViewState) {
            node.dataMapperViewState = new DataMapperFunctionViewState();
        }
    }

    beginVisitRequiredParam(node: RequiredParam) {
        if (!node.dataMapperViewState) {
            const viewState: TypeDescViewState = new TypeDescViewState();
            viewState.sourcePointViewState = new SourcePointViewState();
            viewState.name = node.paramName.value;
            viewState.isSource = true;
            node.typeName.dataMapperViewState = viewState;
        }
    }

    endVisitRequiredParam(node: RequiredParam, parent?: STNode) {
        if (!node.dataMapperViewState) {
            node.dataMapperViewState = node.typeName.dataMapperViewState;
        }
    }

    beginVisitReturnTypeDescriptor(node: ReturnTypeDescriptor) {
        if (!node.dataMapperViewState) {
            node.type.dataMapperViewState = new TypeDescViewState();
            node.type.dataMapperViewState.isTarget = true;
        }
    }

    endVisitReturnTypeDescriptor(node: ReturnTypeDescriptor) {
        if (!node.dataMapperViewState) {
            node.dataMapperViewState = node.type.dataMapperViewState;
        }
    }

    beginVisitStringTypeDesc(node: StringTypeDesc) {
        if (node.dataMapperViewState) {
            const viewState: TypeDescViewState = node.dataMapperViewState;
            viewState.type = 'string';
        }
    }

    beginVisitIntTypeDesc(node: IntTypeDesc) {
        if (node.dataMapperViewState) {
            const viewState: TypeDescViewState = node.dataMapperViewState;
            viewState.type = 'int';
        }
    }

    beginVisitFloatTypeDesc(node: FloatTypeDesc) {
        if (node.dataMapperViewState) {
            const viewState: TypeDescViewState = node.dataMapperViewState;
            viewState.type = 'float';
        }
    }

    beginVisitXmlTypeDesc(node: XmlTypeDesc) {
        if (node.dataMapperViewState) {
            const viewState: TypeDescViewState = node.dataMapperViewState;
            viewState.type = 'xml';
        }
    }

    beginVisitJsonTypeDesc(node: JsonTypeDesc) {
        if (node.dataMapperViewState) {
            const viewState: TypeDescViewState = node.dataMapperViewState;
            viewState.type = 'json';
        }
    }

    beginVisitArrayTypeDesc(node: ArrayTypeDesc) {
        if (node.dataMapperViewState) {
            node.memberTypeDesc.dataMapperViewState = node.dataMapperViewState;
        }
    }

    endVisitArrayTypeDesc(node: ArrayTypeDesc, parent?: STNode) {
        if (node.dataMapperViewState) {
            const viewState: TypeDescViewState = node.memberTypeDesc.dataMapperViewState as TypeDescViewState;
            viewState.collectionDataType = viewState.type;
            viewState.type = 'collection';
        }
    }

    beginVisitRecordTypeDesc(node: RecordTypeDesc) {
        if (node.dataMapperViewState) {
            const viewState: TypeDescViewState = node.dataMapperViewState as TypeDescViewState;
            viewState.type = 'record';
            if (viewState.isSource) {
                viewState.sourcePointViewState = new SourcePointViewState();
                viewState.sourcePointViewState.text = viewState.name;
            }

            if (viewState.isTarget) {
                viewState.targetPointViewState = new TargetPointViewState();
            }

            node.dataMapperViewState = viewState;

            node.fields.forEach(field => {
                field.dataMapperViewState = new TypeDescViewState();
                field.dataMapperViewState.isSource = viewState.isSource;
                field.dataMapperViewState.isTarget = viewState.isTarget;

                if (viewState.isSource) {
                    field.dataMapperViewState.sourcePointViewState = new SourcePointViewState();
                    field.dataMapperViewState.sourcePointViewState.text = viewState.name;
                }

                if (viewState.isTarget) {
                    field.dataMapperViewState.targetPointViewState = new TargetPointViewState();
                }
            })
        }
    }

    beginVisitRecordField(node: RecordField) {
        if (node.dataMapperViewState) {
            const viewstate = node.dataMapperViewState as TypeDescViewState;
            viewstate.name = node.fieldName.value;

            if (viewstate.isSource) {
                viewstate.sourcePointViewState.text += `.${viewstate.name}`;
            }
            node.typeName.dataMapperViewState = viewstate;
        }
    }

    endVisitRecordField(node: RecordField) {
        if (!node.dataMapperViewState) {
            node.dataMapperViewState = node.typeName.dataMapperViewState;
        }
    }

    beginVisitSimpleNameReference(node: SimpleNameReference) {
        if (node.dataMapperViewState) {
            const viewState: TypeDescViewState = node.dataMapperViewState as TypeDescViewState;
            const typeSymbol = node.typeData.typeSymbol;
            viewState.typeInfo = {
                name: typeSymbol.name,
                moduleName: typeSymbol.moduleID.moduleName,
                orgName: typeSymbol.moduleID.orgName,
                version: typeSymbol.moduleID.version
            }
        }
    }
}

