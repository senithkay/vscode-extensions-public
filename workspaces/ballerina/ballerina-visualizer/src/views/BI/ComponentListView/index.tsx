/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from "react";
import { View, ViewContent } from "@wso2-enterprise/ui-toolkit";
import { TitleBar } from "../../../components/TitleBar";
import { TopNavigationBar } from "../../../components/TopNavigationBar";
import { AddPanel, Container } from "./styles";
import { AutomationPanel } from "./AutomationPanel";
import { EventIntegrationPanel } from "./EventIntegrationPanel";
import { FileIntegrationPanel } from "./FileIntegrationPanel";
import { IntegrationAPIPanel } from "./IntegrationApiPanel";
import { OtherArtifactsPanel } from "./OtherArtifactsPanel";

export function ComponentListView() {
    return (
        <View>
            <TopNavigationBar />
            <TitleBar title="Constructs" subtitle="Add a new construct to your integration" />
            <ViewContent padding>
                <Container>
                    <AddPanel>
                        <AutomationPanel />
                        <IntegrationAPIPanel />
                        <EventIntegrationPanel />
                        <FileIntegrationPanel />
                        <OtherArtifactsPanel />
                    </AddPanel>
                </Container>
            </ViewContent>
        </View>
    );
}
