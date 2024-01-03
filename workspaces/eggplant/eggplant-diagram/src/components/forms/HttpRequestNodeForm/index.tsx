/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect, useRef, useState } from "react";
import { DiagramEngine } from "@projectstorm/react-diagrams-core";
import { Icon } from "@wso2-enterprise/ui-toolkit";
import { DefaultNodeModel } from "../../default";
import { Flow, HttpMethod, HttpRequestNodeProperties, Node } from "../../../types";
import { toSnakeCase } from "../../../utils";
import { Form } from "../styles";

export interface OptionWidgetProps {
    engine: DiagramEngine;
    flowModel: Flow;
    selectedNode: DefaultNodeModel;
    children?: React.ReactNode;
    setSelectedNode?: (node: DefaultNodeModel) => void;
    updateFlowModel?: () => void;
}

// TODO: update this component with multiple form components
export function HttpRequestNodeForm(props: OptionWidgetProps) {
    const { engine, flowModel, selectedNode, children, setSelectedNode, updateFlowModel } = props;

    const [selectedEndpoint, setSelectedEndpoint] = useState(flowModel.endpoints[0]);
    const node = useRef(JSON.parse(JSON.stringify(selectedNode.getOptions().node)) as Node)
    const nodeProperties = useRef(node.current.properties as HttpRequestNodeProperties)

    useEffect(() => {
        node.current = JSON.parse(JSON.stringify(selectedNode.getOptions().node)) as Node;
        nodeProperties.current = node.current.properties as HttpRequestNodeProperties;
    }, [selectedNode]);

    const handleOnSave = () => {
        nodeProperties.current.endpoint = selectedEndpoint;
        node.current.properties = nodeProperties.current;
        console.log(">>> save http request node form", node.current);
        selectedNode.setNode(node.current);
        updateFlowModel();
        setSelectedNode(null);
    };

    return (
        <Form.Tray>
            <Form.HeaderContainer>
                <Form.Header>Configuration HTTP</Form.Header>
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
                                        nodePort.type = value;
                                    }}
                                    size={32}
                                />
                                <Form.InputField
                                    label="Name"
                                    value={nodePort.name}
                                    required={true}
                                    onChange={(value: string) => {
                                        nodePort.name = value;
                                    }}
                                    size={32}
                                />
                            </Form.Row>
                        );
                    })}
                </>
            )}
            <>
                <Form.Divider />
                <Form.SectionTitle>Connection</Form.SectionTitle>
                {flowModel.endpoints.length > 0 && (
                    <Form.Select
                        id="endpoint"
                        value={selectedEndpoint.name}
                        items={flowModel.endpoints.map((ep) => {
                            return { value: ep.name };
                        })}
                        onChange={(value: string) => {
                            setSelectedEndpoint(flowModel.endpoints.find((ep) => ep.name === value));
                        }}
                    />
                )}
                {/* <Form.InputField
                        label="Base URL"
                        value={(node.properties as HttpRequestNodeProperties).endpoint.baseUrl || ""}
                        required={true}
                        onChange={(value: string) => {
                            (node.properties as HttpRequestNodeProperties).endpoint.baseUrl = value;
                        }}
                        size={32}
                    /> */}
                <Form.SectionTitle>Method</Form.SectionTitle>
                <Form.Select
                    id="method"
                    value={nodeProperties.current?.action || "get"}
                    items={[{ value: "get" }, { value: "post" }, { value: "put" }, { value: "delete" }]}
                    onChange={(value: string) => {
                        nodeProperties.current.action = value as HttpMethod;
                    }}
                />
                <Form.InputField
                    label="Path"
                    value={nodeProperties.current?.path || ""}
                    onChange={(value: string) => {
                        nodeProperties.current.path = value;
                    }}
                    size={32}
                />
            </>
            <>
                <Form.Divider />
                {selectedNode.getOutPorts().length > 0 && <Form.SectionTitle>Output</Form.SectionTitle>}
                {selectedNode.getOutPorts()?.map((port, index) => {
                    const nodePort = port.getOptions()?.port;
                    if (!nodePort) {
                        return null;
                    }
                    if (selectedNode.getKind() === "SwitchNode" && nodePort.name !== "out_default") {
                        return null;
                    }
                    return (
                        <Form.Row key={index}>
                            <Form.InputField
                                label="Type"
                                value={nodeProperties.current.outputType}
                                required={true}
                                onChange={(value: string) => {
                                    nodeProperties.current.outputType = value;
                                }}
                                size={32}
                            />
                        </Form.Row>
                    );
                })}
            </>

            <Form.ActionButtonContainer>
                <Form.ActionButton onClick={handleOnSave}>Save</Form.ActionButton>
            </Form.ActionButtonContainer>
            {children}
        </Form.Tray>
    );
}
