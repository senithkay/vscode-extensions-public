import React from "react";

import ConfigForm, { ConfigProperties } from "../components/ConfigForm";

import configSchema from "./data/config-schema.json";

export default {
  component: ConfigForm,
  title: "ConfigForm",
};

const onClickDefaultButton = () => {
  // tslint:disable-next-line: no-console
  console.log("Default Button clicked");
};

const onClickPrimaryButton = (configProperties: ConfigProperties[]) => {
  // tslint:disable-next-line: no-console
  console.log(configProperties);
};

export const BasicForm = () => <ConfigForm configSchema={configSchema} defaultButtonText="Cancel" primaryButtonText="Deploy" onClickDefaultButton={onClickDefaultButton} onClickPrimaryButton={onClickPrimaryButton} />;
