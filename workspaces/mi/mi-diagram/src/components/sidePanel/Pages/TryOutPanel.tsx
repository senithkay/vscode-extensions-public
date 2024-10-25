import React, { useState } from 'react';
import styled from '@emotion/styled';
import { SidePanel, SidePanelProps, Codicon, Button } from '@wso2-enterprise/ui-toolkit';

const CollapsibleSidePanelContainer = styled.div`
    position: relative;
`;

const CollapseButton = styled(Button)`
    position: absolute;
    top: 0;
    left: -30px;
    background: var(--vscode-button-background);
    color: var(--vscode-button-foreground);
    border: none;
    border-radius: 4px 0 0 4px;
    padding: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2001; // Ensure it's above the SidePanel
    
    &:hover {
        background: var(--vscode-button-hoverBackground);
    }
`;

interface CollapsibleSidePanelProps extends SidePanelProps {
    children: React.ReactNode;
}

const CollapsibleSidePanel: React.FC<CollapsibleSidePanelProps> = ({ children, ...props }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const toggleCollapse = () => {
        setIsCollapsed(!isCollapsed);
    };

    return (
        <CollapsibleSidePanelContainer>
                <SidePanel {...props} width={isCollapsed ? 0 : props.width}>
                <CollapseButton onClick={toggleCollapse} appearance="icon">
                <Codicon name={isCollapsed ? "chevron-right" : "chevron-left"} />
            </CollapseButton>
                    {!isCollapsed && children}
                </SidePanel>
        </CollapsibleSidePanelContainer>
    );
};

const TryOutPanel: React.FC<SidePanelProps> = (props) => {
    return (
        <CollapsibleSidePanel {...props}>
            {props.children}
        </CollapsibleSidePanel>
    );
};

export default TryOutPanel;
