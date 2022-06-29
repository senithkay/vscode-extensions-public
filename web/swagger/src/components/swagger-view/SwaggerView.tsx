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

import React, { useState } from 'react';
import SwaggerUI from "swagger-ui-react";
import Dropdown, { Option } from 'react-dropdown';

import "./style.css";
import "swagger-ui-react/swagger-ui.css";
import 'react-dropdown/style.css';
interface OASpec {
    file: string;
    serviceName: string;
    spec: any;
    diagnostics: OADiagnostic[];
}

interface OADiagnostic {
    message: string;
    serverity: string;
    location?: LineRange;
}
interface LineRange {
    startLine: LinePosition;
    endLine: LinePosition;
}

interface LinePosition {
    line: number;
    offset: number;
}

export const SwaggerView = (props: any) => {
    const services: Option[] = [];
    const specs: OASpec[] = props.data.specs;
    const file: string | undefined = props.data.file;
    const serviceName: string | undefined = props.data.serviceName;
    const proxy: string | undefined = props.data.proxy;

    let selectedService = 0;
    specs.forEach((spec, index) => {
        services.push({
            value: String(index),
            label: `${spec.file} - /${spec.serviceName}`
        });

        if (file && serviceName && file === spec.file &&
            serviceName.toLocaleLowerCase() === spec.serviceName.trim().replaceAll(" ", "_").toLocaleLowerCase()) {
            selectedService = index;
        }
    });

    const [spec, setSpec] = useState(specs[selectedService].spec);
    const [selectedOption, setSelectedOption] = useState(services[selectedService]);

    function selectService(option: Option) {
        const index = Number(option.value);
        setSpec(specs[index].spec);
        setSelectedOption(services[index]);
    }

    async function requestInterceptor(req: any) {
        req.url = proxy + req.url;
        return req;
    }

    return (
        <div>
            <div className='dropdown-container'>
                <Dropdown options={services} onChange={selectService} value={selectedOption} placeholder="Select a service" />
            </div>
            <SwaggerUI requestInterceptor={requestInterceptor} spec={spec} showMutatedRequest={false} />
        </div>);
};
