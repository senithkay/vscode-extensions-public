/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 * 
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
*/


import React, { useEffect, useState } from 'react';
import { AutoComplete, Button, ComponentCard, colors, RequiredFormInput, TextField, ParamConfig, ParamManager } from '@wso2-enterprise/ui-toolkit';
import { VSCodeCheckbox, VSCodeDropdown, VSCodeOption, VSCodeDataGrid, VSCodeDataGridRow, VSCodeDataGridCell } from '@vscode/webview-ui-toolkit/react';
import styled from '@emotion/styled';
import SidePanelContext from '../../../SidePanelContexProvider';
import { AddMediatorProps } from '../common';
import { useVisualizerContext } from '@wso2-enterprise/mi-rpc-client';
import { getXML } from '../../../../../utils/template-engine/mustach-templates/templateUtils';
import { MEDIATORS } from '../../../../../resources/constants';

const cardStyle = {
    display: "block",
    margin: "15px 0",
    padding: "0 15px 15px 15px",
    width: "auto",
    cursor: "auto"
};

const Error = styled.span`
   color: var(--vscode-errorForeground);
   font-size: 12px;
`;

const Field = styled.div`
   margin-bottom: 12px;
`;

const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;
const nameWithoutSpecialCharactorsRegex = /^[a-zA-Z0-9]+$/g;

const generateDisplayValue = (paramValues: any) => {
    const result: string = paramValues.parameters[2].value + " " + paramValues.parameters[3].value + " " + paramValues.parameters[4].value;
    return result.trim();
};

const RuleForm = (props: AddMediatorProps) => {
    const { rpcClient } = useVisualizerContext();
    const sidePanelContext = React.useContext(SidePanelContext);
    const [formValues, setFormValues] = useState({} as { [key: string]: any });
    const [errors, setErrors] = useState({} as any);

    const inputFactsConfigs: ParamConfig = {
        paramValues: [],
        paramFields: [
            {
                id: 0,
                type: "Dropdown",
                label: "Fact Type",
                defaultValue: "CUSTOM",
                values: ["CUSTOM", "dom", "message", "context", "omelement", "mediator"],
                isRequired: true,
            },
            {
                id: 1,
                type: "TextField",
                label: "Fact Custom Type",
                defaultValue: "",
                isRequired: false,
                enableCondition: [{ 0: "CUSTOM" }]
            },
            {
                id: 2,
                type: "TextField",
                label: "Fact Name",
                defaultValue: "",
                isRequired: false,
            },
            {
                id: 3,
                type: "Dropdown",
                label: "Value Type",
                defaultValue: "LITERAL",
                isRequired: false,
                values: ["NONE", "LITERAL", "EXPRESSION", "REGISTRY_REFERENCE"]
            },
            {
                id: 4,
                type: "TextField",
                label: "Value Literal",
                defaultValue: "value",
                isRequired: false,
                enableCondition: [{ 3: "LITERAL" }]
            },
            {
                id: 5,
                type: "TextField",
                label: "Property Expression",
                defaultValue: "/default/expression",
                isRequired: false,
                enableCondition: [{ 3: "EXPRESSION" }]
            },
            {
                id: 5,
                type: "TextField",
                label: "Value Reference Key",
                defaultValue: "/default/key",
                isRequired: false,
                enableCondition: [{ 3: "REGISTRY_REFERENCE" }]
            },
        ]
    };

    const outputResultConfigs: ParamConfig = {
        paramValues: [],
        paramFields: [
            {
                id: 0,
                type: "Dropdown",
                label: "Result Type",
                defaultValue: "CUSTOM",
                values: ["CUSTOM", "dom", "message", "context", "omelement", "mediator"],
                isRequired: true,
            },
            {
                id: 1,
                type: "TextField",
                label: "Result Custom Type",
                defaultValue: "",
                isRequired: false,
                enableCondition: [{ 0: "CUSTOM" }]
            },
            {
                id: 2,
                type: "TextField",
                label: "Result Name",
                defaultValue: "",
                isRequired: false,
            },
            {
                id: 3,
                type: "Dropdown",
                label: "Value Type",
                defaultValue: "LITERAL",
                isRequired: false,
                values: ["NONE", "LITERAL", "EXPRESSION", "REGISTRY_REFERENCE"]
            },
            {
                id: 4,
                type: "TextField",
                label: "Value Literal",
                defaultValue: "value",
                isRequired: false,
                enableCondition: [{ 3: "LITERAL" }]
            },
            {
                id: 5,
                type: "TextField",
                label: "Property Expression",
                defaultValue: "/default/expression",
                isRequired: false,
                enableCondition: [{ 3: "EXPRESSION" }]
            },
            {
                id: 5,
                type: "TextField",
                label: "Value Reference Key",
                defaultValue: "/default/key",
                isRequired: false,
                enableCondition: [{ 3: "REGISTRY_REFERENCE" }]
            },
        ]
    };

    const [inputFactParams, setInputFactParams] = useState(inputFactsConfigs);
    const [outputResultParams, setOutputResultParams] = useState(outputResultConfigs);

    const handleOnChange = (params: any, setFunc: Function) => {
        const modifiedParams = {
            ...params, paramValues: params.paramValues.map((param: any) => {
                return {
                    ...param,
                    key: param.parameters[0].value,
                    value: generateDisplayValue(param),
                    icon: "query"
                }
            })
        };
        setFunc(modifiedParams);
    };

    useEffect(() => {
        if (sidePanelContext.formValues && Object.keys(sidePanelContext.formValues).length > 0) {
            setFormValues({ ...formValues, ...sidePanelContext.formValues });
            if (sidePanelContext.formValues["facts"] && sidePanelContext.formValues["facts"].length > 0) {
                const paramValues = sidePanelContext.formValues["facts"].map((property: string, index: string) => (
                    {
                        id: index,
                        parameters: [
                            {
                                id: 0,
                                label: "factType",
                                type: "Dropdown",
                                value: property[0],
                                isRequired: false
                            },
                            {
                                id: 1,
                                label: "factCustomType",
                                type: "Dropdown",
                                value: property[1],
                                isRequired: false
                            },
                            {
                                id: 2,
                                label: "factName",
                                type: "TextField",
                                value: property[2],
                                isRequired: true
                            },
                            {
                                id: 3,
                                label: "valueType",
                                type: "Dropdown",
                                value: property[3],
                                isRequired: false
                            },
                            {
                                id: 4,
                                label: "valueLiteral",
                                type: "TextField",
                                value: property[4],
                                isRequired: true
                            },
                            {
                                id: 5,
                                label: "propertyExpression",
                                type: "TextField",
                                value: property[5],
                                isRequired: true
                            },
                            {
                                id: 6,
                                label: "valueReferenceKey",
                                type: "TextField",
                                value: property[6],
                                isRequired: true
                            },
                        ],
                        key: property[2],
                        value: property[3] + " " + property[4] ?? property[5],
                        icon: "query"
                    })
                )
                setInputFactParams({ ...inputFactParams, paramValues: paramValues });
            }
            if (sidePanelContext.formValues["results"] && sidePanelContext.formValues["results"].length > 0) {
                const paramValues = sidePanelContext.formValues["results"].map((property: string, index: string) => (
                    {
                        id: index,
                        parameters: [
                            {
                                id: 0,
                                label: "resultType",
                                type: "Dropdown",
                                value: property[0],
                                isRequired: false
                            },
                            {
                                id: 1,
                                label: "resultCustomType",
                                type: "Dropdown",
                                value: property[1],
                                isRequired: false
                            },
                            {
                                id: 2,
                                label: "resultName",
                                type: "TextField",
                                value: property[2],
                                isRequired: true
                            },
                            {
                                id: 3,
                                label: "valueType",
                                type: "Dropdown",
                                value: property[3],
                                isRequired: false
                            },
                            {
                                id: 4,
                                label: "valueLiteral",
                                type: "TextField",
                                value: property[4],
                                isRequired: true
                            },
                            {
                                id: 5,
                                label: "propertyExpression",
                                type: "TextField",
                                value: property[5],
                                isRequired: true
                            },
                            {
                                id: 6,
                                label: "valueReferenceKey",
                                type: "TextField",
                                value: property[6],
                                isRequired: true
                            },
                        ],
                        key: property[0],
                        value: property[2] + " " + property[3] + " " + property[4],
                        icon: "query"
                    })
                )
                setOutputResultParams({ ...outputResultParams, paramValues: paramValues });
            }
        } else {
            setFormValues({
                "targetAction": "Replace",
                "ruleSetType": "Regular",
                "ruleSetSourceType": "INLINE",
                "ruleSetSourceCode": "<code/>",
                // "factsConfiguration": [] as string[][],
                "facts": [] as string[][],
                "factType": "CUSTOM",
                "valueType": "NONE",
                // "resultsConfiguration": [] as string[][],
                "results": [] as string[][],
                "resultType": "CUSTOM",
                "Properties.valueType": "NONE",
            });
        }
    }, [sidePanelContext.formValues]);

    const onClick = async () => {
        const newErrors = {} as any;
        Object.keys(formValidators).forEach((key) => {
            const error = formValidators[key]();
            if (error) {
                newErrors[key] = (error);
            }
        });
        formValues["facts"] = inputFactParams.paramValues.map(param => param.parameters.slice(0, 7).map(p => p.value));
        inputFactParams.paramValues.forEach(param => {
            param.parameters.slice(0, 11).forEach(p => {
                let key = p.label.toLowerCase().replace(/\s/g, '');
                formValues[key] = p.value;
            });
        });
        formValues["results"] = outputResultParams.paramValues.map(param => param.parameters.slice(0, 7).map(p => p.value));
        outputResultParams.paramValues.forEach(param => {
            param.parameters.slice(0, 11).forEach(p => {
                let key = p.label.toLowerCase().replace(/\s/g, '');
                formValues[key] = p.value;
            });
        });
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
        } else {
            const xml = getXML(MEDIATORS.RULE, formValues);
            rpcClient.getMiDiagramRpcClient().applyEdit({
                documentUri: props.documentUri, range: props.nodePosition, text: xml
            });
            sidePanelContext.setSidePanelState({
                ...sidePanelContext,
                isOpen: false,
                isEditing: false,
                formValues: undefined,
                nodeRange: undefined,
                operationName: undefined
            });
        }
    };

    const formValidators: { [key: string]: (e?: any) => string | undefined } = {
        "sourceValue": (e?: any) => validateField("sourceValue", e, false),
        "sourceXPath": (e?: any) => validateField("sourceXPath", e, false),
        "targetValue": (e?: any) => validateField("targetValue", e, false),
        "targetAction": (e?: any) => validateField("targetAction", e, false),
        "targetXPath": (e?: any) => validateField("targetXPath", e, false),
        "targetResultXPath": (e?: any) => validateField("targetResultXPath", e, false),
        "ruleSetType": (e?: any) => validateField("ruleSetType", e, false),
        "ruleSetSourceType": (e?: any) => validateField("ruleSetSourceType", e, false),
        "ruleSetSourceCode": (e?: any) => validateField("ruleSetSourceCode", e, false),
        "inlineRegistryKey": (e?: any) => validateField("inlineRegistryKey", e, false),
        "ruleSetURL": (e?: any) => validateField("ruleSetURL", e, false),
        "inputWrapperName": (e?: any) => validateField("inputWrapperName", e, false),
        "inputNamespace": (e?: any) => validateField("inputNamespace", e, false),
        "factType": (e?: any) => validateField("factType", e, false),
        "factCustomType": (e?: any) => validateField("factCustomType", e, false),
        "factName": (e?: any) => validateField("factName", e, false),
        "valueType": (e?: any) => validateField("valueType", e, false),
        "valueLiteral": (e?: any) => validateField("valueLiteral", e, false),
        "propertyExpression": (e?: any) => validateField("propertyExpression", e, false),
        "valueReferenceKey": (e?: any) => validateField("valueReferenceKey", e, false),
        "outputWrapperName": (e?: any) => validateField("outputWrapperName", e, false),
        "outputNamespace": (e?: any) => validateField("outputNamespace", e, false),
        "resultType": (e?: any) => validateField("resultType", e, false),
        "resultCustomType": (e?: any) => validateField("resultCustomType", e, false),
        "resultName": (e?: any) => validateField("resultName", e, false),
        "Properties.valueType": (e?: any) => validateField("Properties.valueType", e, false),
        "Properties.valueLiteral": (e?: any) => validateField("Properties.valueLiteral", e, false),
        "Properties.propertyExpression": (e?: any) => validateField("Properties.propertyExpression", e, false),
        "Properties.valueReferenceKey": (e?: any) => validateField("Properties.valueReferenceKey", e, false),
        "description": (e?: any) => validateField("description", e, false),

    };

    const validateField = (id: string, e: any, isRequired: boolean, validation?: "e-mail" | "nameWithoutSpecialCharactors" | "custom", regex?: string): string => {
        const value = e ?? formValues[id];
        const newErrors = { ...errors };
        let error;
        if (isRequired && !value) {
            error = "This field is required";
        } else if (validation === "e-mail" && !value.match(emailRegex)) {
            error = "Invalid e-mail address";
        } else if (validation === "nameWithoutSpecialCharactors" && !value.match(nameWithoutSpecialCharactorsRegex)) {
            error = "Invalid name";
        } else if (validation === "custom" && !value.match(regex)) {
            error = "Invalid input";
        } else {
            delete newErrors[id];
            setErrors(newErrors);
        }
        setErrors({ ...errors, [id]: error });
        return error;
    };

    return (
        <div style={{ padding: "10px" }}>

            <ComponentCard sx={cardStyle} disbaleHoverEffect>
                <h3>Source</h3>

                <Field>
                    <TextField
                        label="Source Value"
                        size={50}
                        placeholder=""
                        value={formValues["sourceValue"]}
                        onChange={(e: any) => {
                            setFormValues({ ...formValues, "sourceValue": e });
                            formValidators["sourceValue"](e);
                        }}
                        required={false}
                    />
                    {errors["sourceValue"] && <Error>{errors["sourceValue"]}</Error>}
                </Field>

                <Field>
                    <TextField
                        label="Source XPath"
                        size={50}
                        placeholder=""
                        value={formValues["sourceXPath"]}
                        onChange={(e: any) => {
                            setFormValues({ ...formValues, "sourceXPath": e });
                            formValidators["sourceXPath"](e);
                        }}
                        required={false}
                    />
                    {errors["sourceXPath"] && <Error>{errors["sourceXPath"]}</Error>}
                </Field>

            </ComponentCard>

            <ComponentCard sx={cardStyle} disbaleHoverEffect>
                <h3>Target</h3>

                <Field>
                    <TextField
                        label="Target Value"
                        size={50}
                        placeholder=""
                        value={formValues["targetValue"]}
                        onChange={(e: any) => {
                            setFormValues({ ...formValues, "targetValue": e });
                            formValidators["targetValue"](e);
                        }}
                        required={false}
                    />
                    {errors["targetValue"] && <Error>{errors["targetValue"]}</Error>}
                </Field>

                <Field>
                    <label>Target Action</label>
                    <AutoComplete items={["Replace", "Child", "Sibiling"]} selectedItem={formValues["targetAction"]} onChange={(e: any) => {
                        setFormValues({ ...formValues, "targetAction": e });
                        formValidators["targetAction"](e);
                    }} />
                    {errors["targetAction"] && <Error>{errors["targetAction"]}</Error>}
                </Field>

                <Field>
                    <TextField
                        label="Target XPath"
                        size={50}
                        placeholder=""
                        value={formValues["targetXPath"]}
                        onChange={(e: any) => {
                            setFormValues({ ...formValues, "targetXPath": e });
                            formValidators["targetXPath"](e);
                        }}
                        required={false}
                    />
                    {errors["targetXPath"] && <Error>{errors["targetXPath"]}</Error>}
                </Field>

                <Field>
                    <TextField
                        label="Target Result XPath"
                        size={50}
                        placeholder=""
                        value={formValues["targetResultXPath"]}
                        onChange={(e: any) => {
                            setFormValues({ ...formValues, "targetResultXPath": e });
                            formValidators["targetResultXPath"](e);
                        }}
                        required={false}
                    />
                    {errors["targetResultXPath"] && <Error>{errors["targetResultXPath"]}</Error>}
                </Field>

            </ComponentCard>

            <ComponentCard sx={cardStyle} disbaleHoverEffect>
                <h3>Rule Set</h3>

                <Field>
                    <label>Rule Set Type</label>
                    <AutoComplete items={["Regular", "Decision Table"]} selectedItem={formValues["ruleSetType"]} onChange={(e: any) => {
                        setFormValues({ ...formValues, "ruleSetType": e });
                        formValidators["ruleSetType"](e);
                    }} />
                    {errors["ruleSetType"] && <Error>{errors["ruleSetType"]}</Error>}
                </Field>

                <Field>
                    <label>Rule Set Source Type</label>
                    <AutoComplete items={["INLINE", "REGISTRY_REFERENCE", "URL"]} selectedItem={formValues["ruleSetSourceType"]} onChange={(e: any) => {
                        setFormValues({ ...formValues, "ruleSetSourceType": e });
                        formValidators["ruleSetSourceType"](e);
                    }} />
                    {errors["ruleSetSourceType"] && <Error>{errors["ruleSetSourceType"]}</Error>}
                </Field>

                {formValues["ruleSetSourceType"] && formValues["ruleSetSourceType"].toLowerCase() == "inline" &&
                    <Field>
                        <TextField
                            label="Rule Set Source Code"
                            size={50}
                            placeholder=""
                            value={formValues["ruleSetSourceCode"]}
                            onChange={(e: any) => {
                                setFormValues({ ...formValues, "ruleSetSourceCode": e });
                                formValidators["ruleSetSourceCode"](e);
                            }}
                            required={false}
                        />
                        {errors["ruleSetSourceCode"] && <Error>{errors["ruleSetSourceCode"]}</Error>}
                    </Field>
                }

                {formValues["ruleSetSourceType"] && formValues["ruleSetSourceType"].toLowerCase() == "registry_reference" &&
                    <Field>
                        <TextField
                            label="Inline Registry Key"
                            size={50}
                            placeholder=""
                            value={formValues["inlineRegistryKey"]}
                            onChange={(e: any) => {
                                setFormValues({ ...formValues, "inlineRegistryKey": e });
                                formValidators["inlineRegistryKey"](e);
                            }}
                            required={false}
                        />
                        {errors["inlineRegistryKey"] && <Error>{errors["inlineRegistryKey"]}</Error>}
                    </Field>
                }

                {formValues["ruleSetSourceType"] && formValues["ruleSetSourceType"].toLowerCase() == "url" &&
                    <Field>
                        <TextField
                            label="Rule Set URL"
                            size={50}
                            placeholder=""
                            value={formValues["ruleSetURL"]}
                            onChange={(e: any) => {
                                setFormValues({ ...formValues, "ruleSetURL": e });
                                formValidators["ruleSetURL"](e);
                            }}
                            required={false}
                        />
                        {errors["ruleSetURL"] && <Error>{errors["ruleSetURL"]}</Error>}
                    </Field>
                }

            </ComponentCard>

            <ComponentCard sx={cardStyle} disbaleHoverEffect>
                <h3>Input Facts</h3>

                <Field>
                    <TextField
                        label="Input Wrapper Name"
                        size={50}
                        placeholder=""
                        value={formValues["inputWrapperName"]}
                        onChange={(e: any) => {
                            setFormValues({ ...formValues, "inputWrapperName": e });
                            formValidators["inputWrapperName"](e);
                        }}
                        required={false}
                    />
                    {errors["inputWrapperName"] && <Error>{errors["inputWrapperName"]}</Error>}
                </Field>

                <Field>
                    <TextField
                        label="Input Namespace"
                        size={50}
                        placeholder=""
                        value={formValues["inputNamespace"]}
                        onChange={(e: any) => {
                            setFormValues({ ...formValues, "inputNamespace": e });
                            formValidators["inputNamespace"](e);
                        }}
                        required={false}
                    />
                    {errors["inputNamespace"] && <Error>{errors["inputNamespace"]}</Error>}
                </Field>

                {formValues["facts"] && (
                    <ParamManager
                        paramConfigs={inputFactParams}
                        readonly={false}
                        onChange={(params: any) => { handleOnChange(params, setInputFactParams) }} />
                )}
            </ComponentCard>
            <ComponentCard sx={cardStyle} disbaleHoverEffect>
                <h3>Output Facts</h3>

                <Field>
                    <TextField
                        label="Output Wrapper Name"
                        size={50}
                        placeholder=""
                        value={formValues["outputWrapperName"]}
                        onChange={(e: any) => {
                            setFormValues({ ...formValues, "outputWrapperName": e });
                            formValidators["outputWrapperName"](e);
                        }}
                        required={false}
                    />
                    {errors["outputWrapperName"] && <Error>{errors["outputWrapperName"]}</Error>}
                </Field>

                <Field>
                    <TextField
                        label="Output Namespace"
                        size={50}
                        placeholder=""
                        value={formValues["outputNamespace"]}
                        onChange={(e: any) => {
                            setFormValues({ ...formValues, "outputNamespace": e });
                            formValidators["outputNamespace"](e);
                        }}
                        required={false}
                    />
                    {errors["outputNamespace"] && <Error>{errors["outputNamespace"]}</Error>}
                </Field>

                {formValues["results"] && (
                    <ParamManager
                        paramConfigs={outputResultParams}
                        readonly={false}
                        onChange={(params: any) => { handleOnChange(params, setOutputResultParams) }} />
                )}
            </ComponentCard>

            <div style={{ textAlign: "right", marginTop: "10px" }}>
                <Button
                    appearance="primary"
                    onClick={onClick}
                >
                    Submit
                </Button>
            </div>

        </div>
    );
};

export default RuleForm; 
