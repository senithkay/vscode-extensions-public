import React from "react";

import ConfigForm from "../components/ConfigForm";

import configSchema from "./data/config-schema.json";
import existingConfigs from "./data/existing-configs.json";

export default {
  component: ConfigForm,
  title: "ConfigForm",
};

// const onClickDefaultButton = () => {
//   // tslint:disable-next-line: no-console
//   console.log("Default Button clicked");
// };

// const onClickPrimaryButton = (configProperties: ConfigProperties[]) => {
//   // tslint:disable-next-line: no-console
//   console.log(configProperties);
// };

// export const BasicForm = () => <ConfigForm configSchema={configSchema} defaultButtonText="Cancel" primaryButtonText="Deploy" onClickDefaultButton={onClickDefaultButton} onClickPrimaryButton={onClickPrimaryButton} />;

export const BasicForm = () => (
    <ConfigForm
        configSchema={configSchema}
        existingConfigs={existingConfigs}
        defaultButtonText={"Cancel"}
        primaryButtonText={"Run"}
    />
);
