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
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        padding: 16px;
        gap: 8px;
    `;

    const ButtonWrapper = styled.div`
        padding: 2px 16px;
        border: 1px solid var(--vscode-panel-border);
        cursor: pointer;
        border-radius: 5px;
        width: 100%;
        &:hover {
            background-color: var(--vscode-editor-hoverHighlightBackground);
            border-color: var(--vscode-editor-hoverHighlightBorder);
        }
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
                <ButtonWrapper>
                    <Typography variant="h4"> Main </Typography>
                </ButtonWrapper>
                <ButtonWrapper>
                    <Typography variant="h4"> Service </Typography>
                </ButtonWrapper>
                <ButtonWrapper>
                    <Typography variant="h4"> Trigger </Typography>
                </ButtonWrapper>
                {/* <Divider />
                <ActionButtons
                    primaryButton={{ text: "Save", onClick: () => console.log("Save Button Clicked"), tooltip: "Save Button" }}
                    secondaryButton={{ text: "Cancel", onClick: closePanel, tooltip: "Cancel Button" }}
                    sx={{ justifyContent: "flex-end" }}
                /> */}
            </SidePanelBody>
        </SidePanel>

    )
}
