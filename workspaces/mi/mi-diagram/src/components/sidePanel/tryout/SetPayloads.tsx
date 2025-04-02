/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 * 
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
*/

import { AutoComplete, Button, FormActions, Icon, ProgressRing } from "@wso2-enterprise/ui-toolkit";

import { Typography } from "@wso2-enterprise/ui-toolkit";
import SidePanelContext, { clearSidePanelState } from "../SidePanelContexProvider";
import React, { useEffect } from "react";
import styled from "@emotion/styled";
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";
import ParameterManager from "../../Form/GigaParamManager/ParameterManager";
import { DiagramService } from "@wso2-enterprise/mi-syntax-tree/lib/src";

const TryoutContainer = styled.div`
    height: 100%;
    width: 100%;
    min-height: 80vh;
`;

interface SetPayloadsProps {
    documentUri?: string;
    nodeRange?: any;
    getValues?: any;
    isActive?: boolean;
    model: DiagramService;
}
export function SetPayloads(props: SetPayloadsProps) {
    const { rpcClient } = useVisualizerContext();
    const sidePanelContext = React.useContext(SidePanelContext);
    const { documentUri, model } = props;
    const [isLoading, setIsLoading] = React.useState(true);
    const [requests, setRequests] = React.useState<any[]>([]);
    const [defaultPayload, setDefaultPayload] = React.useState<string>();
    const [requestsNames, setRequestsNames] = React.useState<string[]>([]);

    useEffect(() => {
        rpcClient.getMiDiagramRpcClient().getInputPayloads({ documentUri, model }).then((res) => {
            const requests = Array.isArray(res.payloads)
                ? res.payloads.map(payload => ({
                    name: payload.name,
                    contentType: payload.contentType,
                    content: payload.contentType == 'application/json' ? JSON.stringify(payload.content, null, 2) : payload.content
                }))
                : [{ name: "Default", content: JSON.stringify(res.payloads) }];
            setRequests(requests);
            setDefaultPayload(res.defaultPayload);
            setRequestsNames(requests.map((request) => request.name));
            setIsLoading(false);
        });
    }, []);

    useEffect(() => {
        const requestsNames = requests.map((request) => request.name);
        setRequestsNames(requestsNames);
        if (defaultPayload && !requestsNames.includes(defaultPayload)) {
            setDefaultPayload(requestsNames[0].name);
        }
        if (!defaultPayload && requestsNames.length > 0) {
            setDefaultPayload(requestsNames[0]);
        }
    }, [requests]);

    const onSavePayload = async () => {
        const content = requests.map((request) => {
            return {
                name: request.name,
                contentType: request.contentType,
                content: request.contentType == 'application/json' ? JSON.parse(request.content) : request.content
            };
        });
        await rpcClient.getMiDiagramRpcClient().saveInputPayload({ payload: content, model: model, defaultPayload: defaultPayload });
        closeSidePanel();
    };

    const closeSidePanel = () => {
        clearSidePanelState(sidePanelContext);
    }

    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', width: '100%', marginTop: '30px' }}>
                <ProgressRing />
            </div>
        );
    }

    const parameterManagerConfig = {
        elements: [
            {
                type: "attribute",
                value: {
                    name: "name",
                    displayName: "Name",
                    inputType: "string",
                    required: true,
                    helpTip: "",
                },
            },
            {
                type: "attribute",
                value: {
                    name: "contentType",
                    displayName: "Content Type",
                    inputType: "combo",
                    required: true,
                    comboValues: ["application/json", "application/xml", "text/plain"],
                    defaultValue: "application/json",
                    helpTip: "",
                },
            },
            {
                type: "attribute",
                value: {
                    name: "content",
                    displayName: "Request body", 
                    inputType: "codeTextArea",
                    required: true,
                    validateType: "json",
                    helpTip: "",
                },
            },
        ],
        tableKey: 'name',
        tableValue: 'content',
        addParamText: 'Add request',
    };

    return (
        <TryoutContainer>
            <Typography
                sx={{ padding: "10px", marginBottom: "10px", borderBottom: "1px solid var(--vscode-editorWidget-border)" }}
                variant="body3">
                {`Save the payload to try out the mediators`}
                <Typography variant="body2" sx={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '10px' }}>
                    <Icon name="info" isCodicon />
                    <Typography variant="body3">Only JSON request types are supported</Typography>
                </Typography>
            </Typography>
            <AutoComplete
                name="defaultPayload"
                label="Default Payload"
                items={requestsNames}
                value={defaultPayload}
                onValueChange={setDefaultPayload}
                required={true}
                allowItemCreate={false}
            />
            <ParameterManager
                formData={parameterManagerConfig}
                parameters={requests}
                setParameters={setRequests}
            />

            <FormActions>
                <Button onClick={closeSidePanel} appearance="secondary">
                    Cancel
                </Button>
                <Button onClick={onSavePayload} sx={{ marginRight: "10px" }}>
                    Save
                </Button>
            </FormActions>
        </TryoutContainer>);
};
