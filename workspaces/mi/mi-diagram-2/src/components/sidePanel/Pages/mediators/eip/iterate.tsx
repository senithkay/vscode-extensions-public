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

const IterateForm = (props: AddMediatorProps) => {
   const { rpcClient } = useVisualizerContext();
   const sidePanelContext = React.useContext(SidePanelContext);
   const [formValues, setFormValues] = useState({} as { [key: string]: any });
   const [errors, setErrors] = useState({} as any);

   useEffect(() => {
       if (sidePanelContext.formValues) {
           setFormValues({ ...formValues, ...sidePanelContext.formValues });
       } else {
           setFormValues({
       "sequentialMediation": false,
       "continueParent": false,
       "preservePayload": false,
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
           const xml = getXML(MEDIATORS.ITERATE, formValues);
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
       "iterateID": (e?: any) => validateField("iterateID", e, false),
       "iterateExpression": (e?: any) => validateField("iterateExpression", e, false),
       "sequentialMediation": (e?: any) => validateField("sequentialMediation", e, false),
       "continueParent": (e?: any) => validateField("continueParent", e, false),
       "preservePayload": (e?: any) => validateField("preservePayload", e, false),
       "attachPath": (e?: any) => validateField("attachPath", e, false),
       "sequenceType": (e?: any) => validateField("sequenceType", e, false),
       "sequenceKey": (e?: any) => validateField("sequenceKey", e, false),
       "sequenceName": (e?: any) => validateField("sequenceName", e, false),
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
                        label="Iterate ID"
                        size={50}
                        placeholder=""
                        value={formValues["iterateID"]}
                        onChange={(e: any) => {
                            setFormValues({ ...formValues, "iterateID": e });
                            formValidators["iterateID"](e);
                        }}
                        required={false}
                    />
                    {errors["iterateID"] && <Error>{errors["iterateID"]}</Error>}
                </Field>

                <Field>
                    <TextField
                        label="Iterate Expression"
                        size={50}
                        placeholder=""
                        value={formValues["iterateExpression"]}
                        onChange={(e: any) => {
                            setFormValues({ ...formValues, "iterateExpression": e });
                            formValidators["iterateExpression"](e);
                        }}
                        required={false}
                    />
                    {errors["iterateExpression"] && <Error>{errors["iterateExpression"]}</Error>}
                </Field>

                <Field>
                    <VSCodeCheckbox type="checkbox" checked={formValues["sequentialMediation"]} onChange={(e: any) => {
                        setFormValues({ ...formValues, "sequentialMediation": e.target.checked });
                        formValidators["sequentialMediation"](e);
                    }
                    }>Sequential Mediation </VSCodeCheckbox>
                    {errors["sequentialMediation"] && <Error>{errors["sequentialMediation"]}</Error>}
                </Field>

                <Field>
                    <VSCodeCheckbox type="checkbox" checked={formValues["continueParent"]} onChange={(e: any) => {
                        setFormValues({ ...formValues, "continueParent": e.target.checked });
                        formValidators["continueParent"](e);
                    }
                    }>Continue Parent </VSCodeCheckbox>
                    {errors["continueParent"] && <Error>{errors["continueParent"]}</Error>}
                </Field>

                <Field>
                    <VSCodeCheckbox type="checkbox" checked={formValues["preservePayload"]} onChange={(e: any) => {
                        setFormValues({ ...formValues, "preservePayload": e.target.checked });
                        formValidators["preservePayload"](e);
                    }
                    }>Preserve Payload </VSCodeCheckbox>
                    {errors["preservePayload"] && <Error>{errors["preservePayload"]}</Error>}
                </Field>

                <Field>
                    <TextField
                        label="Attach Path"
                        size={50}
                        placeholder=""
                        value={formValues["attachPath"]}
                        onChange={(e: any) => {
                            setFormValues({ ...formValues, "attachPath": e });
                            formValidators["attachPath"](e);
                        }}
                        required={false}
                    />
                    {errors["attachPath"] && <Error>{errors["attachPath"]}</Error>}
                </Field>

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

export default IterateForm; 
