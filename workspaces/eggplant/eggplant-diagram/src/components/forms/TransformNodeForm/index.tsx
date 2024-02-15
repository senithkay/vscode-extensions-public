/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect, useRef } from "react";
import { Button, Codicon } from "@wso2-enterprise/ui-toolkit";
import { Node } from "../../../types";
import { NMD_TypeData, TransformNodeProperties, getNodeMetadata } from "@wso2-enterprise/eggplant-core";
import { Form } from "../styles";
import { toSnakeCase } from "../../../utils";
import { OptionWidgetProps } from "../../layout/OptionWidget";
import { DEFAULT_TYPE } from "../../../resources";

export function TransformNodeForm(props: OptionWidgetProps) {
    const { selectedNode, children, setSelectedNode, updateFlowModel, openDataMapper, flowModel } = props;

    const node = useRef(JSON.parse(JSON.stringify(selectedNode.getOptions().node)) as Node);
    const nodeProperties = useRef(node.current.properties as TransformNodeProperties);
    const nodeMetadata = useRef(getNodeMetadata(node.current));
    const outPortType = nodeMetadata.current?.outputs[0]?.type ? useRef(nodeMetadata.current.outputs[0].type) : useRef(DEFAULT_TYPE);

    useEffect(() => {
        node.current = JSON.parse(JSON.stringify(selectedNode.getOptions().node)) as Node;
        nodeProperties.current = node.current.properties as TransformNodeProperties;
        nodeMetadata.current = getNodeMetadata(node.current);
        if (selectedNode.getOutPorts().length > 0) {
            outPortType.current = selectedNode.getOutPorts()[0].getOptions()?.port.type || DEFAULT_TYPE;
        }
    }, [selectedNode.getID()]);

    const handleOpenDataMapper = () => {
        if (nodeProperties.current.resetFuncBody || nodeProperties.current.updateFuncSignature) {
            node.current.metadata = nodeMetadata.current;
            node.current.properties = nodeProperties.current;
            selectedNode.setNode(node.current);
            updateFlowModel();
            setSelectedNode(selectedNode);
            
        } else {
            setSelectedNode(null);
        }
        const tnfFnLocation = nodeProperties.current.transformFunctionLocation;
            if (!tnfFnLocation) {
                console.error("Transform function location is not defined");
                return;
            }
            openDataMapper({
                startLine: tnfFnLocation.start.line,
                startColumn: tnfFnLocation.start.offset,
                endLine: tnfFnLocation.end.line,
                endColumn: tnfFnLocation.end.offset,
            });
    };

    const handleOnSave = () => {
        node.current.metadata = nodeMetadata.current;
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
        nodeMetadata.current.outputs.forEach((output: NMD_TypeData) => {
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
                    nodeProperties.current.updateFuncSignature = true;
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
                                        nodeProperties.current.resetFuncBody = true;
                                        if (nodeMetadata.current.inputs[index]) {
                                            nodeMetadata.current.inputs[index].type = value;
                                        }
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
                                        console.log("UPDATING NAME");
                                        if (nodeMetadata.current.inputs[index]) {
                                            nodeMetadata.current.inputs[index].name = value;
                                        }
                                        nodeProperties.current.resetFuncBody = true;
                                    }}
                                    size={32}
                                />
                            </Form.Row>
                        );
                    })}
                </>
            )}

            {outPortType.current && (
                <>
                    <Form.Divider />
                    <Form.InputField
                        label="Output Type"
                        value={outPortType.current}
                        required={true}
                        onChange={(value: string) => {
                            outPortType.current = value;
                            if (nodeMetadata.current.outputs[0]) {
                                nodeMetadata.current.outputs[0].type = value;
                            }
                            nodeProperties.current.resetFuncBody = true;
                        }}
                        size={32}
                    />
                </>
            )}

            <Form.Divider />

            <Form.ButtonContainer>
                <Form.ActionButton appearance="secondary" onClick={handleOpenDataMapper}>
                    Use Data Mapper
                </Form.ActionButton>
            </Form.ButtonContainer>

            <Form.ActionButtonContainer>
                <Form.ActionButton onClick={handleOnSave}>Save</Form.ActionButton>
            </Form.ActionButtonContainer>
            {children}
        </Form.Tray>
    );
}
