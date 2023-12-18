/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 * 
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
*/


import React, { useEffect, useState } from 'react';
import { AutoComplete, Button, ComponentCard, RequiredFormInput, TextField } from '@wso2-enterprise/ui-toolkit';
import styled from '@emotion/styled';
import SidePanelContext from '../../../SidePanelContexProvider';
import { AddMediatorProps } from '../common';
import { MIWebViewAPI } from '../../../../../utils/WebViewRpc';
import { getXML } from '../../../../../utils/template-engine/mustach-templates/templateUtils';
import { MEDIATORS } from '../../../../../constants';

const cardStyle = { 
   display: "block",
   margin: "5px 0",
   padding: "0 15px 15px 15px",
   width: "auto",
   cursor: "auto"
};

const Error = styled.span`
   color: var(--vscode-errorForeground);
   font-size: 12px;
`;

const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;
const nameWithoutSpecialCharactorsRegex = /^[a-zA-Z0-9]+$/g;

const LogForm = (props: AddMediatorProps) => {
   const sidePanelContext = React.useContext(SidePanelContext);
   const [formValues, setFormValues] = useState({
       "category": "INFO",
       "level": "SIMPLE",
   } as { [key: string]: any });
   const [errors, setErrors] = useState({} as any);

   useEffect(() => {
       if (sidePanelContext.formValues) {
           setFormValues({ ...formValues, ...sidePanelContext.formValues });
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
           const xml = getXML(MEDIATORS.LOG, formValues);
           MIWebViewAPI.getInstance().applyEdit({
               documentUri: props.documentUri, range: props.nodePosition, text: xml
           });
           sidePanelContext.setIsOpen(false);
           sidePanelContext.setFormValues(undefined);
           sidePanelContext.setNodeRange(undefined);
           sidePanelContext.setMediator(undefined);
           sidePanelContext.setShowBackBtn(false);
       }
   };

   const formValidators: { [key: string]: (e?: any) => string | undefined } = {
       "category": (e?: any) => validateField("category", e, true),
       "level": (e?: any) => validateField("level", e, true),
       "separator": (e?: any) => validateField("separator", e, false),
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

                <div>
                    <label>Log Category</label> <RequiredFormInput />
                    <AutoComplete items={["INFO", "TRACE", "DEBUG", "WARN", "ERROR", "FATAL"]} selectedItem={formValues["category"]} onChange={(e: any) => {
                        setFormValues({ ...formValues, "category": e });
                        formValidators["category"](e);
                    }} />
                    {errors["category"] && <Error>{errors["category"]}</Error>}
                </div>

                <div>
                    <label>Log Level</label> <RequiredFormInput />
                    <AutoComplete items={["SIMPLE", "HEADERS", "FULL", "CUSTOM"]} selectedItem={formValues["level"]} onChange={(e: any) => {
                        setFormValues({ ...formValues, "level": e });
                        formValidators["level"](e);
                    }} />
                    {errors["level"] && <Error>{errors["level"]}</Error>}
                </div>

                <div>
                    <TextField
                        label="Log Separator"
                        size={50}
                        placeholder=""
                        value={formValues["separator"]}
                        onChange={(e: any) => {
                            setFormValues({ ...formValues, "separator": e });
                            formValidators["separator"](e);
                        }}
                        required={false}
                    />
                    {errors["separator"] && <Error>{errors["separator"]}</Error>}
                </div>

                <div>
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
                </div>

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

export default LogForm; 
