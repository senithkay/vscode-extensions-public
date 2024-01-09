import styled from "@emotion/styled";
import { ActionButtons, Button, Codicon, SidePanel, colors } from "@wso2-enterprise/ui-toolkit";
import React, { useState } from "react";

export const SidePanelTitleContainer = styled.div`
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

export const SidePanelBody = styled.div`
    padding: 16px;
`;

export const SidePanelWithContent = () => {
    return (
        <>
            <SidePanel
                isOpen={true}
                alignmanet="right"
                sx={{transition: "all 0.3s ease-in-out", width: 600}}
            >
                <SidePanelTitleContainer>
                    <div>Side Panel Title</div>
                    <Button onClick={undefined} appearance="icon"><Codicon name="close"/></Button>
                </SidePanelTitleContainer>
                <SidePanelBody>
                    <ActionButtons
                        primaryButton={{ text : "Save", onClick: () => console.log("Save Button Clicked"), tooltip: "Save Button" }}
                        secondaryButton={{ text : "Cancel", onClick: undefined, tooltip: "Cancel Button" }}
                        sx={{justifyContent: "flex-end"}}
                    />
                </SidePanelBody>
            </SidePanel>
        </>
    );
};
