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

const DataMapperForm = (props: AddMediatorProps) => {
   const sidePanelContext = React.useContext(SidePanelContext);
   const [formValues, setFormValues] = useState({} as { [key: string]: any });
   const [errors, setErrors] = useState({} as any);

   useEffect(() => {
       if (sidePanelContext.formValues) {
           setFormValues({ ...formValues, ...sidePanelContext.formValues });
       } else {
           setFormValues({
       "inputType": "XML",
       "outputType": "XML",});
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
           const xml = getXML(MEDIATORS.DATAMAPPER, formValues);
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
       "description": (e?: any) => validateField("description", e, false),
       "configurationLocalPath": (e?: any) => validateField("configurationLocalPath", e, false),
       "inputType": (e?: any) => validateField("inputType", e, false),
       "inputSchemaLocalPath": (e?: any) => validateField("inputSchemaLocalPath", e, false),
       "outputType": (e?: any) => validateField("outputType", e, false),
       "outputSchemaLocalPath": (e?: any) => validateField("outputSchemaLocalPath", e, false),

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

                <Field>
                    <TextField
                        label="Configuration Local Path"
                        size={50}
                        placeholder=""
                        value={formValues["configurationLocalPath"]}
                        onChange={(e: any) => {
                            setFormValues({ ...formValues, "configurationLocalPath": e });
                            formValidators["configurationLocalPath"](e);
                        }}
                        required={false}
                    />
                    {errors["configurationLocalPath"] && <Error>{errors["configurationLocalPath"]}</Error>}
                </Field>

                <ComponentCard sx={cardStyle} disbaleHoverEffect>
                    <h3>InputType</h3>

                    <Field>
                        <label>Input Type</label>
                        <AutoComplete items={["XML", "CSV", "JSON"]} selectedItem={formValues["inputType"]} onChange={(e: any) => {
                            setFormValues({ ...formValues, "inputType": e });
                            formValidators["inputType"](e);
                        }} />
                        {errors["inputType"] && <Error>{errors["inputType"]}</Error>}
                    </Field>

                    <Field>
                        <TextField
                            label="InputSchema Local Path"
                            size={50}
                            placeholder=""
                            value={formValues["inputSchemaLocalPath"]}
                            onChange={(e: any) => {
                                setFormValues({ ...formValues, "inputSchemaLocalPath": e });
                                formValidators["inputSchemaLocalPath"](e);
                            }}
                            required={false}
                        />
                        {errors["inputSchemaLocalPath"] && <Error>{errors["inputSchemaLocalPath"]}</Error>}
                    </Field>

                </ComponentCard>

                <ComponentCard sx={cardStyle} disbaleHoverEffect>
                    <h3>OutputType</h3>

                    <Field>
                        <label>Output Type</label>
                        <AutoComplete items={["XML", "CSV", "JSON"]} selectedItem={formValues["outputType"]} onChange={(e: any) => {
                            setFormValues({ ...formValues, "outputType": e });
                            formValidators["outputType"](e);
                        }} />
                        {errors["outputType"] && <Error>{errors["outputType"]}</Error>}
                    </Field>

                    <Field>
                        <TextField
                            label="OutputSchema Local Path"
                            size={50}
                            placeholder=""
                            value={formValues["outputSchemaLocalPath"]}
                            onChange={(e: any) => {
                                setFormValues({ ...formValues, "outputSchemaLocalPath": e });
                                formValidators["outputSchemaLocalPath"](e);
                            }}
                            required={false}
                        />
                        {errors["outputSchemaLocalPath"] && <Error>{errors["outputSchemaLocalPath"]}</Error>}
                    </Field>

                </ComponentCard>

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

export default DataMapperForm; 
