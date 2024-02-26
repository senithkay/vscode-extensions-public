/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React, { useState } from "react";
import { storiesOf } from "@storybook/react";
import { ParamConfig, ParamManager } from "./ParamManager";

// Sample object for ParamManager
const paramConfigs: ParamConfig = {
    paramValues: [
        {
            id: 0,
            parameters: [
                {
                    id: 0,
                    label: "Type",
                    type: "TextField",
                    value: "int",
                    isRequired: true
                },
                {
                    id: 1,
                    label: "Name",
                    type: "TextField",
                    value: "var1",
                    isRequired: true
                },
                {
                    id: 2,
                    label: "Default Value",
                    type: "Dropdown",
                    value: "0",
                    isRequired: false,
                    values: ["0", "1", "2"]
                }
            ]
        }
    ],
    paramFields: [
        {
            type: "TextField",
            label: "Type",
            defaultValue: "John Doe",
            isRequired: true
        },
        {
            type: "TextField",
            label: "Name",
            defaultValue: "var",
            isRequired: true
        },
        {
            type: "Dropdown",
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
