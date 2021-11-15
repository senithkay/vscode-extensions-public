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

export const SwaggerView = (data: any) => {
    const services: Option[] = [];
    const specs: OASpec[] = data.specs;
    specs.forEach((spec, index) => {
        services.push({ value: String(index), label: spec.serviceName });
    });

    const [spec, setService] = useState(specs[0].spec);
    const [selectedOption, setOption] = useState(services[0]);


    function selectService(option: Option) {
        const index = Number(option.value);
        setService(specs[index].spec);
        setOption(services[index]);
    }

    function requestInterceptor(req: any) {
        req.url = `http://localhost:18512/${req.url}`;
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
