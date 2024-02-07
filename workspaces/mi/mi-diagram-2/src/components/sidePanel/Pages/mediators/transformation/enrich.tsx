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

const EnrichForm = (props: AddMediatorProps) => {
   const { rpcClient } = useVisualizerContext();
   const sidePanelContext = React.useContext(SidePanelContext);
   const [formValues, setFormValues] = useState({} as { [key: string]: any });
   const [errors, setErrors] = useState({} as any);

   useEffect(() => {
       if (sidePanelContext.formValues) {
           setFormValues({ ...formValues, ...sidePanelContext.formValues });
       } else {
           setFormValues({
       "cloneSource": false,
       "sourceType": "custom",
       "inlineType": "Inline XML/JSON",
       "targetAction": "replace",
       "targetType": "custom",});
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
           const xml = getXML(MEDIATORS.ENRICH, formValues);
           rpcClient.getMiDiagramRpcClient().applyEdit({
               documentUri: props.documentUri, range: props.nodePosition, text: xml
           });
           sidePanelContext.setIsOpen(false);
           sidePanelContext.setFormValues(undefined);
           sidePanelContext.setNodeRange(undefined);
           sidePanelContext.setOperationName(undefined);
       }
   };

   const formValidators: { [key: string]: (e?: any) => string | undefined } = {
       "cloneSource": (e?: any) => validateField("cloneSource", e, false),
       "sourceType": (e?: any) => validateField("sourceType", e, false),
       "sourceXPath": (e?: any) => validateField("sourceXPath", e, false),
       "sourceProperty": (e?: any) => validateField("sourceProperty", e, false),
       "inlineType": (e?: any) => validateField("inlineType", e, false),
       "sourceXML": (e?: any) => validateField("sourceXML", e, false),
       "targetAction": (e?: any) => validateField("targetAction", e, false),
       "targetType": (e?: any) => validateField("targetType", e, false),
       "targetXPathJsonPath": (e?: any) => validateField("targetXPathJsonPath", e, false),
       "targetProperty": (e?: any) => validateField("targetProperty", e, false),
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
                    <VSCodeCheckbox type="checkbox" checked={formValues["cloneSource"]} onChange={(e: any) => {
                        setFormValues({ ...formValues, "cloneSource": e.target.checked });
                        formValidators["cloneSource"](e);
                    }
                    }>Clone Source </VSCodeCheckbox>
                    {errors["cloneSource"] && <Error>{errors["cloneSource"]}</Error>}
                </Field>

                <Field>
                    <label>Source Type</label>
                    <AutoComplete items={["custom", "envelope", "body", "property", "inline"]} selectedItem={formValues["sourceType"]} onChange={(e: any) => {
                        setFormValues({ ...formValues, "sourceType": e });
                        formValidators["sourceType"](e);
                    }} />
                    {errors["sourceType"] && <Error>{errors["sourceType"]}</Error>}
                </Field>

                {formValues["sourceType"] && formValues["sourceType"].toLowerCase() == "custom" &&
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
                }

                {formValues["sourceType"] && formValues["sourceType"].toLowerCase() == "property" &&
                    <Field>
                        <TextField
                            label="Source Property"
                            size={50}
                            placeholder=""
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

                {formValues["sourceType"] && formValues["sourceType"].toLowerCase() == "inline" &&
                    <Field>
                        <label>Inline Type</label>
                        <AutoComplete items={["Inline XML/JSON", "RegistryKey"]} selectedItem={formValues["inlineType"]} onChange={(e: any) => {
                            setFormValues({ ...formValues, "inlineType": e });
                            formValidators["inlineType"](e);
                        }} />
                        {errors["inlineType"] && <Error>{errors["inlineType"]}</Error>}
                    </Field>
                }

                {formValues["sourceType"] && formValues["sourceType"].toLowerCase() == "inline" &&
                    <Field>
                    </Field>
                }

            </ComponentCard>

            <ComponentCard sx={cardStyle} disbaleHoverEffect>
                <h3>Target</h3>

                <Field>
                    <label>Target Action</label>
                    <AutoComplete items={["replace", "child", "sibling", "remove"]} selectedItem={formValues["targetAction"]} onChange={(e: any) => {
                        setFormValues({ ...formValues, "targetAction": e });
                        formValidators["targetAction"](e);
                    }} />
                    {errors["targetAction"] && <Error>{errors["targetAction"]}</Error>}
                </Field>

                <Field>
                    <label>Target Type</label>
                    <AutoComplete items={["custom", "body", "property", "envelope", "key"]} selectedItem={formValues["targetType"]} onChange={(e: any) => {
                        setFormValues({ ...formValues, "targetType": e });
                        formValidators["targetType"](e);
                    }} />
                    {errors["targetType"] && <Error>{errors["targetType"]}</Error>}
                </Field>

                {formValues["targetType"] && formValues["targetType"].toLowerCase() == "custom" ||formValues["targetType"] && formValues["targetType"].toLowerCase() == "key" &&
                    <Field>
                        <TextField
                            label="Target XPath / JSONPath"
                            size={50}
                            placeholder=""
                            value={formValues["targetXPathJsonPath"]}
                            onChange={(e: any) => {
                                setFormValues({ ...formValues, "targetXPathJsonPath": e });
                                formValidators["targetXPathJsonPath"](e);
                            }}
                            required={false}
                        />
                        {errors["targetXPathJsonPath"] && <Error>{errors["targetXPathJsonPath"]}</Error>}
                    </Field>
                }

                {formValues["targetType"] && formValues["targetType"].toLowerCase() == "property" &&
                    <Field>
                        <TextField
                            label="Target Property"
                            size={50}
                            placeholder=""
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

            </ComponentCard>

            <ComponentCard sx={cardStyle} disbaleHoverEffect>
                <h3>Misc</h3>

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

export default EnrichForm; 
