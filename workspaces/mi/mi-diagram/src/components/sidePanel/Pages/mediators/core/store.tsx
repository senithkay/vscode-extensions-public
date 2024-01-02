/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
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

const StoreForm = (props: AddMediatorProps) => {
   const sidePanelContext = React.useContext(SidePanelContext);
   const [formValues, setFormValues] = useState({} as { [key: string]: any });
   const [errors, setErrors] = useState({} as any);

   useEffect(() => {
       if (sidePanelContext.formValues) {
           setFormValues({ ...formValues, ...sidePanelContext.formValues });
       } else {
           setFormValues({
       "specifyAs": "Value",
       "availableMessageStores": "Select From Message Stores",});
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
           const xml = getXML(MEDIATORS.STORE, formValues);
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
       "specifyAs": (e?: any) => validateField("specifyAs", e, false),
       "availableMessageStores": (e?: any) => validateField("availableMessageStores", e, false),
       "messageStore": (e?: any) => validateField("messageStore", e, false),
       "expression": (e?: any) => validateField("expression", e, false),
       "onStoreSequence": (e?: any) => validateField("onStoreSequence", e, false),
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

                <ComponentCard sx={cardStyle} disbaleHoverEffect>
                    <h3>Message Store</h3>

                    <div>
                        <label>Specify As</label>
                        <AutoComplete items={["Value", "Expression"]} selectedItem={formValues["specifyAs"]} onChange={(e: any) => {
                            setFormValues({ ...formValues, "specifyAs": e });
                            formValidators["specifyAs"](e);
                        }} />
                        {errors["specifyAs"] && <Error>{errors["specifyAs"]}</Error>}
                    </div>

                    {formValues["specifyAs"] && formValues["specifyAs"].toLowerCase() == "value" &&
                        <div>
                            <label>Available Message Stores</label>
                            <AutoComplete items={["Select From Message Stores"]} selectedItem={formValues["availableMessageStores"]} onChange={(e: any) => {
                                setFormValues({ ...formValues, "availableMessageStores": e });
                                formValidators["availableMessageStores"](e);
                            }} />
                            {errors["availableMessageStores"] && <Error>{errors["availableMessageStores"]}</Error>}
                        </div>
                    }

                    {formValues["specifyAs"] && formValues["specifyAs"].toLowerCase() == "value" &&
                        <div>
                            <TextField
                                label="Message Store"
                                size={50}
                                placeholder=""
                                value={formValues["messageStore"]}
                                onChange={(e: any) => {
                                    setFormValues({ ...formValues, "messageStore": e });
                                    formValidators["messageStore"](e);
                                }}
                                required={false}
                            />
                            {errors["messageStore"] && <Error>{errors["messageStore"]}</Error>}
                        </div>
                    }

                    {formValues["specifyAs"] && formValues["specifyAs"].toLowerCase() == "expression" &&
                        <div>
                            <TextField
                                label="Expression"
                                size={50}
                                placeholder=""
                                value={formValues["expression"]}
                                onChange={(e: any) => {
                                    setFormValues({ ...formValues, "expression": e });
                                    formValidators["expression"](e);
                                }}
                                required={false}
                            />
                            {errors["expression"] && <Error>{errors["expression"]}</Error>}
                        </div>
                    }

                </ComponentCard>
                <div>
                    <TextField
                        label="On Store Sequence"
                        size={50}
                        placeholder=""
                        value={formValues["onStoreSequence"]}
                        onChange={(e: any) => {
                            setFormValues({ ...formValues, "onStoreSequence": e });
                            formValidators["onStoreSequence"](e);
                        }}
                        required={false}
                    />
                    {errors["onStoreSequence"] && <Error>{errors["onStoreSequence"]}</Error>}
                </div>

                <div>
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

export default StoreForm; 
