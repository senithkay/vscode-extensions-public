/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { Button } from "@wso2-enterprise/ui-toolkit";
import { PullUpButton } from "./PullUPButton";
import styled from "@emotion/styled";

export default {
    component: PullUpButton,
    title: 'PullUpButton',
};

const Container = styled.div`
    min-height: 500px;
`;

const options = ["Option 1", "Option 2", "Option 3"];

export const SplitViewStory = () => {
    return (
        <Container>
            <PullUpButton options={options}>
                <Button appearance={"primary"}>
                    Add More
                </Button>
            </PullUpButton>
        </Container>
    );
};
