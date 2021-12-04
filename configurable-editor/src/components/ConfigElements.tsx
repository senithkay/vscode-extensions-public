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

import ConfigElement from "./ConfigElement";
import { ConfigProperties, ConfigProperty } from "./ConfigForm";

function ConfigElements(props: any) {
    const [configProperty, setConfigProperty] = useState(new Array<ConfigProperty>());

    const configProperties: ConfigProperties = {
        moduleName: props.moduleName,
        properties: new Array<ConfigProperty>(),
    };

    const handleSetConfig = (e: ConfigProperty) => {
        const existingConfig = configProperty.findIndex((property) => property.name === e.name);
        if (existingConfig > -1) {
            configProperty[existingConfig].value = e.value;
        } else {
            configProperty.push(e);
        }
        setConfigProperty(configProperty);
        configProperties.properties = configProperty;
        props.setConfigs(configProperties);
    };

    const getConfigElements = (element: ConfigProperty, index: number) => {
        return (
            <ConfigElement
                key={props.moduleName + index}
                name={element.name}
                type={element.type}
                description={element.description}
                required={element.required}
                moduleName={props.moduleName}
                value={element.value}
                setConfigValue={handleSetConfig}
            />
        );
    };

    return (
        <div className="ConfigElements">
            {props.elements.map(getConfigElements)}
        </div>
    );
}

export default ConfigElements;
