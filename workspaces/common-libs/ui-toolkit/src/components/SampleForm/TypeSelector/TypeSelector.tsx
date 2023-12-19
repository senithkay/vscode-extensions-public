/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React from 'react';
import styled from '@emotion/styled';
import { Typography } from '../../Typography/Typography';
import { Header } from '../Header/Header';
import { HorizontalIcons } from '../HorizontalIcons/HorizontalIcons';
import {
    VSCodePanels,
    VSCodePanelTab,
    VSCodePanelView
} from "@vscode/webview-ui-toolkit/react";
import { HorizontalIconsWithSeparator } from '../HorizontalIconsWithSeparator/HorizontalIconsWithSeparator';

export const FORM_WIDTH = 600;

export interface TypeSelectorProps {
    sx?: any;
    onTypeSelected?: (type: string) => void;
}

const Container = styled.div<TypeSelectorProps>`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    ${(props: TypeSelectorProps) => props.sx};
`;

const FormContent = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    color: var(--vscode-editor-foreground);
    font-family: var(--font-family);
`;

const PanelWrapper = styled.div`
    margin-top: 10px;
    margin-left: -6px;
`;

export const TypeSelector = (props: TypeSelectorProps) => {
    const { sx, onTypeSelected } = props;

    const handleSelection = (type?: string) => {
        if (onTypeSelected) {
            onTypeSelected(type);
        }
    };

    return (
        <Container sx={sx}>
            <FormContent>
                <Header/>
                <Typography variant="h6" sx={{ marginTop: 0 }}>Welcome to Project Choreo, an experimental web-based development workspace from WSO2.</Typography>
                <Typography variant="h5" sx={{ marginTop: 0, marginBottom: 16 }}> Create a new workspace </Typography>

                <HorizontalIcons onClick={() => handleSelection("New Web app")} sx={{marginBottom: 5}} leftIconName='globe' rightIconName='plus' title='New Web app' description='Write an app using a web framework or simple HTML/JS/CSS'/>
                <HorizontalIcons onClick={() => handleSelection("New Flutter app")} sx={{marginBottom: 5}} leftIconName='flutter' rightIconName='plus' title='New Flutter app' description='Write a cross-platform Flutter app in Dart'/>
                <HorizontalIcons onClick={() => handleSelection("New Blank workspace")} sx={{marginBottom: 5}} leftIconName='empty' rightIconName='plus' title='New Blank workspace' description='Get started with a completely blank setup'/>
                <HorizontalIcons onClick={() => handleSelection("Import a repo")} sx={{marginBottom: 5}} leftIconName='import' rightIconName='plus' title='Import a repo' description='Start from an existing GitHub repository'/>
                <HorizontalIcons onClick={() => handleSelection("Coming soon")} sx={{marginBottom: 5}} leftIconName='soon' rightIconName='plus' title='Python, Go, Al and more coming soon' description="Share your feedback on which templates you'd like to see"/>

                <PanelWrapper>
                    <VSCodePanels>
                        <VSCodePanelTab label="your-workspaces"> Your workspaces </VSCodePanelTab>
                        <VSCodePanelTab label="shared-workspaces"> Shared with you </VSCodePanelTab>

                        <VSCodePanelView>
                            <HorizontalIconsWithSeparator onClick={() => handleSelection("sample 1")} sx={{marginBottom: 5}} leftIconName='react' rightIconName='ellipsis' title='sample 1' description="sample-1 • Accessed 3 hours ago"/>
                        </VSCodePanelView>
                        <VSCodePanelView>
                            <HorizontalIconsWithSeparator onClick={() => handleSelection("sample 2")} sx={{marginBottom: 5}} leftIconName='nextjs' rightIconName='ellipsis' title='sample 2' description="sample-2 • Accessed 4 hours ago"/>
                        </VSCodePanelView>
                    </VSCodePanels>
                </PanelWrapper>
                
            </FormContent>
        </Container>
    );
};
