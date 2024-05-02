/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { DMType, TypeKind } from "@wso2-enterprise/mi-core";
import md5 from "blueimp-md5";
import { CallExpression, Identifier, Node, PropertyAccessExpression } from "ts-morph";

import { IDataMapperContext } from "../../../../utils/DataMapperContext/DataMapperContext";
import { DataMapperLinkModel } from "../../Link";
import { InputOutputPortModel, IntermediatePortModel } from "../../Port";
import { OFFSETS } from "../../utils/constants";
import { getFieldNames } from "../../utils/common-utils";
import { DataMapperNodeModel } from "../commons/DataMapperNode";
import { ArrayOutputNode } from "../ArrayOutput";
import { ObjectOutputNode } from "../ObjectOutput";
import { InputNode } from "../Input";
import { getDMType } from "../../utils/type-utils";
import { getPosition, isPositionsEquals } from "../../utils/st-utils";

export const ARRAY_FUNCTION_CONNECTOR_NODE_TYPE = "array-function-connector-node";
const NODE_ID = "array-function-connector-node";

export class ArrayFnConnectorNode extends DataMapperNodeModel {

    public sourceType: DMType;
    public sourcePort: InputOutputPortModel;
    public targetPort: InputOutputPortModel;

    public inPort: IntermediatePortModel;
    public outPort: IntermediatePortModel;

    public targetFieldFQN: string;
    public hidden: boolean;

    constructor(
        public context: IDataMapperContext,
        public value: CallExpression,
        public parentNode: Node) {
        super(
            NODE_ID,
            context,
            ARRAY_FUNCTION_CONNECTOR_NODE_TYPE
        );
    }

    initPorts(): void {
        this.sourcePort = undefined;
        this.targetPort = undefined;
        this.sourceType = undefined;

        this.getSourceType();
        this.getTargetType();

        this.inPort = new IntermediatePortModel(
            md5(JSON.stringify(this.value.getPos()) + "IN")
            , "IN"
        );
        this.addPort(this.inPort);
        this.outPort = new IntermediatePortModel(
            md5(JSON.stringify(this.value.getPos()) + "OUT")
            , "OUT"
        );

        this.addPort(this.outPort);
    }

    private getSourceType(): void {
        let sourceExpr: PropertyAccessExpression | Identifier;
        const exprWithMethod = this.value.getExpression();

        if (Node.isPropertyAccessExpression(exprWithMethod)) {
            const innerExpr = exprWithMethod.getExpression();
            if (Node.isPropertyAccessExpression(innerExpr)) {
                sourceExpr = innerExpr;
            }
        }

        const type = getDMType(sourceExpr.getText(), this.context.inputTrees[0]);

        if (type && type?.memberType && type.typeName === TypeKind.Array) {
            this.sourceType = type.memberType;
        }

        let fieldId: string;
        let paramName: string;

        if (Node.isPropertyAccessExpression(sourceExpr)) {
            const fieldNames = getFieldNames(sourceExpr);
            fieldId = fieldNames.reduce((pV, cV) => pV ? `${pV}.${cV.name}` : cV.name, "");
            paramName = fieldNames[0].name;
        } else if (Node.isIdentifier(sourceExpr)) {
            fieldId = sourceExpr.getText();
            paramName = fieldId;
        }

        this.getModel().getNodes().map(node => {
            if (node instanceof InputNode && node?.value && node.value.getName() === paramName) {
                this.sourcePort = node.getPort(fieldId + ".OUT") as InputOutputPortModel;
            }

            while (this.sourcePort && this.sourcePort.hidden){
                this.sourcePort = this.sourcePort.parentModel;
            }
        });
    }

    private getTargetType(): void {
        const innerMostExpr = this.parentNode;
        const fieldName = Node.isPropertyAssignment(innerMostExpr) && innerMostExpr.getNameNode();
        const fieldNamePosition = getPosition(fieldName);

        if (fieldNamePosition) {
            this.getModel().getNodes().map((node) => {

                if (node instanceof ObjectOutputNode || node instanceof ArrayOutputNode) {
                    const ports = Object.entries(node.getPorts());

                    ports.map((entry) => {
                        const port = entry[1];

                        if (port instanceof InputOutputPortModel
                            && port?.typeWithValue && port.typeWithValue?.value
                            && Node.isPropertyAssignment(port.typeWithValue.value)
                            && isPositionsEquals(getPosition(port.typeWithValue.value.getNameNode()), fieldNamePosition)
                        ) {
                            this.targetPort = port;
                        }
                    });
                }
            });
        }

        if (this.targetPort?.hidden){
            this.hidden = true;
        }
        while (this.targetPort && this.targetPort.hidden){
            this.targetPort = this.targetPort.parentModel;
        }
    }

    initLinks(): void {
        if (!this.hidden) {
            // Currently, we create links from "IN" ports and back tracing the inputs.
            if (this.sourcePort && this.inPort) {
                const link = new DataMapperLinkModel(undefined, undefined, true);
                link.setSourcePort(this.sourcePort);
                link.setTargetPort(this.inPort);
                this.sourcePort.addLinkedPort(this.inPort);
                this.sourcePort.addLinkedPort(this.targetPort);
                link.registerListener({
                    selectionChanged: (event) => {
                        if (event.isSelected) {
                            this.sourcePort.fireEvent({}, "link-selected");
                            this.inPort.fireEvent({}, "link-selected");
                        } else {

                            this.sourcePort.fireEvent({}, "link-unselected");
                            this.inPort.fireEvent({}, "link-unselected");
                        }
                    },
                })
                this.getModel().addAll(link);
            }

            // TODO - temp hack to render link
            if (this.outPort && this.targetPort) {
                const link = new DataMapperLinkModel(undefined, undefined, true);
                link.setSourcePort(this.outPort);
                link.setTargetPort(this.targetPort);
                link.registerListener({
                    selectionChanged: (event) => {
                        if (event.isSelected) {
                            this.targetPort.fireEvent({}, "link-selected");
                            this.outPort.fireEvent({}, "link-selected");
                        } else {
                            this.targetPort.fireEvent({}, "link-unselected");
                            this.outPort.fireEvent({}, "link-unselected");
                        }
                    },
                })
                this.getModel().addAll(link);
                this.targetFieldFQN = this.targetPort.fieldFQN;
            }
        } else {
            if (this.sourcePort && this.targetPort) {
                const link = new DataMapperLinkModel(undefined, undefined, true);
                link.setSourcePort(this.sourcePort);
                link.setTargetPort(this.targetPort);
                this.sourcePort.addLinkedPort(this.targetPort);
                link.registerListener({
                    selectionChanged: (event) => {
                        if (event.isSelected) {
                            this.sourcePort.fireEvent({}, "link-selected");
                            this.targetPort.fireEvent({}, "link-selected");
                        } else {

                            this.sourcePort.fireEvent({}, "link-unselected");
                            this.targetPort.fireEvent({}, "link-unselected");
                        }
                    },
                })
                this.getModel().addAll(link);
            }
        }
    }

    public updatePosition() {
        if (this.targetPort){
            const position = this.targetPort.getPosition()
            this.setPosition(OFFSETS.ARRAY_FN_CONNECTOR_NODE.X, position.y - 2)
        }
    }

    public deleteLink(): void {
        // TODO: Implement delete link
    }
}
