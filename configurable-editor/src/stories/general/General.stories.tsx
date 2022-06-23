import { Story } from "@storybook/react";
import React from "react";

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
    // console.log(configProperties);
    expect(configProperties);
};

export const General: Story = () => (
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
