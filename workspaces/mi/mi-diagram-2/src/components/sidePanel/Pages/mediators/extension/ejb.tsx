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
import { VSCodeCheckbox } from '@vscode/webview-ui-toolkit/react';
import styled from '@emotion/styled';
import SidePanelContext from '../../../SidePanelContexProvider';
import { AddMediatorProps, filterFormValues } from '../common';
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
    const result: string = paramValues.parameters[1].value === "LITERAL" ? paramValues.parameters[2].value : paramValues.parameters[3].value;
    return result.trim();
};

const EJBForm = (props: AddMediatorProps) => {
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
                label: "Property Name",
                defaultValue: "",
                isRequired: false
            },
            {
                id: 1,
                type: "Dropdown",
                label: "Property Value Type",
                defaultValue: "LITERAL",
                isRequired: false,
                values: ["LITERAL", "EXPRESSION"]
            },
            {
                id: 2,
                type: "TextField",
                label: "Property Value",
                defaultValue: "",
                isRequired: false,
                enableCondition: [{ 1: "LITERAL" }]
            },
            {
                id: 3,
                type: "TextField",
                label: "Property Expression",
                defaultValue: "",
                isRequired: false,
                enableCondition: [{ 1: "EXPRESSION" }]
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
            if (sidePanelContext.formValues["methodArguments"] == undefined) {
                sidePanelContext.formValues["methodArguments"] = [];
            }
            setFormValues({ ...formValues, ...sidePanelContext.formValues });
            if (sidePanelContext.formValues["methodArguments"] && sidePanelContext.formValues["methodArguments"].length > 0) {
                const paramValues = sidePanelContext.formValues["methodArguments"].map((property: string, index: string) => (
                    {
                        id: index,
                        parameters: [
                            {
                                id: 0,
                                label: "propertyName",
                                type: "TextField",
                                value: property[0],
                                isRequired: false
                            },
                            {
                                id: 1,
                                label: "propertyValueType",
                                type: "Dropdown",
                                value: property[1],
                                isRequired: false,
                                values: ["LITERAL", "EXPRESSION"]
                            },
                            {
                                id: 2,
                                label: "propertyValue",
                                type: "TextField",
                                value: property[2],
                                isRequired: false
                            },
                            {
                                id: 3,
                                label: "propertyExpression",
                                type: "TextField",
                                value: property[3],
                                isRequired: false
                            }
                        ],
                        key: property[0],
                        value: property[1] === "LITERAL" ? property[2] : property[3],
                        icon: "query"
                    })
                )
                setParams({ ...params, paramValues: paramValues });
            }
        } else {
            setFormValues({
                "remove": false,
                "methodArguments": [] as string[][],
                "sessionIdType": "LITERAL",
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
        formValues["methodArguments"] = params.paramValues.map(param => param.parameters.slice(0, 4).map(p => p.value));
        params.paramValues.forEach(param => {
            param.parameters.slice(0, 4).forEach(p => {
                let key = p.label.toLowerCase().replace(/\s/g, '');
                formValues[key] = p.value;
            });
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
        } else {
                const keysToExclude = [formValues["sessionIdType"] == "EXPRESSION" ? "sessionIdLiteral" : "sessionIdExpression"];
                setFormValues(filterFormValues(formValues, null, keysToExclude));

            const xml = getXML(MEDIATORS.EJB, formValues);
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
        "beanstalk": (e?: any) => validateField("beanstalk", e, false),
        "class": (e?: any) => validateField("class", e, false),
        "method": (e?: any) => validateField("method", e, false),
        "remove": (e?: any) => validateField("remove", e, false),
        "target": (e?: any) => validateField("target", e, false),
        "jndiName": (e?: any) => validateField("jndiName", e, false),
        "sessionIdType": (e?: any) => validateField("sessionIdType", e, false),
        "sessionIdLiteral": (e?: any) => validateField("sessionIdLiteral", e, false),
        "sessionIdExpression": (e?: any) => validateField("sessionIdExpression", e, false),
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

            <Field>
                <TextField
                    label="Beanstalk"
                    size={50}
                    placeholder=""
                    value={formValues["beanstalk"]}
                    onChange={(e: any) => {
                        setFormValues({ ...formValues, "beanstalk": e });
                        formValidators["beanstalk"](e);
                    }}
                    required={false}
                />
                {errors["beanstalk"] && <Error>{errors["beanstalk"]}</Error>}
            </Field>

            <Field>
                <TextField
                    label="Class"
                    size={50}
                    placeholder=""
                    value={formValues["class"]}
                    onChange={(e: any) => {
                        setFormValues({ ...formValues, "class": e });
                        formValidators["class"](e);
                    }}
                    required={false}
                />
                {errors["class"] && <Error>{errors["class"]}</Error>}
            </Field>

            <Field>
                <TextField
                    label="Method"
                    size={50}
                    placeholder=""
                    value={formValues["method"]}
                    onChange={(e: any) => {
                        setFormValues({ ...formValues, "method": e });
                        formValidators["method"](e);
                    }}
                    required={false}
                />
                {errors["method"] && <Error>{errors["method"]}</Error>}
            </Field>

            <Field>
                <VSCodeCheckbox type="checkbox" checked={formValues["remove"]} onChange={(e: any) => {
                    setFormValues({ ...formValues, "remove": e.target.checked });
                    formValidators["remove"](e);
                }
                }>Remove </VSCodeCheckbox>
                {errors["remove"] && <Error>{errors["remove"]}</Error>}
            </Field>

            <Field>
                <TextField
                    label="Target"
                    size={50}
                    placeholder=""
                    value={formValues["target"]}
                    onChange={(e: any) => {
                        setFormValues({ ...formValues, "target": e });
                        formValidators["target"](e);
                    }}
                    required={false}
                />
                {errors["target"] && <Error>{errors["target"]}</Error>}
            </Field>

            <Field>
                <TextField
                    label="JNDI Name"
                    size={50}
                    placeholder=""
                    value={formValues["jndiName"]}
                    onChange={(e: any) => {
                        setFormValues({ ...formValues, "jndiName": e });
                        formValidators["jndiName"](e);
                    }}
                    required={false}
                />
                {errors["jndiName"] && <Error>{errors["jndiName"]}</Error>}
            </Field>

            <ComponentCard sx={cardStyle} disbaleHoverEffect>
                <h3>Method Arguments</h3>

            {formValues["methodArguments"] && (
                <ParamManager
                    paramConfigs={params}
                    readonly={false}
                    onChange= {handleOnChange} />
            )}
            </ComponentCard>
            <ComponentCard sx={cardStyle} disbaleHoverEffect>
                <h3>Session</h3>

                <Field>
                    <label>Session Id Type</label>
                    <AutoComplete items={["LITERAL", "EXPRESSION"]} value={formValues["sessionIdType"]} onValueChange={(e: any) => {
                        setFormValues({ ...formValues, "sessionIdType": e });
                        formValidators["sessionIdType"](e);
                    }} />
                    {errors["sessionIdType"] && <Error>{errors["sessionIdType"]}</Error>}
                </Field>

                {formValues["sessionIdType"] && formValues["sessionIdType"].toLowerCase() == "literal" &&
                    <Field>
                        <TextField
                            label="Session Id Literal"
                            size={50}
                            placeholder=""
                            value={formValues["sessionIdLiteral"]}
                            onChange={(e: any) => {
                                setFormValues({ ...formValues, "sessionIdLiteral": e });
                                formValidators["sessionIdLiteral"](e);
                            }}
                            required={false}
                        />
                        {errors["sessionIdLiteral"] && <Error>{errors["sessionIdLiteral"]}</Error>}
                    </Field>
                }

                {formValues["sessionIdType"] && formValues["sessionIdType"].toLowerCase() == "expression" &&
                    <Field>
                        <TextField
                            label="Session Id Expression"
                            size={50}
                            placeholder=""
                            value={formValues["sessionIdExpression"]}
                            onChange={(e: any) => {
                                setFormValues({ ...formValues, "sessionIdExpression": e });
                                formValidators["sessionIdExpression"](e);
                            }}
                            required={false}
                        />
                        {errors["sessionIdExpression"] && <Error>{errors["sessionIdExpression"]}</Error>}
                    </Field>
                }

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

export default EJBForm; 
