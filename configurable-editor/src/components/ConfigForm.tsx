/**
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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
import React, { useState } from "react";

import { Box, Button, CardActions } from "@material-ui/core";

import { ConfigElementProps, getConfigElement } from "./ConfigElement";
import { ConfigObjectProps, getConfigObject } from "./ConfigObject";
import {
  ConfigSchema,
  ConfigValue,
  MetaData,
  SchemaConstants,
  setMetaData,
} from "./model";
import {
  getConfigProperties,
  instanceOfConfigElement,
  setExistingValues,
  updateConfigObjectProps,
} from "./utils";

let metaData: MetaData = null;

/**
 * Returns the config schema values for a package, removes the 2 top most root
 * properties and sets the meta data values.
 * @param configSchema The original config schema object.
 * @returns            The config schema object without the 2 top most root properties.
 */
function getPackageConfig(configSchema: ConfigSchema): object {
  const orgConfig: object = configSchema.properties;
  const orgName = Object.keys(orgConfig)[0];

  const packageConfig: object = orgConfig[orgName][SchemaConstants.PROPERTIES];
  const packageName = Object.keys(packageConfig)[0];

  metaData = setMetaData(orgName, packageName);

  return packageConfig[packageName];
}

export interface ConfigFormProps {
  configSchema: ConfigSchema;
  existingConfigs: object;
  defaultButtonText: string;
  primaryButtonText: string;
  onClickDefaultButton: () => void;
  onClickPrimaryButton: (configProperties: ConfigObjectProps) => void;
  isConsole?: boolean;
}

const getConfigForm = (
  configProperty: ConfigObjectProps | ConfigElementProps
) => {
  if (instanceOfConfigElement(configProperty)) {
    return (
      <div key={configProperty.id}>
        {getConfigElement(configProperty as ConfigElementProps)}
      </div>
    );
  } else {
    return (
      <div key={configProperty.id}>
        {getConfigObject(configProperty as ConfigObjectProps)}
      </div>
    );
  }
};

export const ConfigForm = ({
  configSchema,
  existingConfigs,
  defaultButtonText,
  primaryButtonText,
  onClickDefaultButton,
  onClickPrimaryButton,
  isConsole,
}: ConfigFormProps) => {
  const [configValue, setConfigValue] = useState(new Array<ConfigValue>());
  const [submitType, setSubmitType] = useState("");

  // The config property object retrieved from the config schema.
  let configObjectProps: ConfigObjectProps = getConfigProperties(
    getPackageConfig(configSchema)
  );

  // Set the existing config values to the config property obtained.
  setExistingValues(configObjectProps, existingConfigs, metaData);

  const handleSetConfigValue = (config: ConfigValue) => {
    const existingConfig = configValue.findIndex(
      (property) => property.key === config.key
    );
    if (existingConfig > -1) {
      configValue[existingConfig].value = config.value;
    } else {
      configValue.push(config);
    }
    setConfigValue(configValue);
  };

  const handleSubmit = (event: any) => {
    event.preventDefault();
    configObjectProps = updateConfigObjectProps(configObjectProps, configValue);

    if (submitType === defaultButtonText) {
      onClickDefaultButton();
    } else if (submitType === primaryButtonText) {
      onClickPrimaryButton(configObjectProps);
    }
  };

  const handleSetSubmitType = (value: string) => {
    setSubmitType(value);
  };

  configObjectProps.properties.forEach((entry) => {
    entry.setConfigElement = handleSetConfigValue;
  });

  return (
    <Box width="100%">
      <form className="ConfigForm" onSubmit={handleSubmit}>
        {configObjectProps.properties.map(getConfigForm)}
        <CardActions>
          <Box
            width="100%"
            pt={3}
            mb={3}
            display="flex"
            justifyContent={isConsole ? "flex-end" : "center"}
            alignItems="center"
          >
            <Box mx={1}>
              <Button
                variant="contained"
                color="default"
                size="small"
                onClick={handleSetSubmitType.bind(this, defaultButtonText)}
              >
                {defaultButtonText}
              </Button>
            </Box>
            <Box mx={1}>
              <Button
                variant="contained"
                color="primary"
                size="small"
                type="submit"
                onClick={handleSetSubmitType.bind(this, primaryButtonText)}
              >
                {primaryButtonText}
              </Button>
            </Box>
          </Box>
        </CardActions>
      </form>
    </Box>
  );
};

export default ConfigForm;

ConfigForm.defaultProps = {
  isConsole: false,
};
