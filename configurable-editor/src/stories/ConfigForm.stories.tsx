import React from "react";

import ConfigForm from "../components/ConfigForm";
import { ConfigObjectProps } from "../components/ConfigObject";

import configSchema from "./data/config-schema.json";
import existingConfigs from "./data/existing-configs.json";

export default {
  component: ConfigForm,
  title: "ConfigForm",
};

const onClickDefaultButton = () => {
  // tslint:disable-next-line: no-console
  console.log("Default Button clicked");
};

const onClickPrimaryButton = (configProperties: ConfigObjectProps) => {
  // tslint:disable-next-line: no-console
  console.log(configProperties);
};

export const BasicForm = () => (
    <ConfigForm
        configSchema={configSchema}
        existingConfigs={existingConfigs}
        defaultButtonText={"Cancel"}
        primaryButtonText={"Run"}
        onClickDefaultButton={onClickDefaultButton}
        onClickPrimaryButton={onClickPrimaryButton}
    />
);
