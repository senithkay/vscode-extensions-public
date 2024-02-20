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

const ForEachMediatorForm = (props: AddMediatorProps) => {
   const { rpcClient } = useVisualizerContext();
   const sidePanelContext = React.useContext(SidePanelContext);
   const [formValues, setFormValues] = useState({} as { [key: string]: any });
   const [errors, setErrors] = useState({} as any);

   useEffect(() => {
       if (sidePanelContext.formValues) {
           setFormValues({ ...formValues, ...sidePanelContext.formValues });
       } else {
           setFormValues({
       "sequenceType": "ANONYMOUS",});
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
           const xml = getXML(MEDIATORS.FOREACH, formValues);
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
       "forEachID": (e?: any) => validateField("forEachID", e, false),
       "forEachExpression": (e?: any) => validateField("forEachExpression", e, false),
       "description": (e?: any) => validateField("description", e, false),
       "sequenceType": (e?: any) => validateField("sequenceType", e, false),
       "sequenceKey": (e?: any) => validateField("sequenceKey", e, false),
       "sequenceName": (e?: any) => validateField("sequenceName", e, false),

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
                        label="ForEach ID"
                        size={50}
                        placeholder=""
                        value={formValues["forEachID"]}
                        onChange={(e: any) => {
                            setFormValues({ ...formValues, "forEachID": e });
                            formValidators["forEachID"](e);
                        }}
                        required={false}
                    />
                    {errors["forEachID"] && <Error>{errors["forEachID"]}</Error>}
                </Field>

                <Field>
                    <TextField
                        label="ForEach Expression"
                        size={50}
                        placeholder=""
                        value={formValues["forEachExpression"]}
                        onChange={(e: any) => {
                            setFormValues({ ...formValues, "forEachExpression": e });
                            formValidators["forEachExpression"](e);
                        }}
                        required={false}
                    />
                    {errors["forEachExpression"] && <Error>{errors["forEachExpression"]}</Error>}
                </Field>

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

            <ComponentCard sx={cardStyle} disbaleHoverEffect>
                <h3>Sequence</h3>

                <Field>
                    <label>Sequence Type</label>
                    <AutoComplete items={["ANONYMOUS", "REGISTRY_REFERENCE", "NAMED_REFERENCE"]} selectedItem={formValues["sequenceType"]} onChange={(e: any) => {
                        setFormValues({ ...formValues, "sequenceType": e });
                        formValidators["sequenceType"](e);
                    }} />
                    {errors["sequenceType"] && <Error>{errors["sequenceType"]}</Error>}
                </Field>

                {formValues["sequenceType"] && formValues["sequenceType"].toLowerCase() == "registry_reference" &&
                    <Field>
                        <TextField
                            label="Sequence Key"
                            size={50}
                            placeholder=""
                            value={formValues["sequenceKey"]}
                            onChange={(e: any) => {
                                setFormValues({ ...formValues, "sequenceKey": e });
                                formValidators["sequenceKey"](e);
                            }}
                            required={false}
                        />
                        {errors["sequenceKey"] && <Error>{errors["sequenceKey"]}</Error>}
                    </Field>
                }

                {formValues["sequenceType"] && formValues["sequenceType"].toLowerCase() == "named_reference" &&
                    <Field>
                        <TextField
                            label="Sequence Name"
                            size={50}
                            placeholder=""
                            value={formValues["sequenceName"]}
                            onChange={(e: any) => {
                                setFormValues({ ...formValues, "sequenceName": e });
                                formValidators["sequenceName"](e);
                            }}
                            required={false}
                        />
                        {errors["sequenceName"] && <Error>{errors["sequenceName"]}</Error>}
                    </Field>
                }

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

export default ForEachMediatorForm; 
