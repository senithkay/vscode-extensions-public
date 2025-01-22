/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from "react";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { TokenEditor } from ".";

export default {
    title: "Token Editor",
    component: TokenEditor,
} as ComponentMeta<typeof TokenEditor>;

export const Default: ComponentStory<typeof TokenEditor> = () => {
    return (
        <div style={{ width: "300px", height: "300px" }}>
            <TokenEditor />
        </div>
    );
};
