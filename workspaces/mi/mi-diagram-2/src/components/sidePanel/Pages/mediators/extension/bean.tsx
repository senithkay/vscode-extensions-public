/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 * 
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
*/


import React, { useEffect, useState } from 'react';
import { AutoComplete, Button, ComponentCard, TextField } from '@wso2-enterprise/ui-toolkit';
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

const BeanForm = (props: AddMediatorProps) => {
    const { rpcClient } = useVisualizerContext();
    const sidePanelContext = React.useContext(SidePanelContext);
    const [formValues, setFormValues] = useState({} as { [key: string]: any });
    const [errors, setErrors] = useState({} as any);

    useEffect(() => {
        if (sidePanelContext.formValues && Object.keys(sidePanelContext.formValues).length > 0) {
            setFormValues({ ...formValues, ...sidePanelContext.formValues });
        } else {
            setFormValues({
                "action": "CREATE",
                "valueType": "LITERAL",
                "targetType": "LITERAL",
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
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
        } else {
            const keysToInclude: string[] = [];
            if (formValues["action"]) {
                if (formValues["action"].toLowerCase() == "create") {
                    keysToInclude.push(...["action", "class", "var", "description"]);
                } else if (formValues["action"].toLowerCase() == "remove") {
                    keysToInclude.push(...["action", "var", "description"]);
                } else if (formValues["action"].toLowerCase() == "get_property") {
                    keysToInclude.push(...["action", "var", "property", "description"]);
                    keysToInclude.push(formValues["targetType"] == "LITERAL" ? "targetLiteral" : "targetExpression");
                } else if (formValues["action"].toLowerCase() == "set_property") {
                    keysToInclude.push(...["action", "var", "property", "description"])
                    keysToInclude.push(formValues["valueType"] == "LITERAL" ? "valueLiteral" : "valueExpression");
                }
            }

            setFormValues(filterFormValues(formValues, keysToInclude, null));
            const xml = getXML(MEDIATORS.BEAN, formValues);
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
        "action": (e?: any) => validateField("action", e, false),
        "class": (e?: any) => validateField("class", e, false),
        "var": (e?: any) => validateField("var", e, false),
        "property": (e?: any) => validateField("property", e, false),
        "valueType": (e?: any) => validateField("valueType", e, false),
        "valueLiteral": (e?: any) => validateField("valueLiteral", e, false),
        "valueExpression": (e?: any) => validateField("valueExpression", e, false),
        "targetType": (e?: any) => validateField("targetType", e, false),
        "targetLiteral": (e?: any) => validateField("targetLiteral", e, false),
        "targetExpression": (e?: any) => validateField("targetExpression", e, false),
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
        <div style={{
            padding: "10px", overflowY: "auto",
            height: "calc(100vh - 180px)",
            scrollbarWidth: "none"
        }}>

            <ComponentCard sx={cardStyle} disbaleHoverEffect>
                <h3>Properties</h3>

                <Field>
                    <label>Action</label>
                    <AutoComplete items={["CREATE", "REMOVE", "SET_PROPERTY", "GET_PROPERTY"]} value={formValues["action"]} onValueChange={(e: any) => {
                        setFormValues({ ...formValues, "action": e });
                        formValidators["action"](e);
                    }} />
                    {errors["action"] && <Error>{errors["action"]}</Error>}
                </Field>

                {formValues["action"] && formValues["action"].toLowerCase() == "create" &&
                    <Field>
                        <TextField
                            label="Class"
                            size={50}
                            placeholder=""
                            value={formValues["class"]}
                            onTextChange={(e: any) => {
                                setFormValues({ ...formValues, "class": e });
                                formValidators["class"](e);
                            }}
                            required={false}
                        />
                        {errors["class"] && <Error>{errors["class"]}</Error>}
                    </Field>
                }

                <Field>
                    <TextField
                        label="Var"
                        size={50}
                        placeholder=""
                        value={formValues["var"]}
                        onTextChange={(e: any) => {
                            setFormValues({ ...formValues, "var": e });
                            formValidators["var"](e);
                        }}
                        required={false}
                    />
                    {errors["var"] && <Error>{errors["var"]}</Error>}
                </Field>

                {formValues["action"] && formValues["action"].toLowerCase() == "set_property" || formValues["action"] && formValues["action"].toLowerCase() == "get_property" &&
                    <Field>
                        <TextField
                            label="Property"
                            size={50}
                            placeholder=""
                            value={formValues["property"]}
                            onTextChange={(e: any) => {
                                setFormValues({ ...formValues, "property": e });
                                formValidators["property"](e);
                            }}
                            required={false}
                        />
                        {errors["property"] && <Error>{errors["property"]}</Error>}
                    </Field>
                }

                {formValues["action"] && formValues["action"].toLowerCase() == "set_property" &&
                    <ComponentCard sx={cardStyle} disbaleHoverEffect>
                        <h3>Value</h3>

                        <Field>
                            <label>Value Type</label>
                            <AutoComplete items={["LITERAL", "EXPRESSION"]} value={formValues["valueType"]} onValueChange={(e: any) => {
                                setFormValues({ ...formValues, "valueType": e });
                                formValidators["valueType"](e);
                            }} />
                            {errors["valueType"] && <Error>{errors["valueType"]}</Error>}
                        </Field>

                        {formValues["valueType"] && formValues["valueType"].toLowerCase() == "literal" &&
                            <Field>
                                <TextField
                                    label="Value Literal"
                                    size={50}
                                    placeholder=""
                                    value={formValues["valueLiteral"]}
                                    onTextChange={(e: any) => {
                                        setFormValues({ ...formValues, "valueLiteral": e });
                                        formValidators["valueLiteral"](e);
                                    }}
                                    required={false}
                                />
                                {errors["valueLiteral"] && <Error>{errors["valueLiteral"]}</Error>}
                            </Field>
                        }

                        {formValues["valueType"] && formValues["valueType"].toLowerCase() == "expression" &&
                            <Field>
                                <TextField
                                    label="Value Expression"
                                    size={50}
                                    placeholder=""
                                    value={formValues["valueExpression"]}
                                    onTextChange={(e: any) => {
                                        setFormValues({ ...formValues, "valueExpression": e });
                                        formValidators["valueExpression"](e);
                                    }}
                                    required={false}
                                />
                                {errors["valueExpression"] && <Error>{errors["valueExpression"]}</Error>}
                            </Field>
                        }

                    </ComponentCard>
                }

                {formValues["action"] && formValues["action"].toLowerCase() == "get_property" &&
                    <ComponentCard sx={cardStyle} disbaleHoverEffect>
                        <h3>Target</h3>

                        <Field>
                            <label>Target Type</label>
                            <AutoComplete items={["LITERAL", "EXPRESSION"]} value={formValues["targetType"]} onValueChange={(e: any) => {
                                setFormValues({ ...formValues, "targetType": e });
                                formValidators["targetType"](e);
                            }} />
                            {errors["targetType"] && <Error>{errors["targetType"]}</Error>}
                        </Field>

                        {formValues["targetType"] && formValues["targetType"].toLowerCase() == "literal" &&
                            <Field>
                                <TextField
                                    label="Target Literal"
                                    size={50}
                                    placeholder=""
                                    value={formValues["targetLiteral"]}
                                    onTextChange={(e: any) => {
                                        setFormValues({ ...formValues, "targetLiteral": e });
                                        formValidators["targetLiteral"](e);
                                    }}
                                    required={false}
                                />
                                {errors["targetLiteral"] && <Error>{errors["targetLiteral"]}</Error>}
                            </Field>
                        }

                        {formValues["targetType"] && formValues["targetType"].toLowerCase() == "expression" &&
                            <Field>
                                <TextField
                                    label="Target Expression"
                                    size={50}
                                    placeholder=""
                                    value={formValues["targetExpression"]}
                                    onTextChange={(e: any) => {
                                        setFormValues({ ...formValues, "targetExpression": e });
                                        formValidators["targetExpression"](e);
                                    }}
                                    required={false}
                                />
                                {errors["targetExpression"] && <Error>{errors["targetExpression"]}</Error>}
                            </Field>
                        }

                    </ComponentCard>
                }
                <Field>
                    <TextField
                        label="Description"
                        size={50}
                        placeholder=""
                        value={formValues["description"]}
                        onTextChange={(e: any) => {
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

export default BeanForm; 
