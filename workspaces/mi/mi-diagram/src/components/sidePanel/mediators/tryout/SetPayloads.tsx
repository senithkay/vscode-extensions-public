/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 * 
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
*/

import { AutoComplete, Button, ProgressRing } from "@wso2-enterprise/ui-toolkit";

import { Typography } from "@wso2-enterprise/ui-toolkit";
import SidePanelContext, { clearSidePanelState } from "../../SidePanelContexProvider";
import React, { useEffect } from "react";
import { CodeTextArea } from "../../../Form";
import styled from "@emotion/styled";
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";

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
}
export function SetPayloads(props: SetPayloadsProps) {
    const { rpcClient } = useVisualizerContext();
    const sidePanelContext = React.useContext(SidePanelContext);
    const { documentUri } = props;
    const [isLoading, setIsLoading] = React.useState(true);
    const [payloads, setPayloads] = React.useState<any[]>([]);
    const [activePayload, setActivePayload] = React.useState<any>();

    useEffect(() => {
        rpcClient.getMiDiagramRpcClient().getInputPayloads({ documentUri }).then((res) => {
            if (Array.isArray(res.payloads)) {
                setPayloads(res.payloads.map((payload) => ({ name: payload.name, content: JSON.stringify(payload.content) })));
            } else {
                setPayloads([{ name: 'Default', content: JSON.stringify(res.payloads) }]);
            }
            setActivePayload(res.payloads?.[0].name);
            setIsLoading(false);
        });
    }, []);

    const onSavePayload = async () => {
        const content = payloads.map((payload) => {
            return {
                name: payload.name,
                content: JSON.parse(payload.content)
            };
        });
        await rpcClient.getMiDiagramRpcClient().saveInputPayload({ payload: JSON.stringify(content) });
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

    return (
        <TryoutContainer>
            <Typography
                sx={{ padding: "10px", marginBottom: "10px", borderBottom: "1px solid var(--vscode-editorWidget-border)" }}
                variant="body3">
                {`Save the payload to try out the mediators`}
            </Typography>

            <AutoComplete
                label="Name"
                items={payloads.map((payload) => payload.name)}
                value={activePayload}
                allowItemCreate={true}
                onValueChange={(value) => {
                    if (!payloads.find((payload) => payload.name === value)) {
                        setPayloads([...payloads, { name: value, content: "" }]);
                    }
                    setActivePayload(value);
                }}
            />

            {activePayload && <CodeTextArea
                name="Request body"
                label="Request body"
                rows={30}
                value={payloads.find((payload) => payload.name === activePayload)?.content || ""}
                onChange={(e) => {
                    const newPayloads = payloads.map((payload) => {
                        if (payload.name === activePayload) {
                            return {
                                name: payload.name,
                                content: e.target.value
                            };
                        }
                        return payload;
                    });
                    setPayloads(newPayloads);
                }}
            />}
            <div style={{ display: 'flex', justifyContent: 'end', marginTop: '10px' }}>
                <Button onClick={closeSidePanel} appearance="secondary">
                    Cancel
                </Button>
                <Button onClick={onSavePayload} sx={{ marginRight: "10px" }}>
                    Save
                </Button>
            </div>
        </TryoutContainer>);
};
