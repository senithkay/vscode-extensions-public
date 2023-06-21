/**
 * Copyright (c) 2021, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from "react";
import ReactDOM from "react-dom";

import ConfigEditor from "./components/ConfigEditor";
import { ConfigElementProps } from "./components/ConfigElement";
import { ConfigForm } from "./components/ConfigForm";
import { ConfigSchema, ConnectionSchema } from "./components/model";

export { ConfigForm, ConfigElementProps, ConfigSchema };

export function renderConfigEditor(
    data: ConfigSchema,
    existingConfigs: object,
    defaultButtonText: string,
    primaryButtonText: string,
    onClickDefaultButton: () => void,
    onClickPrimaryButton: (configProperties: ConfigElementProps) => void,
    isLowCode: boolean,
    connectionConfigData: ConnectionSchema[],
    isFeaturePreview: boolean,
) {
    ReactDOM.render(
            (
            <ConfigEditor>
                <ConfigForm
                    configSchema={data}
                    connectionConfig={connectionConfigData}
                    existingConfigs={existingConfigs}
                    defaultButtonText={defaultButtonText}
                    primaryButtonText={primaryButtonText}
                    onClickDefaultButton={onClickDefaultButton}
                    onClickPrimaryButton={onClickPrimaryButton}
                    isLowCode={isLowCode}
                    isFeaturePreview={isFeaturePreview}
                />
            </ConfigEditor>
        ),
        document.getElementById("configEditor"),
    );
}
