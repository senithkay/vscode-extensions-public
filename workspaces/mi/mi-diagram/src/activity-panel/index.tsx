/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import styled from "@emotion/styled";
import React from "react";
import { ActivitySection } from "./components/section";

const ActivityPanelContainer = styled.div`
    display: flex;
    flex-direction: row;
    height: 100%;
    width: 100%;
    position: relative;
`;

export function ActivityPanel() {
    return (
        <ActivityPanelContainer>
            <ActivitySection title={'section heading'}>
                <div>section content</div>
            </ActivitySection>

        </ActivityPanelContainer>
    );
}
