/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 * 
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
*/


import React, { useEffect, useState } from 'react';
import { AutoComplete, Button, ComponentCard, ParamConfig, ParamManager, TextField } from '@wso2-enterprise/ui-toolkit';
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
    const value = paramValues.parameters[2].value === "LITERAL" ? paramValues.parameters[3].value : paramValues.parameters[4].value
    const result: string = paramValues.parameters[1].value + " " + value;
    return result.trim();
};

const XQueryForm = (props: AddMediatorProps) => {
    const { rpcClient } = useVisualizerContext();
    const sidePanelContext = React.useContext(SidePanelContext);
    const [formValues, setFormValues] = useState({} as { [key: string]: any });
    const [errors, setErrors] = useState({} as any);

    const paramConfigs: ParamConfig = {
        paramValues: [],
        paramFields: [
            {
                id: 0,
                type: "TextField",
                label: "Variable Name",
                defaultValue: "",
                isRequired: false
            },
            {
                id: 1,
                type: "Dropdown",
                label: "Variable Type",
                defaultValue: "STRING",
                isRequired: false,
                values: ["DOCUMENT", "DOCUMENT_ELEMENT", "ELEMENT", "INT", "INTEGER", "BOOLEAN", "BYTE", "DOUBLE", "SHORT", "LONG", "FLOAT", "STRING"]
            },
            {
                id: 2,
                type: "Dropdown",
                label: "Variable Option",
                defaultValue: "LITERAL",
                isRequired: false,
                values: ["LITERAL", "EXPRESSION"]
            },
            {
                id: 3,
                type: "TextField",
                label: "Variable Literal",
                defaultValue: "",
                isRequired: false,
                enableCondition: [{ 2: "LITERAL" }]
            },
            {
                id: 4,
                type: "TextField",
                label: "Variable Expression",
                defaultValue: "",
                isRequired: false,
                enableCondition: [{ 2: "EXPRESSION" }]
            },
            {
                id: 5,
                type: "TextField",
                label: "Variable Key",
                defaultValue: "",
                isRequired: false
            }]
    };

    const [params, setParams] = useState(paramConfigs);

    const handleOnChange = (params: any) => {
        const modifiedParams = { ...params, paramValues: params.paramValues.map((param: any) => {
            return {
                ...param,
                key: param.parameters[0].value,
                value: generateDisplayValue(param),
                icon: "query"
            }
        })};
        setParams(modifiedParams);
    };

    useEffect(() => {
        if (sidePanelContext.formValues && Object.keys(sidePanelContext.formValues).length > 0) {
            setFormValues({ ...formValues, ...sidePanelContext.formValues });
            if (sidePanelContext.formValues["variables"] && sidePanelContext.formValues["variables"].length > 0) {
                const paramValues = sidePanelContext.formValues["variables"].map((property: string, index: string) => (
                    {
                        id: index,
                        parameters: [
                            {
                                id: 0,
                                label: "variableName",
                                type: "TextField",
                                value: property[0],
                                isRequired: false
                            },
                            {
                                id: 1,
                                label: "variableType",
                                type: "Dropdown",
                                value: property[1],
                                isRequired: true,
                                values: ["DOCUMENT", "DOCUMENT_ELEMENT", "ELEMENT", "INT", "INTEGER", "BOOLEAN", "BYTE", "DOUBLE", "SHORT", "LONG", "FLOAT", "STRING"]
                            },
                            {
                                id: 2,
                                label: "variableOption",
                                type: "Dropdown",
                                value: property[2],
                                isRequired: true,
                                values: ["LITERAL", "EXPRESSION"]
                            },
                            {
                                id: 3,
                                label: "variableLiteral",
                                type: "TextField",
                                value: property[3],
                                isRequired: false
                            },
                            {
                                id: 4,
                                label: "variableExpression",
                                type: "TextField",
                                value: property[4],
                                isRequired: false
                            },
                            {
                                id: 5,
                                label: "variableKey",
                                type: "TextField",
                                value: property[5],
                                isRequired: false
                            }
                        ],
                        key: property[0],
                        value: property[1] + " " + property[2] === "LITERAL" ? property[3] : property[4],
                        icon: "query"
                    })
                )
                setParams({ ...params, paramValues: paramValues });
            }
        } else {
            setFormValues({
                "scriptKeyType": "Static",
                "variables": [] as string[][],
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
        formValues["variables"] = params.paramValues.map(param => param.parameters.slice(0, 6).map(p => p.value));
        params.paramValues.forEach(param => {
            param.parameters.slice(0, 6).forEach(p => {
                let key = p.label.toLowerCase().replace(/\s/g, '');
                formValues[key] = p.value;
            });
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
        } else {
            const xml = getXML(MEDIATORS.XQUERY, formValues);
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
        "scriptKeyType": (e?: any) => validateField("scriptKeyType", e, false),
        "staticScriptKey": (e?: any) => validateField("staticScriptKey", e, false),
        "dynamicScriptKey": (e?: any) => validateField("dynamicScriptKey", e, false),
        "targetXPath": (e?: any) => validateField("targetXPath", e, false),
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
                <h3>Properties</h3>

                <Field>
                    <label>Script Key Type</label>
                    <AutoComplete items={["Static", "Dynamic"]} selectedItem={formValues["scriptKeyType"]} onChange={(e: any) => {
                        setFormValues({ ...formValues, "scriptKeyType": e });
                        formValidators["scriptKeyType"](e);
                    }} />
                    {errors["scriptKeyType"] && <Error>{errors["scriptKeyType"]}</Error>}
                </Field>

                {formValues["scriptKeyType"] && formValues["scriptKeyType"].toLowerCase() == "static" &&
                    <Field>
                        <TextField
                            label="Static Script Key"
                            size={50}
                            placeholder=""
                            value={formValues["staticScriptKey"]}
                            onChange={(e: any) => {
                                setFormValues({ ...formValues, "staticScriptKey": e });
                                formValidators["staticScriptKey"](e);
                            }}
                            required={false}
                        />
                        {errors["staticScriptKey"] && <Error>{errors["staticScriptKey"]}</Error>}
                    </Field>
                }

                {formValues["scriptKeyType"] && formValues["scriptKeyType"].toLowerCase() == "dynamic" &&
                    <Field>
                        <TextField
                            label="Dynamic Script Key"
                            size={50}
                            placeholder=""
                            value={formValues["dynamicScriptKey"]}
                            onChange={(e: any) => {
                                setFormValues({ ...formValues, "dynamicScriptKey": e });
                                formValidators["dynamicScriptKey"](e);
                            }}
                            required={false}
                        />
                        {errors["dynamicScriptKey"] && <Error>{errors["dynamicScriptKey"]}</Error>}
                    </Field>
                }

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

                <ComponentCard sx={cardStyle} disbaleHoverEffect>
                    <h3>Variables</h3>

                    <ComponentCard sx={cardStyle} disbaleHoverEffect>
                        <h3>Variables</h3>

                        {formValues["variables"] && (
                            <ParamManager
                                paramConfigs={params}
                                readonly={false}
                                onChange={handleOnChange} />
                        )}
                    </ComponentCard>
                </ComponentCard>

                <Field>
                    <TextField
                        label="Description"
                        size={50}
                        placeholder=""
                        value={formValues["description"]}
                        onChange={(e: any) => {
                            setFormValues({ ...formValues, "description": e });
                            formValidators["description"](e);
                        }}
                        required={false}
                    />
                    {errors["description"] && <Error>{errors["description"]}</Error>}
                </Field>

            </ComponentCard>


            <div style={{ display: "flex", textAlign: "right", justifyContent: "flex-end", marginTop: "10px" }}>
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

export default XQueryForm; 
