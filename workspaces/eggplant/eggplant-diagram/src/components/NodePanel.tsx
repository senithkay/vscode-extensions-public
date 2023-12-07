import React from "react";
import styled from "@emotion/styled";


export const Tray: React.FC<any> = styled.div`
		min-width: 312px;
        color: var(--vscode-editor-foreground);
	    box-shadow: 0 5px 10px 0 var(--vscode-badge-background);
		flex-grow: 0;
		flex-shrink: 0;
	`;


interface NodePanelProps {
    children: React.ReactNode;
}

export class NodePanel extends React.Component<NodePanelProps> {
    render() {
        return (
            <Tray>
                {this.props.children}
            </Tray>
        );
    }
}