/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect, useRef, useState } from "react";
import { Button, Icon, TextArea } from "@wso2-enterprise/ui-toolkit";
import { Node } from "../../../types";
import {
    SwitchCaseBlock,
    SwitchNodeProperties,
    getNodeMetadata,
} from "@wso2-enterprise/eggplant-core";
import { Form } from "../styles";
import { getPortId, toSnakeCase } from "../../../utils";
import { DEFAULT_TYPE } from "../../../resources";
import { OptionWidgetProps } from "../../layout/OptionWidget";

export function SwitchNodeForm(props: OptionWidgetProps) {
    const { engine, selectedNode, children, setSelectedNode, updateFlowModel } = props;

    const node = useRef(JSON.parse(JSON.stringify(selectedNode.getOptions().node)) as Node);
    const nodeProperties = useRef(node.current.properties as SwitchNodeProperties);
    const nodeMetadata = useRef(getNodeMetadata(node.current));
    const inPortType = useRef(DEFAULT_TYPE);
    const [, forceUpdate] = useState();

    useEffect(() => {
        node.current = JSON.parse(JSON.stringify(selectedNode.getOptions().node)) as Node;
        nodeProperties.current = node.current.properties as SwitchNodeProperties;
        nodeMetadata.current = getNodeMetadata(node.current);
        if (selectedNode.getInPorts().length > 0) {
            inPortType.current = selectedNode.getInPorts()[0].getOptions()?.port.type || DEFAULT_TYPE;
        }
    }, [selectedNode.getID()]);

    const handleOnSave = () => {
        node.current.metadata = nodeMetadata.current;
        node.current.properties = nodeProperties.current;
        selectedNode.setNode(node.current);
        updateFlowModel();
        setSelectedNode(null);
    };

    const handleAddCase = () => {
        let caseCount = nodeProperties.current.cases.length;
        let portId = getPortId(node.current.name, false, caseCount + 1);
        // while (selectedNode.getOutPorts().find((port) => port.getID() === portId)) {
        //     caseCount++;
        //     portId = getPortId(node.name, false, caseCount + 1);
        // }
        // add new case and port
        nodeProperties.current.cases.push({
            expression: {
                expression: "true",
            },
            nodes: [portId],
        });
        selectedNode.addOutPort(portId, {
            id: portId,
            type: DEFAULT_TYPE,
        });
        selectedNode.setNode(node.current);
        // update the diagram
        engine.repaintCanvas();
        forceUpdate({} as any);
    };

    return (
        <Form.Tray>
            <Form.HeaderContainer>
                <Form.Header>Configuration</Form.Header>
                <Icon
                    name="close"
                    onClick={() => {
                        setSelectedNode(null);
                    }}
                />
            </Form.HeaderContainer>

            <Form.InputField
                label="Component Name"
                value={selectedNode.getName()}
                required={true}
                onChange={(value: string) => {
                    node.current.name = toSnakeCase(value);
                }}
                size={32}
            />

            {inPortType.current && (
                <>
                    <Form.Divider />
                    <Form.SectionTitle>Input Type</Form.SectionTitle>
                    <Form.Row>
                        <Form.Text>{inPortType.current}</Form.Text>
                    </Form.Row>
                </>
            )}

            <Form.Divider />
            <Form.SectionTitle>Conditions</Form.SectionTitle>
            {nodeProperties.current?.cases?.map((caseBlock: SwitchCaseBlock, index: number) => {
                return (
                    <div key={index}>
                        <TextArea
                            label={`Case ${index + 1}`}
                            value={caseBlock.expression.expression || ""}
                            rows={2}
                            resize="vertical"
                            onChange={(value: string) => {
                                if (node) {
                                    nodeProperties.current.cases[index].expression.expression = value;
                                }
                            }}
                        />
                    </div>
                );
            })}
            <Button appearance="secondary" onClick={handleAddCase}>
                Add Case
            </Button>

            {inPortType.current && (
                <>
                    <Form.Divider />
                    <Form.SectionTitle>Output Type</Form.SectionTitle>
                    <Form.Row>
                        <Form.Text>{inPortType.current}</Form.Text>
                    </Form.Row>
                </>
            )}

            <Form.ActionButtonContainer>
                <Form.ActionButton onClick={handleOnSave}>Save</Form.ActionButton>
            </Form.ActionButtonContainer>
            {children}
        </Form.Tray>
    );
}
