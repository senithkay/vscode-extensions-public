/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import styled from '@emotion/styled';
import React, { useState } from 'react';
import { VSCodePanels, VSCodePanelTab, VSCodePanelView } from "@vscode/webview-ui-toolkit/react";
import { Button, Codicon, ThemeColors } from '@wso2-enterprise/ui-toolkit';
import { LineRange, SubPanel, SubPanelView } from '@wso2-enterprise/ballerina-core';
import { LibrariesView } from './LibrariesView';
import { ExpressionFormField } from '@wso2-enterprise/ballerina-side-panel';
import { VariablesView } from './VariablesView';


interface HelperViewProps {
    filePath: string;
    position: LineRange;
    updateFormField: (data: ExpressionFormField) => void;
    editorKey: string;
    onClosePanel: (subPanel: SubPanel) => void;
}

enum TabElements {
    variables = 'Variables',
    libraries = 'Libraries',
    configure = 'Configure'
}

const Container = styled.div`
    height: 100%;
    padding-top: 10px;
`;

const PanelContent = styled(VSCodePanelView)`
    height: 100%;
    padding: 10px 0 10px 3px;
`;

export const PanelBody = styled.div`
    height: 100vh;
`;

export const CloseButton = styled(Button)`
        position: absolute;
        right: 10px;
        border-radius: 5px;
    `;

const StyledVSCodePanels = styled(VSCodePanels)`
    padding: 7px;
    overflow: hidden;
`;



export function HelperView(props: HelperViewProps) {
    const { filePath, position, updateFormField, editorKey, onClosePanel } = props;

    const onClose = () => {
        onClosePanel({ view: SubPanelView.UNDEFINED });
    }

    return (
        <Container>
            <CloseButton appearance="icon" onClick={onClose}>
                <Codicon name="close" />
            </CloseButton>
            <StyledVSCodePanels activeid={TabElements.variables}>
                <VSCodePanelTab id={TabElements.variables}>{TabElements.variables}</VSCodePanelTab>
                <VSCodePanelTab id={TabElements.libraries}>{TabElements.libraries}</VSCodePanelTab>
                <VSCodePanelTab id={TabElements.configure}>{TabElements.configure}</VSCodePanelTab>
                <PanelContent id={TabElements.variables} disabled>
                    <VariablesView filePath={filePath} position={position} updateFormField={updateFormField} editorKey={editorKey} />
                </PanelContent>
                <PanelContent id={TabElements.libraries}>
                    <LibrariesView filePath={filePath} position={position} updateFormField={updateFormField} editorKey={editorKey} />
                </PanelContent>
                <PanelContent id={TabElements.configure}>
                    <div></div>
                </PanelContent>

            </StyledVSCodePanels>
        </Container>
    );
};

