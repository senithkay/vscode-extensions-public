/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React, { useState } from "react";
import { storiesOf } from "@storybook/react";
import { ParamConfig, ParamManager } from "./ParamManager";
import { Type } from "./TypeResolver";

// Sample object for ParamManager
const paramConfigs: ParamConfig = {
    param: [
        {
            id: 0,
            parameters: [
                {
                    id: 0,
                    label: "Type",
                    type: Type.TextField,
                    value: "int",
                    isRequired: true
                },
                {
                    id: 1,
                    label: "Name",
                    type: Type.TextField,
                    value: "var1",
                    isRequired: true
                },
                {
                    id: 2,
                    label: "Default Value",
                    type: Type.TextField,
                    value: "0",
                    isRequired: false
                }
            ]
        }
    ],
    paramFields: [
        {
            type: Type.TextField,
            label: "Type",
            defaultValue: "John Doe",
            isRequired: true
        },
        {
            type: Type.TextField,
            label: "Name",
            defaultValue: "var",
            isRequired: true
        },
        {
            type: Type.TextField,
            label: "Default Value",
            defaultValue: "0",
            isRequired: false
        }
    ]
};

const ParamManagerDefault = () => {
    const [params, setParams] = useState(paramConfigs);
    const handleOnChange = (params: any) => {
        setParams(params);
    };

    return (
        <>
            <ParamManager paramConfigs={params} readonly={false} onChange={handleOnChange} />
        </>
    );
};
storiesOf("Param Manager").add("Manager", () => <ParamManagerDefault />);
