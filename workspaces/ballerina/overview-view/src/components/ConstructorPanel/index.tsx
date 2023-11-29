import React from "react";

import styled from "@emotion/styled";
import { ActionButtons, Button, Codicon, SidePanel, Typography, Divider } from "@wso2-enterprise/ui-toolkit";

interface ConstructorPanelProps {
    isPanelOpen: boolean;
    setPanelOpen: (value: React.SetStateAction<boolean>) => void
}

export function ConstructorPanel(props: ConstructorPanelProps) {

    const closePanel = () => {
        props.setPanelOpen(false);
    };

    const SidePanelTitleContainer = styled.div`
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        padding: 16px;
        border-bottom: 1px solid var(--vscode-panel-border);
        font: inherit;
        font-weight: bold;
        color: var(--vscode-editor-foreground);
    `;

    const SidePanelBody = styled.div`
        padding: 16px;
    `;

    return (
        <SidePanel
            isOpen={props.isPanelOpen}
            alignmanet="right"
            sx={{ transition: "all 0.3s ease-in-out" }}
        >
            <SidePanelTitleContainer>
                <Typography variant="h3">Add Constructs </Typography>
                <Button onClick={closePanel} appearance="icon"><Codicon name="close" /></Button>
            </SidePanelTitleContainer>
            <SidePanelBody>
                <Typography variant="h4"> Entry points </Typography>
                <Divider />
                <ActionButtons
                    primaryButton={{ text: "Save", onClick: () => console.log("Save Button Clicked"), tooltip: "Save Button" }}
                    secondaryButton={{ text: "Cancel", onClick: closePanel, tooltip: "Cancel Button" }}
                    sx={{ justifyContent: "flex-end" }}
                />
            </SidePanelBody>
        </SidePanel>

    )
}
