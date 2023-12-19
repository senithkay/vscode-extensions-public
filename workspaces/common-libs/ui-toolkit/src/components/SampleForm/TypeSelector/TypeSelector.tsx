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

export const FORM_WIDTH = 600;

const Container = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
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

export interface TypeSelectorProps {
    sx?: any;
}

export const TypeSelector = () => {

    return (
        <Container>
            <FormContent>
                <Header/>
                <Typography variant="h6" sx={{ marginTop: 0 }}>Welcome to Project Choreo, an experimental web-based development workspace from WSO2.</Typography>
                <Typography variant="h5" sx={{ marginTop: 0, marginBottom: 16 }}> Create a new workspace </Typography>

                <HorizontalIcons sx={{marginBottom: 5}} leftIconName='globe' rightIconName='plus' title='New Web app' description='Write an app using a web framework or simple HTML/JS/CSS'/>
                <HorizontalIcons sx={{marginBottom: 5}} leftIconName='flutter' rightIconName='plus' title='New Flutter app' description='Write a cross-platform Flutter app in Dart'/>
                <HorizontalIcons sx={{marginBottom: 5}} leftIconName='empty' rightIconName='plus' title='New Blank workspace' description='Get started with a completely blank setup'/>
                <HorizontalIcons sx={{marginBottom: 5}} leftIconName='import' rightIconName='plus' title='Import a repo' description='Start from an existing GitHub repository'/>
                <HorizontalIcons sx={{marginBottom: 5}} leftIconName='soon' rightIconName='plus' title='Python, Go, Al and more coming soon' description="Share your feedback on which templates you'd like to see"/>

                <PanelWrapper>
                    <VSCodePanels>
                        <VSCodePanelTab label="your-workspaces"> Your workspaces </VSCodePanelTab>
                        <VSCodePanelTab label="shared-workspaces"> Shared with you </VSCodePanelTab>

                        <VSCodePanelView>
                            <HorizontalIcons sx={{marginBottom: 5}} leftIconName='react' rightIconName='ellipsis' title='sample 1' description="sample-1 • Accessed 3 hours ago"/>
                        </VSCodePanelView>
                        <VSCodePanelView>
                            <HorizontalIcons sx={{marginBottom: 5}} leftIconName='nextjs' rightIconName='ellipsis' title='sample 2' description="sample-2 • Accessed 4 hours ago"/>
                        </VSCodePanelView>
                    </VSCodePanels>
                </PanelWrapper>
                
            </FormContent>
        </Container>
    );
};
