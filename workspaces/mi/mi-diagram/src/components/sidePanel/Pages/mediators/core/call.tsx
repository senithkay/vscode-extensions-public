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
import { VSCodeCheckbox } from '@vscode/webview-ui-toolkit/react';
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

const CallForm = (props: AddMediatorProps) => {
   const sidePanelContext = React.useContext(SidePanelContext);
   const [formValues, setFormValues] = useState({} as { [key: string]: any });
   const [errors, setErrors] = useState({} as any);

   useEffect(() => {
       if (sidePanelContext.formValues) {
           setFormValues({ ...formValues, ...sidePanelContext.formValues });
       } else {
           setFormValues({
       "enableBlockingCalls": false,
       "initAxis2ClientOptions": false,
       "endpointType": "INLINE",
       "sourceType": "none",
       "targetType": "body",});
       }
   }, [sidePanelContext.formValues]);

   const onClick = async () => {
       let newErrors = {} as any;
       Object.keys(formValidators).forEach((key) => {
           const error = formValidators[key]();
           if (error) {
               newErrors[key] = (error);
           }
       });
       if (Object.keys(newErrors).length > 0) {
           setErrors(newErrors);
       } else {
           const xml = getXML(MEDIATORS.CALL, formValues);
           MIWebViewAPI.getInstance().applyEdit({
               documentUri: props.documentUri, range: props.nodePosition, text: xml
           });
           sidePanelContext.setIsOpen(false);
           sidePanelContext.setFormValues(undefined);
           sidePanelContext.setNodeRange(undefined);
           sidePanelContext.setOperationName(undefined);
       }
   };

   const formValidators: { [key: string]: (e?: any) => string | undefined } = {
       "enableBlockingCalls": (e?: any) => validateField("enableBlockingCalls", e, false),
       "initAxis2ClientOptions": (e?: any) => validateField("initAxis2ClientOptions", e, false),
       "endpointType": (e?: any) => validateField("endpointType", e, false),
       "endpointRegistryKey": (e?: any) => validateField("endpointRegistryKey", e, false),
       "endpointXpath": (e?: any) => validateField("endpointXpath", e, false),
       "sourceType": (e?: any) => validateField("sourceType", e, false),
       "sourceProperty": (e?: any) => validateField("sourceProperty", e, false),
       "contentType": (e?: any) => validateField("contentType", e, false),
       "sourceendpointType": (e?: any) => validateField("sourceendpointType", e, false),
       "sourceXPath": (e?: any) => validateField("sourceXPath", e, false),
       "targetType": (e?: any) => validateField("targetType", e, false),
       "targetProperty": (e?: any) => validateField("targetProperty", e, false),
       "description": (e?: any) => validateField("description", e, false),

   };

   const validateField = (id: string, e: any, isRequired: boolean, validation?: "e-mail" | "nameWithoutSpecialCharactors" | "custom", regex?: string): string => {
       const value = e ?? formValues[id];
       let newErrors = { ...errors };
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
                    <VSCodeCheckbox type="checkbox" checked={formValues["enableBlockingCalls"]} onChange={(e: any) => {
                        setFormValues({ ...formValues, "enableBlockingCalls": e.target.checked });
                        formValidators["enableBlockingCalls"](e);
                    }
                    }>Enable Blocking Calls </VSCodeCheckbox>
                    {errors["enableBlockingCalls"] && <Error>{errors["enableBlockingCalls"]}</Error>}
                </Field>

                <Field>
                    <VSCodeCheckbox type="checkbox" checked={formValues["initAxis2ClientOptions"]} onChange={(e: any) => {
                        setFormValues({ ...formValues, "initAxis2ClientOptions": e.target.checked });
                        formValidators["initAxis2ClientOptions"](e);
                    }
                    }>Initialize Axis2 Client Options </VSCodeCheckbox>
                    {errors["initAxis2ClientOptions"] && <Error>{errors["initAxis2ClientOptions"]}</Error>}
                </Field>

                <ComponentCard sx={cardStyle} disbaleHoverEffect>
                    <h3>EndpointType</h3>

                    <Field>
                        <label>Endpoint Type</label>
                        <AutoComplete items={["INLINE", "NONE", "REGISTRYKEY", "XPATH"]} selectedItem={formValues["endpointType"]} onChange={(e: any) => {
                            setFormValues({ ...formValues, "endpointType": e });
                            formValidators["endpointType"](e);
                        }} />
                        {errors["endpointType"] && <Error>{errors["endpointType"]}</Error>}
                    </Field>

                    {formValues["endpointType"] && formValues["endpointType"].toLowerCase() == "registrykey" &&
                        <Field>
                            <TextField
                                label="Endpoint Registry Key"
                                size={50}
                                placeholder="Endpoint Registry Key"
                                value={formValues["endpointRegistryKey"]}
                                onChange={(e: any) => {
                                    setFormValues({ ...formValues, "endpointRegistryKey": e });
                                    formValidators["endpointRegistryKey"](e);
                                }}
                                required={false}
                            />
                            {errors["endpointRegistryKey"] && <Error>{errors["endpointRegistryKey"]}</Error>}
                        </Field>
                    }

                    {formValues["endpointType"] && formValues["endpointType"].toLowerCase() == "xpath" &&
                        <Field>
                            <TextField
                                label="Endpoint Xpath"
                                size={50}
                                placeholder="Endpoint Xpath"
                                value={formValues["endpointXpath"]}
                                onChange={(e: any) => {
                                    setFormValues({ ...formValues, "endpointXpath": e });
                                    formValidators["endpointXpath"](e);
                                }}
                                required={false}
                            />
                            {errors["endpointXpath"] && <Error>{errors["endpointXpath"]}</Error>}
                        </Field>
                    }

                </ComponentCard>

                <Field>
                    <label>Source Type</label>
                    <AutoComplete items={["none", "body", "property", "inline", "custom"]} selectedItem={formValues["sourceType"]} onChange={(e: any) => {
                        setFormValues({ ...formValues, "sourceType": e });
                        formValidators["sourceType"](e);
                    }} />
                    {errors["sourceType"] && <Error>{errors["sourceType"]}</Error>}
                </Field>

                {formValues["sourceType"] && formValues["sourceType"].toLowerCase() == "property" &&
                    <Field>
                        <TextField
                            label="Source Property"
                            size={50}
                            placeholder="Source Property"
                            value={formValues["sourceProperty"]}
                            onChange={(e: any) => {
                                setFormValues({ ...formValues, "sourceProperty": e });
                                formValidators["sourceProperty"](e);
                            }}
                            required={false}
                        />
                        {errors["sourceProperty"] && <Error>{errors["sourceProperty"]}</Error>}
                    </Field>
                }

                {formValues["sourceType"] && formValues["sourceType"].toLowerCase() == "property" ||formValues["sourceType"] && formValues["sourceType"].toLowerCase() == "inline" ||formValues["sourceType"] && formValues["sourceType"].toLowerCase() == "custom" &&
                    <Field>
                        <TextField
                            label="Content Type"
                            size={50}
                            placeholder="Content Type"
                            value={formValues["contentType"]}
                            onChange={(e: any) => {
                                setFormValues({ ...formValues, "contentType": e });
                                formValidators["contentType"](e);
                            }}
                            required={false}
                        />
                        {errors["contentType"] && <Error>{errors["contentType"]}</Error>}
                    </Field>
                }

                {formValues["sourceType"] && formValues["sourceType"].toLowerCase() == "inline" &&
                    <Field>
                        <TextField
                            label="Source endpointType"
                            size={50}
                            placeholder="Source endpointType"
                            value={formValues["sourceendpointType"]}
                            onChange={(e: any) => {
                                setFormValues({ ...formValues, "sourceendpointType": e });
                                formValidators["sourceendpointType"](e);
                            }}
                            required={false}
                        />
                        {errors["sourceendpointType"] && <Error>{errors["sourceendpointType"]}</Error>}
                    </Field>
                }

                <Field>
                    <TextField
                        label="Source XPath"
                        size={50}
                        placeholder="Source XPath"
                        value={formValues["sourceXPath"]}
                        onChange={(e: any) => {
                            setFormValues({ ...formValues, "sourceXPath": e });
                            formValidators["sourceXPath"](e);
                        }}
                        required={false}
                    />
                    {errors["sourceXPath"] && <Error>{errors["sourceXPath"]}</Error>}
                </Field>

                <Field>
                    <label>Target Type</label>
                    <AutoComplete items={["body", "property"]} selectedItem={formValues["targetType"]} onChange={(e: any) => {
                        setFormValues({ ...formValues, "targetType": e });
                        formValidators["targetType"](e);
                    }} />
                    {errors["targetType"] && <Error>{errors["targetType"]}</Error>}
                </Field>

                {formValues["targetType"] && formValues["targetType"].toLowerCase() == "property" &&
                    <Field>
                        <TextField
                            label="Target Property"
                            size={50}
                            placeholder="Target Property"
                            value={formValues["targetProperty"]}
                            onChange={(e: any) => {
                                setFormValues({ ...formValues, "targetProperty": e });
                                formValidators["targetProperty"](e);
                            }}
                            required={false}
                        />
                        {errors["targetProperty"] && <Error>{errors["targetProperty"]}</Error>}
                    </Field>
                }

                <Field>
                    <TextField
                        label="Description"
                        size={50}
                        placeholder="Description"
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

export default CallForm; 
