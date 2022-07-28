/*
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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
// tslint:disable: jsx-no-multiline-js
import {
    FromClause,
    MappingConstructor,
    SelectClause,
    STKindChecker,
    TypeDefinition
} from "@wso2-enterprise/syntax-tree";

import { IDataMapperContext } from "../../../../utils/DataMapperContext/DataMapperContext";
import { ExpressionLabelModel } from "../../Label";
import { DataMapperLinkModel } from "../../Link";
import { DataMapperPortModel } from "../../Port";
import { getFieldNames, isPositionsEquals } from "../../utils";
import { DataMapperNodeModel } from "../commons/DataMapperNode";
import { EXPANDED_QUERY_SOURCE_PORT_PREFIX, QueryExprSourceNode } from "../QueryExprSourceNode";

export const SELECT_CLAUSE_NODE_TYPE = "datamapper-node-select-clause";
export const EXPANDED_QUERY_TARGET_PORT_PREFIX = "expandedQueryExpr.target";

export class SelectClauseNode extends DataMapperNodeModel {

    public typeDef: TypeDefinition;

    constructor(
        public context: IDataMapperContext,
        public value: SelectClause) {
        super(
            context,
            SELECT_CLAUSE_NODE_TYPE
        );
    }

    async initPorts() {
        if (STKindChecker.isMappingConstructor(this.value.expression)) {
            this.value.expression.fields.forEach((field) => {
                if (STKindChecker.isSpecificField(field)) {
                    this.addPortsForSpecificField(field, "IN", EXPANDED_QUERY_TARGET_PORT_PREFIX);
                }
            });
        }
    }

    async initLinks() {
        const mappings = this.genMappings(this.value.expression as MappingConstructor);
        const hasMapping = mappings.some((entry) => {
            return !!entry.value;
        });
        if (hasMapping) {
            this.createLinks();
        }
    }

    private createLinks() {
        if (STKindChecker.isMappingConstructor(this.value.expression)) {
            const mappings = this.genMappings(this.value.expression);
            mappings.forEach((mapping) => {
                const { fields, value, otherVal } = mapping;
                const targetPortId = `${EXPANDED_QUERY_TARGET_PORT_PREFIX}${fields.reduce((pV, cV) => `${pV}.${cV.fieldName.value}`, "")}.IN`;
                if (value && STKindChecker.isFieldAccess(value)) {
                    const fieldNames = getFieldNames(value);
                    const sourcePortId = `${EXPANDED_QUERY_SOURCE_PORT_PREFIX}${fieldNames.reduce((pV, cV) => `${pV}.${cV}`, "")}.OUT`;
                    const targetPort = this.getPort(targetPortId);
                    const sourceNode = this.getInputNodeExpr();
                    let sourcePort: DataMapperPortModel;
                    if (sourceNode) {
                        sourcePort = sourceNode.getPort(sourcePortId) as DataMapperPortModel;
                    }
                    const link = new DataMapperLinkModel(value);
                    link.setSourcePort(sourcePort);
                    link.setTargetPort(targetPort);
                    link.addLabel(new ExpressionLabelModel({
                        value: otherVal?.source || value.source,
                        valueNode: otherVal || value,
                        context: this.context,
                        link
                    }));
                    link.registerListener({
                        selectionChanged(event) {
                            if (event.isSelected) {
                                sourcePort.fireEvent({}, "link-selected");
                                targetPort.fireEvent({}, "link-selected");
                            } else {
                                sourcePort.fireEvent({}, "link-unselected");
                                targetPort.fireEvent({}, "link-unselected");
                            }
                        },
                    })
                    this.getModel().addAll(link);
                } else {
                    // handle simple name ref case for direct variable mapping
                }
            });
        }
    }

    private getInputNodeExpr() {
        let fromClause;
        if (STKindChecker.isQueryExpression(this.context.selection.selectedST)) {
            fromClause = this.context.selection.selectedST.queryPipeline.fromClause;
        }
        return this.findNodeByValueNode(fromClause);
    }

    private findNodeByValueNode(value: FromClause): QueryExprSourceNode {
        let foundNode: QueryExprSourceNode;
        this.getModel().getNodes().find((node) => {
            if (node instanceof QueryExprSourceNode
                && isPositionsEquals(value.position, node.value.position)) {
                foundNode = node;
            }
        });
        return foundNode;
    }
}
