/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect, useRef, useState } from "react";
import styled from "@emotion/styled";
import { CodeData, FlowNode, NodeProperties, ToolData } from "@wso2-enterprise/ballerina-core";
import { FormField, FormValues } from "@wso2-enterprise/ballerina-side-panel";
import { useRpcContext } from "@wso2-enterprise/ballerina-rpc-client";
import { convertConfig } from "../../../utils/bi";
import { URI, Utils } from "vscode-uri";
import ConfigForm from "./ConfigForm";
import { Dropdown } from "@wso2-enterprise/ui-toolkit";
import { cloneDeep } from "lodash";

const Container = styled.div`
    padding: 16px;
`;

const Row = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
`;

interface ToolConfigProps {
    agentCallNode: FlowNode;
    toolData: ToolData;
    onSave?: () => void;
}

export function ToolConfig(props: ToolConfigProps): JSX.Element {
    const { agentCallNode, toolData, onSave } = props;
    const { rpcClient } = useRpcContext();

    console.log(">>> ToolConfig props", props);

    const handleOnSave = async (data: FormField[], rawData: FormValues) => {
        console.log(">>> save value", { data, rawData });
        // TODO: implement the save logic
        onSave?.();
    };

    const formFields: FormField[] = [
        {
            advanced: false,
            codedata: { lineRange: { fileName: "agents.bal", startLine: {}, endLine: {} } },
            diagnostics: [],
            documentation: "Name of the Tool",
            editable: false,
            enabled: true,
            items: undefined,
            key: "variable",
            label: "Name",
            optional: false,
            placeholder: undefined,
            type: "IDENTIFIER",
            value: toolData.name,
            valueTypeConstraint: "string",
        },
        {
            key: "toolDescription",
            label: "Description",
            type: "TEXTAREA",
            optional: true,
            editable: true,
            documentation: "The description of the tool",
            value: toolData.description,
            valueTypeConstraint: "string",
            enabled: true,
        },
    ];

    return (
        <Container>
            <ConfigForm formFields={formFields} onSubmit={handleOnSave} />
        </Container>
    );
}
