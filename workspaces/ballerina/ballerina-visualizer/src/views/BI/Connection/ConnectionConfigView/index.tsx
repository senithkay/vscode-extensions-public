/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { ReactNode } from "react";
import styled from "@emotion/styled";
import { Button, Codicon, Typography } from "@wso2-enterprise/ui-toolkit";
import { ExpressionFormField, Form, FormField, FormValues } from "@wso2-enterprise/ballerina-side-panel";
import { BodyText } from "../../../styles";
import { Colors } from "../../../../resources/constants";
import { SubPanel } from "@wso2-enterprise/ballerina-core";
import { S } from "../../../Connectors/ActionList";

const Container = styled.div`
    max-width: 600px;
`;

const Row = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 8px;
    width: 100%;
    color: ${Colors.ON_SURFACE};
`;


export interface SidePanelProps {
    id?: string;
    className?: string;
    isOpen?: boolean;
    overlay?: boolean;
    children?: React.ReactNode;
    alignment?: "left" | "right";
    width?: number;
    sx?: any;
    onClose?: (event?: React.MouseEvent<HTMLElement, MouseEvent>) => void;
    subPanel?: ReactNode;
    subPanelWidth?: number;
    isSubPanelOpen?: boolean;
}

const SubPanelContainer = styled.div<SidePanelProps>`
    position: fixed;
    top: 0;
    ${(props: SidePanelProps) => props.alignment === "left" ? "left" : "right"}: ${(props: SidePanelProps) => `${props.width}px`};
    width: ${(props: SidePanelProps) => `${props.subPanelWidth}px`};
    height: 100%;
    box-shadow: 0 5px 10px 0 var(--vscode-badge-background);
    background-color: var(--vscode-editor-background);
    color: var(--vscode-editor-foreground);
    z-index: 1999;
    opacity: ${(props: SidePanelProps) => props.isSubPanelOpen ? 1 : 0};
    transform: translateX(${(props: SidePanelProps) => props.alignment === 'left'
        ? (props.isSubPanelOpen ? '0%' : '-100%')
        : (props.isSubPanelOpen ? '0%' : '100%')});
    transition: transform 0.4s ease 0.1s, opacity 0.4s ease 0.1s;
`;

interface ConnectionConfigViewProps {
    name: string;
    fields: FormField[];
    onSubmit: (data: FormValues) => void;
    onBack?: () => void;
    openSubPanel?: (subPanel: SubPanel) => void;
    updatedExpressionField?: ExpressionFormField;
    resetUpdatedExpressionField?: () => void;
    isActiveSubPanel?: boolean;

}

export function ConnectionConfigView(props: ConnectionConfigViewProps) {
    const { name, fields, onSubmit, onBack, openSubPanel, updatedExpressionField, resetUpdatedExpressionField, isActiveSubPanel } = props;

    // TODO: With the InlineEditor implementation, the targetLine, fileName and expressionEditor should be passed to the Form component
    return (
        <Container>
            <BodyText style={{ padding: '20px' }}>
                Provide the necessary configuration details for the selected connector to complete the setup.
            </BodyText>
            <Form
                formFields={fields}
                onSubmit={onSubmit}
                openSubPanel={openSubPanel}
                isActiveSubPanel={isActiveSubPanel}
                targetLineRange={{ startLine: { line: 0, offset: 0 }, endLine: { line: 0, offset: 0 } }}
                fileName={""}
                updatedExpressionField={updatedExpressionField}
                resetUpdatedExpressionField={resetUpdatedExpressionField}
                expressionEditor={{
                    completions: [],
                    triggerCharacters: [],
                    retrieveCompletions: async () => { },
                    retrieveVisibleTypes: async () => { },
                    extractArgsFromFunction: async () => ({ label: '', args: [], currentArgIndex: 0 }),
                    onCancel: () => { },
                }}
            />
        </Container>
    );
}

export default ConnectionConfigView;
