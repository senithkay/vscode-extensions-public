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

import { ArrayTypeDesc, DefaultableParam, ExplicitAnonymousFunctionExpression, FloatTypeDesc, IntTypeDesc, JsonTypeDesc, RecordField, RecordTypeDesc, RequiredParam, SimpleNameReference, STNode, StringTypeDesc, traversNode, Visitor, XmlTypeDesc } from '@ballerina/syntax-tree';

import { DataMapperViewState, DataPointViewstate } from '../viewstate';


export class DataMapperInitVisitor implements Visitor {
    private recordListMap: Map<string, STNode>;

    constructor(recordListMap: Map<string, STNode>) {
        this.recordListMap = recordListMap;
    }

    beginVisitSTNode(node: STNode) {
        if (!node.dataMapperViewstate) {
            node.dataMapperViewstate = new DataMapperViewState();
        }
    }

    beginVisitRequiredParam(node: RequiredParam) {
        if (!node.dataMapperViewstate) {
            const viewState = new DataPointViewstate();
            viewState.name = node.paramName.value;
            node.typeName.dataMapperViewstate = viewState;
        }
    }

    endVisitRequiredParam(node: RequiredParam) {
        if (!node.dataMapperViewstate && node.typeName.viewState) {
            node.dataMapperViewstate = node.typeName.dataMapperViewstate;
        }
    }

    beginVisitStringTypeDesc(node: StringTypeDesc) {
        if (node.dataMapperViewstate) {
            (node.dataMapperViewstate as DataPointViewstate).type = 'string';
        }
    }

    beginVisitFloatTypeDesc(node: FloatTypeDesc) {
        if (node.dataMapperViewstate) {
            (node.dataMapperViewstate as DataPointViewstate).type = 'float';
        }
    }

    beginVisitIntTypeDesc(node: IntTypeDesc) {
        if (node.dataMapperViewstate) {
            (node.dataMapperViewstate as DataPointViewstate).type = 'int';
        }
    }

    beginVisitXmlTypeDesc(node: XmlTypeDesc) {
        if (node.dataMapperViewstate) {
            (node.dataMapperViewstate as DataPointViewstate).type = 'xml';
        }
    }

    beginVisitJsonTypeDesc(node: JsonTypeDesc) {
        if (node.dataMapperViewstate) {
            (node.dataMapperViewstate as DataPointViewstate).type = 'json';
        }
    }

    beginVisitArrayTypeDesc(node: ArrayTypeDesc) {
        if (node.dataMapperViewstate) {
            const viewState: DataPointViewstate = node.dataMapperViewstate as DataPointViewstate;
            viewState.isArray = true;
            node.memberTypeDesc.dataMapperViewstate = node.dataMapperViewstate;
        }
    }

    beginVisitRecordField(node: RecordField) {
        if (node.dataMapperViewstate) {
            const viewState: DataPointViewstate = node.dataMapperViewstate;
            viewState.name = node.fieldName.value;
            node.typeName.dataMapperViewstate = node.dataMapperViewstate;
        }
    }

    beginVisitRecordTypeDesc(node: RecordTypeDesc) {
        if (node.dataMapperViewstate) {
            const viewState: DataPointViewstate = node.dataMapperViewstate as DataPointViewstate;
            viewState.isRecord = true;
            viewState.fields = [];
            node.fields.forEach(recordFieldNode => {
                recordFieldNode.dataMapperViewstate = new DataPointViewstate();
            });
        }
    }

    endVisitRecordTypeDesc(node: RecordTypeDesc) {
        if (node.dataMapperViewstate) {
            const viewState: DataPointViewstate = node.dataMapperViewstate as DataPointViewstate;
            node.fields.forEach(recordFieldNode => {
                viewState.fields.push(recordFieldNode.dataMapperViewstate)
            })
        }
    }


    beginVisitSimpleNameReference(node: SimpleNameReference) {
        if (node.dataMapperViewstate) {
            const typeData = node.typeData;
            const typeSymbol = typeData.typeSymbol;
            const moduleID = typeSymbol.moduleID;
            const recordMapKey = `${moduleID.orgName}/${moduleID.moduleName}:${moduleID.version}:${typeSymbol.name}`;

            if (this.recordListMap.has(recordMapKey)) {
                const recordST = this.recordListMap.get(recordMapKey);
                recordST.dataMapperViewstate = node.dataMapperViewstate;
                traversNode(recordST, this);
            } else {
                // todo: fetching the record st
            }
        }
    }

}

