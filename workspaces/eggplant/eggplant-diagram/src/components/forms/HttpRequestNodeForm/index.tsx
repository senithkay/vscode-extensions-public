/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect, useState } from "react";
import { Icon } from "@wso2-enterprise/ui-toolkit";
import { Endpoint, HttpMethod, HttpRequestNodeProperties, Node } from "../../../types";
import { toSnakeCase, toTitleCase } from "../../../utils";
import { Form } from "../styles";
import { DEFAULT_TYPE } from "../../../resources";
import { OptionWidgetProps } from "../../layout/OptionWidget";

// TODO: update this component with multiple form components
export function HttpRequestNodeForm(props: OptionWidgetProps) {
    const { flowModel, selectedNode, children, setSelectedNode, updateFlowModel } = props;

    const [nodeName, setNodeName] = useState<string>();
    const [path, setPath] = useState<string>("");
    const [payloadType, setPayloadType] = useState<string>(DEFAULT_TYPE);
    const [outputType, setOutputType] = useState<string>(DEFAULT_TYPE);
    const [action, setAction] = useState<HttpMethod>("get");
    const [selectedEndpoint, setSelectedEndpoint] = useState<Endpoint>();

    useEffect(() => {
        const node = selectedNode.getNode();
        const nodeProperties = node.properties as HttpRequestNodeProperties;
        setNodeName(node.name);
        setPath(nodeProperties.path);
        setOutputType(nodeProperties.outputType);
        setAction(nodeProperties.action);
        if (selectedNode.getInPorts().length > 0) {
            setPayloadType(selectedNode.getInPorts()[0].getOptions()?.port.type || DEFAULT_TYPE);
        }
        setSelectedEndpoint(nodeProperties.endpoint);
    }, [selectedNode.getID()]);

    const handleOnSave = () => {
        const node = JSON.parse(JSON.stringify(selectedNode.getNode())) as Node;
        const properties: HttpRequestNodeProperties = {
            path,
            action,
            outputType,
            endpoint: selectedEndpoint,
        };
        node.name = toSnakeCase(nodeName);
        node.properties = properties;
        selectedNode.setNode(node);
        updateFlowModel();
        setSelectedNode(null);
    };

    const formTitle = toTitleCase(selectedEndpoint?.name + " " + action?.toUpperCase() + " Request" || "HTTP Request");

    return (
        <Form.Tray>
            <Form.HeaderContainer>
                <Form.Header>{formTitle}</Form.Header>
                <Icon
                    name="close"
                    onClick={() => {
                        setSelectedNode(null);
                    }}
                />
            </Form.HeaderContainer>
            <Form.InputField
                label="Component Name"
                value={nodeName}
                required={true}
                onChange={(value: string) => {
                    setNodeName(value);
                }}
                size={32}
            />
            <>
                
                <Form.InputField
                    label="Path"
                    value={path}
                    onChange={(value: string) => {
                        setPath(value);
                    }}
                    size={32}
                    autoFocus={true}
                />
                {action === "post" && payloadType && (
                    <>
                        <Form.Divider />
                        <Form.SectionTitle>Payload Type</Form.SectionTitle>
                        <Form.Row>
                            <Form.Text>{payloadType}</Form.Text>
                        </Form.Row>
                    </>
                )}

                <Form.Divider />
                <Form.Row>
                    <Form.InputField
                        label="Output Type"
                        value={outputType}
                        required={true}
                        onChange={(value: string) => {
                            setOutputType(value);
                        }}
                        size={32}
                    />
                </Form.Row>
            </>

            <Form.ActionButtonContainer>
                <Form.ActionButton onClick={handleOnSave}>Save</Form.ActionButton>
            </Form.ActionButtonContainer>
            {children}
        </Form.Tray>
    );
}
