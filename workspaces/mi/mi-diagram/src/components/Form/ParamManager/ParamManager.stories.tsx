/* eslint-disable arrow-parens */
/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React, { useState } from "react";
import { ParamConfig, ParamField, ParamManager, ParamValue, ParamValueConfig } from "./ParamManager";

// Default export defining the component's metadata
export default {
    title: 'ParamManager',
    component: ParamManager,
};

const generateSpaceSeperatedStringFromParamValues = (paramValues: ParamValueConfig) => {
    let result = "";
    paramValues?.paramValues?.forEach(param => {
        // if param.value is an object
        if (typeof param.value === "string") {
            result += param.value + " ";
        } else {
            const pc = param?.value as ParamConfig;
            pc?.paramValues?.forEach(p => {
                result += p.key + " ";
            });
        }
    });
    return result.trim();
};

const generateSpaceSeperatedStringFromParamValue = (paramValues: ParamValueConfig) => {
    let result = "";
    paramValues?.paramValues?.forEach(param => {
        // if param.value is an object
        if (typeof param.value === "string") {
            result += param.value + " ";
        } else {
            const pc = param?.value as ParamConfig;
            pc?.paramValues?.forEach(p => {
                result += p.key + " ";
            });
        }
    });

    return result.trim();
};

// Sample object for ParamManager
const paramConfigs: ParamConfig = {
    paramValues: [
        {
            id: 0,
            paramValues: [
                {
                    value: "int",
                }, {
                    value: "var1",
                }, {
                    value: "0",
                }, {
                    value: true,
                }, {
                    value: "This is a description",
                },
                {
                    value: "Test2",
                },
                {
                    value: "query",
                }
            ],
            key: "Key",
            value: "int var1 0 true This is a description Test2 query",
            icon: "query"
        }
    ],
    paramFields: [
        {
            type: "TextField",
            label: "Type",
            defaultValue: "int",
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
            label: "Dropdown Sample",
            defaultValue: "0",
            isRequired: false,
            values: ["0", "1", "2"]
        },
        {
            type: "Checkbox",
            label: "Is Required",
            defaultValue: true,
            isRequired: false
        },
        {
            type: "TextArea",
            label: "Description",
            defaultValue: "This is a description",
            isRequired: false
        },
        {
            id: 4,
            type: "AutoComplete",
            label: "Auto Complete",
            defaultValue: "Test",
            values: ["Test1", "Test2", "Test3"],
            isRequired: true,
            nullable: true,
            noItemsFoundMessage: "No items",
        },
        {
            id: 4,
            type: "KeyLookup",
            label: "Key Lookup",
            defaultValue: "Key Lookup Value",
            isRequired: true,
            nullable: true,
            noItemsFoundMessage: "No items",
        }
    ]
};

// Story for ParamManagerDefault
export const Default = () => {
    const [params, setParams] = useState(paramConfigs);
    const handleOnChange = (params: ParamConfig) => {
        const modifiedParams = {
            ...params, paramValues: params.paramValues.map(param => ({
                ...param,
                icon: "query",
                key: `Key`,
                value: generateSpaceSeperatedStringFromParamValues(param)
            }))
        };
        setParams(modifiedParams);
    };
    return <ParamManager paramConfigs={params} readonly={false} addParamText="New Param" onChange={handleOnChange} />;
};

// Sample object for Nested ParamManager
const nestedParamConfigs: ParamConfig = {
    paramValues: [
        // {
        //     id: 0,
        //     paramValues: [
        //     ],
        //     key: "Key",
        //     value: "int var1 0 true This is a description Test2 query",
        //     icon: "query"
        // }
    ],
    paramFields: [
        {
            type: "TextField",
            label: "Type",
            defaultValue: "int",
            isRequired: true
        },
        {
            type: "ParamManager",
            paramManager: {
                paramConfigs: paramConfigs
                // isDrawe: false
            }
        }
    ]
};

// Story for Nested ParamManager
export const NestedParamManager = () => {
    const [params, setParams] = useState(nestedParamConfigs);
    const handleOnChange = (params: ParamConfig) => {
        const modifiedParams = {
            ...params, paramValues: params.paramValues.map(param => ({
                ...param,
                icon: "query",
                key: `Key`,
                value: generateSpaceSeperatedStringFromParamValues(param)
            }))
        };
        modifiedParams.paramValues.forEach((paramValueConf: ParamValueConfig) => {
            paramValueConf.paramValues.forEach((paramValue: ParamValue) => {
                if (typeof paramValue.value === "object") {
                    const paramConfig = paramValue.value as ParamConfig;
                    paramConfig.paramValues.forEach((pv: ParamValueConfig, i: number) => {
                        let result = "";
                        pv.paramValues.forEach((pvConf: ParamValue) => {
                            result += pvConf.value + " ";
                        });
                        pv.value = result.trim();
                        pv.icon = "query";
                        pv.key = `Key ${i}`;
                    });
                }
            });
        });
        setParams(modifiedParams);
    };
    return <ParamManager paramConfigs={params} readonly={false} addParamText="New Param" onChange={handleOnChange} />;
};

// Add a sample enableCondition (ConditionParams | string)[] object
const paramFields: ParamField[] = [
    {
        id: 0,
        type: "TextField",
        label: "Text Field",
        defaultValue: "default value",
        isRequired: true
    },
    {
        id: 1,
        type: "Dropdown",
        label: "Drop Down",
        defaultValue: "1",
        values: ["1", "2", "3"],
    },
    {
        id: 2,
        type: "Checkbox",
        label: "Checkbox",
        defaultValue: false,
        enableCondition: [
            "OR",
            { 1: "2", 0: "2" }
        ]
    },
    {
        id: 3,
        type: "TextArea",
        label: "Text Area",
        defaultValue: "Test"
    }
];

const config: ParamConfig = {
    paramValues: [],
    paramFields: paramFields
};

// Story for EnableCondition
export const WithEnableCondition = () => {
    const [params, setParams] = useState(config);
    const handleOnChange = (params: ParamConfig) => {
        const modifiedParams = {
            ...params, paramValues: params.paramValues.map(param => ({
                ...param,
                icon: "query",
                key: `Key`,
                value: generateSpaceSeperatedStringFromParamValues(param)
            }))
        };
        setParams(modifiedParams);
    };
    return <ParamManager paramConfigs={params} readonly={false} onChange={handleOnChange} />;
};

// Add a sample enableCondition (ConditionParams | string)[] object
const paramFieldsWithEmptyLogicalExpr: ParamField[] = [
    {
        id: 0,
        type: "TextField",
        label: "Text Field",
        defaultValue: "default value",
        isRequired: true
    },
    {
        id: 1,
        type: "Dropdown",
        label: "Drop Down",
        defaultValue: "1",
        values: ["1", "2", "3"],
    },
    {
        id: 2,
        type: "Checkbox",
        label: "Checkbox",
        defaultValue: false,
        enableCondition: [
            { 1: "2" }
        ]
    },
    {
        id: 3,
        type: "TextArea",
        label: "Text Area",
        defaultValue: "Test"
    }
];

const emptyLogicalExpr: ParamConfig = {
    paramValues: [],
    paramFields: paramFieldsWithEmptyLogicalExpr
};

export const EmptyLogicCondition = () => {
    const [params, setParams] = useState(emptyLogicalExpr);
    const handleOnChange = (params: ParamConfig) => {
        const modifiedParams = { ...params, paramValues: params.paramValues.map(param => {
            return {
                ...param,
                icon: "query",
                key: `Key`,
                value: generateSpaceSeperatedStringFromParamValues(param)
            }
        })};
        setParams(modifiedParams);
    };

    return (
        <>
            <ParamManager paramConfigs={params} readonly={false} onChange={handleOnChange} />
        </>
    );
};
