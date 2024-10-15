import styled from '@emotion/styled';
import React, { useState } from 'react';
import { VSCodePanels, VSCodePanelTab, VSCodePanelView } from "@vscode/webview-ui-toolkit/react";
import { ThemeColors } from '@wso2-enterprise/ui-toolkit';
import { LineRange } from '@wso2-enterprise/ballerina-core';
import { LibrariesView } from './LibrariesView';
import { ExpressionFormField } from '@wso2-enterprise/ballerina-side-panel';


interface HelperViewProps {
    filePath: string;
    position: LineRange;
    updateFormField: (data: ExpressionFormField) => void;
    editorKey: string;
}

enum TabElements {
    variables = 'Variables',
    libraries = 'Libraries',
    configure = 'Configure'
}

const Container = styled.div`
    height: 100%;
    background-color: var(--vscode-editor-background);
    color: var(--vscode-editor-foreground);
`;

const PanelContent = styled(VSCodePanelView)`
    height: 100%;
    padding: 10px 0 10px 3px;
`;

export function HelperView(props: HelperViewProps) {
    const { filePath, position, updateFormField, editorKey } = props;
    console.log('===helperPane', filePath, position);

    const [activeTab, setActiveTab] = useState('Tab1');


    return (
        <Container>
            <VSCodePanels activeid={TabElements.variables}>
                <VSCodePanelTab id={TabElements.variables}>{TabElements.variables}</VSCodePanelTab>
                <VSCodePanelTab id={TabElements.libraries}>{TabElements.libraries}</VSCodePanelTab>
                <VSCodePanelTab id={TabElements.configure}>{TabElements.configure}</VSCodePanelTab>
                <PanelContent id={TabElements.variables}>
                    <div>Content for Tab 1</div>
                </PanelContent>
                <PanelContent id={TabElements.libraries}>
                    <LibrariesView filePath={filePath} position={position} updateFormField={updateFormField} editorKey={editorKey}/>
                </PanelContent>
                <PanelContent id={TabElements.configure}>
                    <div>Content for Tab 3</div>
                </PanelContent>

            </VSCodePanels>
        </Container>
    );
};

