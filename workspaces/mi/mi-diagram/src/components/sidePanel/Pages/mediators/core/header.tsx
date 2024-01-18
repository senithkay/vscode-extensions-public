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
import { AddMediatorProps } from '../common';
import { MIWebViewAPI } from '../../../../../utils/WebViewRpc';
import { getXML } from '../../../../../utils/template-engine/mustach-templates/templateUtils';
import { MEDIATORS } from '../../../../../constants';

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

const HeaderForm = (props: AddMediatorProps) => {
   const sidePanelContext = React.useContext(SidePanelContext);
   const [formValues, setFormValues] = useState({} as { [key: string]: any });
   const [errors, setErrors] = useState({} as any);

   useEffect(() => {
       if (sidePanelContext.formValues) {
           setFormValues({ ...formValues, ...sidePanelContext.formValues });
       } else {
           setFormValues({
       "headerName": "To",
       "headerAction": "set",
       "scope": "default",
       "valueType": "LITERAL",});
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
           const xml = getXML(MEDIATORS.HEADER, formValues);
           MIWebViewAPI.getInstance().applyEdit({
               documentUri: props.documentUri, range: props.nodePosition, text: xml
           });
           sidePanelContext.setIsOpen(false);
           sidePanelContext.setFormValues(undefined);
           sidePanelContext.setNodeRange(undefined);
           sidePanelContext.setMediator(undefined);
       }
   };

   const formValidators: { [key: string]: (e?: any) => string | undefined } = {
       "headerName": (e?: any) => validateField("headerName", e, false),
       "headerAction": (e?: any) => validateField("headerAction", e, false),
       "scope": (e?: any) => validateField("scope", e, false),
       "valueType": (e?: any) => validateField("valueType", e, false),
       "valueLiteral": (e?: any) => validateField("valueLiteral", e, false),
       "valueExpression": (e?: any) => validateField("valueExpression", e, false),
       "valueInline": (e?: any) => validateField("valueInline", e, false),
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
                    <TextField
                        label="Header Name"
                        size={50}
                        placeholder=""
                        value={formValues["headerName"]}
                        onChange={(e: any) => {
                            setFormValues({ ...formValues, "headerName": e });
                            formValidators["headerName"](e);
                        }}
                        required={false}
                    />
                    {errors["headerName"] && <Error>{errors["headerName"]}</Error>}
                </Field>

                <Field>
                    <label>Header Action</label>
                    <AutoComplete items={["set", "remove"]} selectedItem={formValues["headerAction"]} onChange={(e: any) => {
                        setFormValues({ ...formValues, "headerAction": e });
                        formValidators["headerAction"](e);
                    }} />
                    {errors["headerAction"] && <Error>{errors["headerAction"]}</Error>}
                </Field>

                <Field>
                    <label>Scope</label>
                    <AutoComplete items={["default", "transport"]} selectedItem={formValues["scope"]} onChange={(e: any) => {
                        setFormValues({ ...formValues, "scope": e });
                        formValidators["scope"](e);
                    }} />
                    {errors["scope"] && <Error>{errors["scope"]}</Error>}
                </Field>

                {formValues["headerAction"] && formValues["headerAction"].toLowerCase() == "set" &&
                    <ComponentCard sx={cardStyle} disbaleHoverEffect>
                        <h3>HeaderValue</h3>

                        <Field>
                            <label>Value Type</label>
                            <AutoComplete items={["LITERAL", "EXPRESSION", "INLINE"]} selectedItem={formValues["valueType"]} onChange={(e: any) => {
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
                                    onChange={(e: any) => {
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
                                    onChange={(e: any) => {
                                        setFormValues({ ...formValues, "valueExpression": e });
                                        formValidators["valueExpression"](e);
                                    }}
                                    required={false}
                                />
                                {errors["valueExpression"] && <Error>{errors["valueExpression"]}</Error>}
                            </Field>
                        }

                        {formValues["valueType"] && formValues["valueType"].toLowerCase() == "inline" &&
                            <Field>
                                <TextField
                                    label="Value Inline"
                                    size={50}
                                    placeholder=""
                                    value={formValues["valueInline"]}
                                    onChange={(e: any) => {
                                        setFormValues({ ...formValues, "valueInline": e });
                                        formValidators["valueInline"](e);
                                    }}
                                    required={false}
                                />
                                {errors["valueInline"] && <Error>{errors["valueInline"]}</Error>}
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
                        onChange={(e: any) => {
                            setFormValues({ ...formValues, "description": e });
                            formValidators["description"](e);
                        }}
                        required={false}
                    />
                    {errors["description"] && <Error>{errors["description"]}</Error>}
                </Field>

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

export default HeaderForm; 
