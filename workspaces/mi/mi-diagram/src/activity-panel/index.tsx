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
