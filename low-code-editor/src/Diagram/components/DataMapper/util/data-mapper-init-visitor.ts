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
    FloatTypeDesc, FunctionBodyBlock,
    IntTypeDesc,
    JsonTypeDesc,
    RecordField,
    RecordTypeDesc,
    RequiredParam, ReturnStatement,
    ReturnTypeDescriptor,
    SimpleNameReference,
    STNode,
    StringTypeDesc,
    traversNode,
    Visitor,
    XmlTypeDesc
} from '@ballerina/syntax-tree';

import { DataMapperViewState, DataPointViewState } from '../viewstate';


export class DataMapperInitVisitor implements Visitor {
    private recordListMap: Map<string, STNode>;

    constructor(recordListMap: Map<string, STNode>) {
        this.recordListMap = recordListMap;
    }

    beginVisitSTNode(node: STNode) {
        if (!node.dataMapperViewState) {
            node.dataMapperViewState = new DataMapperViewState();
        }
    }

    beginVisitReturnTypeDescriptor(node: ReturnTypeDescriptor) {
        if (!node.dataMapperViewState) {
            node.dataMapperViewState = new DataMapperViewState();
            node.type.dataMapperViewState = node.dataMapperViewState;
        }
    }

    beginVisitRequiredParam(node: RequiredParam) {
        if (!node.dataMapperViewState) {
            const viewState = new DataPointViewState();
            viewState.name = node.paramName.value;
            node.typeName.dataMapperViewState = viewState;
        }
    }

    endVisitRequiredParam(node: RequiredParam) {
        if (!node.dataMapperViewState && node.typeName.viewState) {
            node.dataMapperViewState = node.typeName.dataMapperViewState;
        }
    }

    beginVisitStringTypeDesc(node: StringTypeDesc) {
        if (node.dataMapperViewState) {
            (node.dataMapperViewState as DataPointViewState).type = 'string';
        }
    }

    beginVisitFloatTypeDesc(node: FloatTypeDesc) {
        if (node.dataMapperViewState) {
            (node.dataMapperViewState as DataPointViewState).type = 'float';
        }
    }

    beginVisitIntTypeDesc(node: IntTypeDesc) {
        if (node.dataMapperViewState) {
            (node.dataMapperViewState as DataPointViewState).type = 'int';
        }
    }

    beginVisitXmlTypeDesc(node: XmlTypeDesc) {
        if (node.dataMapperViewState) {
            (node.dataMapperViewState as DataPointViewState).type = 'xml';
        }
    }

    beginVisitJsonTypeDesc(node: JsonTypeDesc) {
        if (node.dataMapperViewState) {
            (node.dataMapperViewState as DataPointViewState).type = 'json';
        }
    }

    beginVisitArrayTypeDesc(node: ArrayTypeDesc) {
        if (node.dataMapperViewState) {
            const viewState: DataPointViewState = node.dataMapperViewState as DataPointViewState;
            viewState.isArray = true;
            node.memberTypeDesc.dataMapperViewState = node.dataMapperViewState;
        }
    }

    endVisitArrayTypeDesc(node: ArrayTypeDesc, parent?: STNode) {
        if (node.dataMapperViewState) {
            const viewState: DataPointViewState = node.dataMapperViewState as DataPointViewState;
            viewState.collectionDataType = viewState.type;
            viewState.type = 'collection';
        }
    }

    beginVisitRecordField(node: RecordField) {
        if (node.dataMapperViewState) {
            const viewState: DataPointViewState = node.dataMapperViewState;
            viewState.name = node.fieldName.value;
            node.typeName.dataMapperViewState = node.dataMapperViewState;
        }
    }

    beginVisitRecordTypeDesc(node: RecordTypeDesc) {
        if (node.dataMapperViewState) {
            const viewState: DataPointViewState = node.dataMapperViewState as DataPointViewState;
            viewState.type = 'record';
            viewState.fields = [];
            node.fields.forEach(recordFieldNode => {
                recordFieldNode.dataMapperViewState = new DataPointViewState();
            });
        }
    }

    endVisitRecordTypeDesc(node: RecordTypeDesc) {
        if (node.dataMapperViewState) {
            const viewState: DataPointViewState = node.dataMapperViewState as DataPointViewState;
            node.fields.forEach(recordFieldNode => {
                viewState.fields.push(recordFieldNode.dataMapperViewState)
            });
        }
    }


    beginVisitSimpleNameReference(node: SimpleNameReference) {
        if (node.dataMapperViewState) {
            const typeData = node.typeData;
            const typeSymbol = typeData.typeSymbol;
            const moduleID = typeSymbol.moduleID;
            const recordMapKey = `${moduleID.orgName}/${moduleID.moduleName}:${moduleID.version}:${typeSymbol.name}`;
            const viewState = node.dataMapperViewState as DataPointViewState;
            viewState.displayType = node.name.value;

            if (this.recordListMap.has(recordMapKey)) {
                const recordST = this.recordListMap.get(recordMapKey);
                recordST.dataMapperViewState = node.dataMapperViewState;
                traversNode(recordST, this);
            } else {
                node.dataMapperViewState.typeInfo = {
                    modName: moduleID.moduleName,
                    name: typeSymbol.name,
                    orgName: moduleID.orgName,
                    version: moduleID.version
                }
            }
        }
    }

    beginVisitFunctionBodyBlock(node: FunctionBodyBlock) {
    }

    beginVisitReturnStatement(node: ReturnStatement) {
    }

}

