/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { View, ViewContent } from '@wso2-enterprise/ui-toolkit';
import styled from '@emotion/styled';
import { TitleBar } from '../../../components/TitleBar';
import { TopNavigationBar } from '../../../components/TopNavigationBar';
import { AgentTabsForm } from './Forms/AgentTabsForm';


const Container = styled.div`
    display: "flex";
    flex-direction: "column";
    gap: 10;
    margin: 20px;
`;

interface AIAgentEditViewProps {
    agentName: string;
}

export function AIAgentEditView(params: AIAgentEditViewProps) {
    return (
        <View>
            <TopNavigationBar />
            <TitleBar title="AI Agent" subtitle="Update AI agent configurations" />
            <ViewContent>
                <Container>
                    <AgentTabsForm agentName={params.agentName} />
                </Container>
            </ViewContent>
        </View >
    );
};
