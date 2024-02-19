/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect, useRef } from "react";
import { Button, Codicon, TextArea } from "@wso2-enterprise/ui-toolkit";
import { Node } from "../../../types";
import { CodeNodeProperties, getNodeMetadata } from "@wso2-enterprise/eggplant-core";
import { Form } from "../styles";
import { toSnakeCase } from "../../../utils";
import { DEFAULT_TYPE } from "../../../resources";
import { OptionWidgetProps } from "../../layout/OptionWidget";


// TODO: update this component with multiple form components
export function NewPayloadNodeForm(props: OptionWidgetProps) {
    const { selectedNode, children, setSelectedNode, updateFlowModel } = props;

    const node = useRef(JSON.parse(JSON.stringify(selectedNode.getOptions().node)) as Node);
    const nodeProperties = useRef(node.current.properties as CodeNodeProperties);
    const nodeMetadata = useRef(getNodeMetadata(node.current));
    const outPortType = useRef(DEFAULT_TYPE);
    const [payloadSource, setPayloadSource] = React.useState<string>("");

    useEffect(() => {
        node.current = JSON.parse(JSON.stringify(selectedNode.getOptions().node)) as Node;
        nodeProperties.current = node.current.properties as CodeNodeProperties;
        nodeMetadata.current = getNodeMetadata(node.current);
        setPayloadSource(
            nodeProperties.current?.codeBlock.code
                ?.split(`${nodeMetadata.current.outputs[0].type} ${nodeMetadata.current.outputs[0].name} =`)[1]
                ?.split(";")[0]
        );
        if (selectedNode.getOutPorts().length > 0) {
            outPortType.current = selectedNode.getOutPorts()[0].getOptions()?.port.type || DEFAULT_TYPE;
        }
    }, [selectedNode.getID()]);

    const handleOnSave = () => {
        node.current.metadata = nodeMetadata.current;
        nodeProperties.current.codeBlock.code = `${nodeMetadata.current.outputs[0].type} ${nodeMetadata.current.outputs[0].name} = ${payloadSource};`;
        node.current.properties = nodeProperties.current;
        selectedNode.setNode(node.current);
        updateFlowModel();
        setSelectedNode(null);
    };

    const handleOutputTypeChange = (varName: string, type: string) => {
        // update output port types with same variable name
        selectedNode.getOutPorts().forEach((port) => {
            const nodePort = port.getOptions()?.port;
            if (nodePort && nodePort.name === varName) {
                nodePort.type = type;
            }
        });
        // update node metadata
        nodeMetadata.current.outputs.forEach((output) => {
            if (output.name === varName) {
                output.type = type;
            }
        });
    };

    return (
        <Form.Tray>
            <Form.HeaderContainer>
                <Form.Header>Configuration</Form.Header>
                <Button
                    sx={{marginTop: -3}}
                    onClick={() => { setSelectedNode(null) }}
                    appearance="icon"
                >
                    <Codicon sx={{marginRight: 2}} name="close"/>
                </Button>
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

            {selectedNode.getInPorts().length > 0 && (
                <>
                    <Form.Divider />
                    <Form.SectionTitle>Input</Form.SectionTitle>
                    {selectedNode.getInPorts()?.map((port, index) => {
                        const nodePort = port.getOptions()?.port;
                        if (!nodePort) {
                            return null;
                        }
                        return (
                            <Form.Row key={index}>
                                <Form.InputField
                                    label="Type"
                                    value={nodePort.type}
                                    required={true}
                                    onChange={(value: string) => {
                                        handleOutputTypeChange(nodePort.name, value);
                                    }}
                                    size={32}
                                />
                                <Form.InputField
                                    label="Name"
                                    value={nodePort.name}
                                    required={true}
                                    onChange={(value: string) => {
                                        nodePort.name = value;
                                        nodeMetadata.current.inputs[index].name = value;
                                    }}
                                    size={32}
                                />
                            </Form.Row>
                        );
                    })}
                </>
            )}

            <Form.Divider />
            <TextArea
                label="Payload"
                value={payloadSource}
                rows={16}
                resize="vertical"
                onChange={(value: string) => {
                    if (node) {
                        setPayloadSource(value);
                    }
                }}
            />

            {outPortType.current && (
                <>
                    <Form.Divider />
                    <Form.InputField
                        label="Type"
                        value={outPortType.current}
                        required={true}
                        onChange={(value: string) => {
                            outPortType.current = value;
                            nodeMetadata.current.outputs[0].type = value;
                        }}
                        size={32}
                    />
                </>
            )}

            <Form.ActionButtonContainer>
                <Form.ActionButton onClick={handleOnSave}>Save</Form.ActionButton>
            </Form.ActionButtonContainer>
            {children}
        </Form.Tray>
    );
}
