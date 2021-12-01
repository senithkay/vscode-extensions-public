import React from "react";

import ConfigForm from "../components/ConfigForm";

import configSchema from "./data/config-schema.json";

export default {
  component: ConfigForm,
  title: "ConfigForm",
};

export const BasicForm = () => <ConfigForm configSchema={configSchema}/>;
