/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from "react";

import { Box } from "@material-ui/core";
import { Story } from "@storybook/react";

import ConfigEditor from "../../components/ConfigEditor";
import { ConfigElementProps } from "../../components/ConfigElement";
import ConfigForm from "../../components/ConfigForm";
import { ConfigSchema } from "../../components/model";
import connnectionSchema from "../connection-schema.json";

import configSchema from "./config-schema.json";
import existingConfigs from "./existing-configs.json";

const onClickDefaultButton = () => {
    // tslint:disable-next-line: no-console
    console.log("Default Button clicked");
};

const onClickPrimaryButton = (configProperties: ConfigElementProps) => {
    // tslint:disable-next-line: no-console
    console.log(JSON.stringify(configProperties));
};

export default {
    args: { onClickPrimaryButton },
    component: ConfigForm,
    title: "Configurable Editor",
};

export const ObjectTypes: Story = (args) => (
    <Box maxWidth={500} margin="auto">
        <ConfigEditor>
            <ConfigForm
                configSchema={configSchema as ConfigSchema}
                connectionConfig={connnectionSchema}
                existingConfigs={existingConfigs}
                defaultButtonText={"Cancel"}
                primaryButtonText={"Run"}
                onClickDefaultButton={onClickDefaultButton}
                onClickPrimaryButton={args.onClickPrimaryButton}
            />
        </ConfigEditor>
    </Box>
);
