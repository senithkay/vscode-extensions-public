/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { DMType } from "@wso2-enterprise/mi-core";
import md5 from "blueimp-md5";
import { CallExpression, ElementAccessExpression, Identifier, Node, PropertyAccessExpression } from "ts-morph";

import { IDataMapperContext } from "../../../../utils/DataMapperContext/DataMapperContext";
import { DataMapperLinkModel } from "../../Link";
import { InputOutputPortModel, IntermediatePortModel } from "../../Port";
import { ARRAY_OUTPUT_TARGET_PORT_PREFIX, FOCUSED_INPUT_SOURCE_PORT_PREFIX, OFFSETS } from "../../utils/constants";
import {
    getDefaultValue,
    getFieldNames,
    isMapFunction,
    getTnfFnReturnStatement,
    representsTnfFnReturnStmt,
    isInputAccessExpr
} from "../../utils/common-utils";
import { DataMapperNodeModel } from "../commons/DataMapperNode";
import { ArrayOutputNode } from "../ArrayOutput";
import { ObjectOutputNode } from "../ObjectOutput";
import { InputNode } from "../Input";
import { getPosition, isPositionsEquals, traversNode } from "../../utils/st-utils";
import { FocusedInputNode } from "../FocusedInput";
import { LinkDeletingVisitor } from "../../../../components/Visitors/LinkDeletingVistior";

export const ARRAY_FUNCTION_CONNECTOR_NODE_TYPE = "array-function-connector-node";
const NODE_ID = "array-function-connector-node";

export class ArrayFnConnectorNode extends DataMapperNodeModel {

    public sourceType: DMType;
    public targetType: DMType;
    public sourcePort: InputOutputPortModel;
    public targetPort: InputOutputPortModel;

    public inPort: IntermediatePortModel;
    public outPort: IntermediatePortModel;

    public targetFieldFQN: string;
    public hidden: boolean;
    public hasInitialized: boolean;

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

        this.findSourcePort();
        this.findTargetPort();

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

    private findSourcePort(): void {
        let fieldId: string;
        let paramName: string;
        let sourceExpr: ElementAccessExpression | PropertyAccessExpression | Identifier;
        const exprWithMethod = this.value.getExpression();

        if (isInputAccessExpr(exprWithMethod)) {
            const innerExpr = (exprWithMethod as ElementAccessExpression).getExpression();
            if (isInputAccessExpr(innerExpr) || Node.isIdentifier(innerExpr)) {
                sourceExpr = innerExpr as ElementAccessExpression | PropertyAccessExpression | Identifier;
            }
        }

        if (isInputAccessExpr(sourceExpr)) {
            const fieldNames = getFieldNames(sourceExpr as ElementAccessExpression | PropertyAccessExpression);
            fieldId = fieldNames.reduce((pV, cV) => pV ? `${pV}.${cV.name}` : cV.name, "");
            paramName = fieldNames[0].name;
        } else if (Node.isIdentifier(sourceExpr)) {
            fieldId = sourceExpr.getText();
            paramName = fieldId;
        }

        this.getModel().getNodes().map(node => {
            if (node instanceof InputNode && node?.value && node.value.getName() === paramName) {
                this.sourcePort = node.getPort(fieldId + ".OUT") as InputOutputPortModel;
            } else if (node instanceof FocusedInputNode && node.innerParam.getName() === paramName) {
                const portName = FOCUSED_INPUT_SOURCE_PORT_PREFIX + "." + fieldId + ".OUT";
                this.sourcePort = node.getPort(portName) as InputOutputPortModel;
            }

            while (this.sourcePort && this.sourcePort.hidden){
                this.sourcePort = this.sourcePort.parentModel;
            }
        });
    }

    private findTargetPort(): void {
        const innerMostExpr = this.parentNode;
        const fieldName = Node.isPropertyAssignment(innerMostExpr) && innerMostExpr.getNameNode();
        const fieldNamePosition = fieldName && getPosition(fieldName);
        const returnStmt = getTnfFnReturnStatement(this.context.functionST);
        const isRerurnStmtMapFn = Node.isReturnStatement(this.parentNode);

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
        } else if (representsTnfFnReturnStmt(this.parentNode, returnStmt) || isRerurnStmtMapFn) {
            this.getModel().getNodes().forEach((node) => {
                if (node instanceof ArrayOutputNode) {
                    console.log(node.getPorts());
                    const ports = Object.entries(node.getPorts());
                    ports.map((entry) => {
                        const port = entry[1];
                        if (port instanceof InputOutputPortModel
                            && port?.typeWithValue && port.typeWithValue?.value
                            && Node.isCallExpression(port.typeWithValue.value)
                            && isMapFunction(port.typeWithValue.value)
                            && isPositionsEquals(getPosition(port.typeWithValue.value), getPosition(this.value))
                            && port.portName === `${ARRAY_OUTPUT_TARGET_PORT_PREFIX}${node.rootName ? `.${node.rootName}` : ''}`
                            && port.portType === 'IN'
                        ) {
                            this.targetPort = port;
                        }
                    });
                }
            });
        }

        const previouslyHidden = this.hidden;
        this.hidden = this.targetPort?.hidden;
    
        if (this.hidden !== previouslyHidden) {
            this.hasInitialized = false;
        }
        while (this.targetPort && this.targetPort.hidden){
            this.targetPort = this.targetPort.parentModel;
        }
    }

    initLinks(): void {
        if (this.hasInitialized) {
            return;
        }
        if (!this.hidden) {
            // Create links from "IN" ports and back tracing the inputs
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
        this.hasInitialized = true;
    }

    public updatePosition() {
        if (this.targetPort){
            const position = this.targetPort.getPosition()
            this.setPosition(OFFSETS.ARRAY_FN_CONNECTOR_NODE.X, position.y - 2)
        }
    }

    public async deleteLink(): Promise<void> {
        const dmNode = this.getModel().getNodes().find(node =>
            node instanceof ObjectOutputNode || node instanceof ArrayOutputNode
        ) as ObjectOutputNode | ArrayOutputNode;

        if (dmNode) {
            if (Node.isPropertyAssignment(this.parentNode)) {
                const rootConstruct = dmNode.value.getExpression();
                const linkDeleteVisitor = new LinkDeletingVisitor(this.parentNode, rootConstruct);
                traversNode(this.context.focusedST, linkDeleteVisitor);
                const targetNodes = linkDeleteVisitor.getNodesToDelete();

                targetNodes.forEach(node => {
                    const parentNode = node.getParent();
    
                    if (Node.isPropertyAssignment(node)) {
                        node.remove();
                    } else if (parentNode && Node.isArrayLiteralExpression(parentNode)) {
                        const elementIndex = parentNode.getElements().find(e => e === node);
                        parentNode.removeElement(elementIndex);
                    } else {
                        node.replaceWithText('');
                    }
                });
            } else {
                this.value.replaceWithText(getDefaultValue(dmNode.dmType.kind));
            }
        }

        await this.context.applyModifications();
    }
}
