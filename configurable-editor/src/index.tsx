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

import React from "react";
import ReactDOM from "react-dom";

import ConfigEditor from "./components/ConfigEditor";
import { ConfigForm } from "./components/ConfigForm";
import { RecordTypeProps } from "./components/types/RecordType";
import { ConfigSchema } from "./components/model";
export { ConfigForm, RecordTypeProps as ConfigObjectProps, ConfigSchema };

export function renderConfigEditor(
    data: ConfigSchema,
    existingConfigs: object,
    defaultButtonText: string,
    primaryButtonText: string,
    onClickDefaultButton: () => void,
    onClickPrimaryButton: (configProperties: RecordTypeProps) => void,
) {
    ReactDOM.render(
            (
            <ConfigEditor>
                <ConfigForm
                    configSchema={data}
                    existingConfigs={existingConfigs}
                    defaultButtonText={defaultButtonText}
                    primaryButtonText={primaryButtonText}
                    onClickDefaultButton={onClickDefaultButton}
                    onClickPrimaryButton={onClickPrimaryButton}
                    isLowCode={true}
                />
            </ConfigEditor>
        ),
        document.getElementById("configEditor"),
    );
}
