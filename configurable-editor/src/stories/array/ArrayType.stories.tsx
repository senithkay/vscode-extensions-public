/**
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */

import React from "react";

import { Story } from "@storybook/react";

import ConfigEditor from "../../components/ConfigEditor";
import { ConfigElementProps } from "../../components/ConfigElement";
import ConfigForm from "../../components/ConfigForm";
import { ConfigSchema } from "../../components/model";

import configSchema from "./config-schema.json";
import existingConfigs from "./existing-configs.json";

export default {
    component: ConfigForm,
    title: "Configurable Editor",
};

const onClickDefaultButton = () => {
    // tslint:disable-next-line: no-console
    console.log("Default Button clicked");
};

const onClickPrimaryButton = (configProperties: ConfigElementProps) => {
    // tslint:disable-next-line: no-console
    console.log(JSON.stringify(configProperties));
};

export const ArrayTypes: Story = () => (
    <ConfigEditor>
        <ConfigForm
            configSchema={configSchema as ConfigSchema}
            existingConfigs={existingConfigs}
            defaultButtonText={"Cancel"}
            primaryButtonText={"Run"}
            onClickDefaultButton={onClickDefaultButton}
            onClickPrimaryButton={onClickPrimaryButton}
        />
    </ConfigEditor>
);
