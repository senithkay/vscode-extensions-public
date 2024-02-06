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

const FaultForm = (props: AddMediatorProps) => {
   const { rpcClient } = useVisualizerContext();
   const sidePanelContext = React.useContext(SidePanelContext);
   const [formValues, setFormValues] = useState({} as { [key: string]: any });
   const [errors, setErrors] = useState({} as any);

   useEffect(() => {
       if (sidePanelContext.formValues) {
           setFormValues({ ...formValues, ...sidePanelContext.formValues });
       } else {
           setFormValues({
       "soapVersion": "soap11",
       "soap11": "VersionMismatch",
       "serializeResponse": false,
       "detailType": "VALUE",
       "reasonType": "VALUE",});
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
           const xml = getXML(MEDIATORS.FAULT, formValues);
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
       "soapVersion": (e?: any) => validateField("soapVersion", e, false),
       "soap11": (e?: any) => validateField("soap11", e, false),
       "actor": (e?: any) => validateField("actor", e, false),
       "serializeResponse": (e?: any) => validateField("serializeResponse", e, false),
       "detailType": (e?: any) => validateField("detailType", e, false),
       "detailValue": (e?: any) => validateField("detailValue", e, false),
       "detailExpression": (e?: any) => validateField("detailExpression", e, false),
       "reasonType": (e?: any) => validateField("reasonType", e, false),
       "reasonValue": (e?: any) => validateField("reasonValue", e, false),
       "reasonExpression": (e?: any) => validateField("reasonExpression", e, false),
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
                    <label>SOAP Version</label>
                    <AutoComplete items={["soap11", "soap12", "POX"]} selectedItem={formValues["soapVersion"]} onChange={(e: any) => {
                        setFormValues({ ...formValues, "soapVersion": e });
                        formValidators["soapVersion"](e);
                    }} />
                    {errors["soapVersion"] && <Error>{errors["soapVersion"]}</Error>}
                </Field>

                <Field>
                    <label>SOAP11</label>
                    <AutoComplete items={["VersionMismatch", "MustUnderstand", "Client", "Server"]} selectedItem={formValues["soap11"]} onChange={(e: any) => {
                        setFormValues({ ...formValues, "soap11": e });
                        formValidators["soap11"](e);
                    }} />
                    {errors["soap11"] && <Error>{errors["soap11"]}</Error>}
                </Field>

                <Field>
                    <TextField
                        label="Actor"
                        size={50}
                        placeholder=""
                        value={formValues["actor"]}
                        onChange={(e: any) => {
                            setFormValues({ ...formValues, "actor": e });
                            formValidators["actor"](e);
                        }}
                        required={false}
                    />
                    {errors["actor"] && <Error>{errors["actor"]}</Error>}
                </Field>

                <Field>
                    <VSCodeCheckbox type="checkbox" checked={formValues["serializeResponse"]} onChange={(e: any) => {
                        setFormValues({ ...formValues, "serializeResponse": e.target.checked });
                        formValidators["serializeResponse"](e);
                    }
                    }>Serialize Response </VSCodeCheckbox>
                    {errors["serializeResponse"] && <Error>{errors["serializeResponse"]}</Error>}
                </Field>

                <ComponentCard sx={cardStyle} disbaleHoverEffect>
                    <h3>Detail</h3>

                    <Field>
                        <label>Type</label>
                        <AutoComplete items={["VALUE", "EXPRESSION"]} selectedItem={formValues["detailType"]} onChange={(e: any) => {
                            setFormValues({ ...formValues, "detailType": e });
                            formValidators["detailType"](e);
                        }} />
                        {errors["detailType"] && <Error>{errors["detailType"]}</Error>}
                    </Field>

                    {formValues["detailType"] && formValues["detailType"].toLowerCase() == "value" &&
                        <Field>
                            <TextField
                                label="Value"
                                size={50}
                                placeholder=""
                                value={formValues["detailValue"]}
                                onChange={(e: any) => {
                                    setFormValues({ ...formValues, "detailValue": e });
                                    formValidators["detailValue"](e);
                                }}
                                required={false}
                            />
                            {errors["detailValue"] && <Error>{errors["detailValue"]}</Error>}
                        </Field>
                    }

                    {formValues["detailType"] && formValues["detailType"].toLowerCase() == "expression" &&
                        <Field>
                            <TextField
                                label="Expression"
                                size={50}
                                placeholder=""
                                value={formValues["detailExpression"]}
                                onChange={(e: any) => {
                                    setFormValues({ ...formValues, "detailExpression": e });
                                    formValidators["detailExpression"](e);
                                }}
                                required={false}
                            />
                            {errors["detailExpression"] && <Error>{errors["detailExpression"]}</Error>}
                        </Field>
                    }

                </ComponentCard>

                <ComponentCard sx={cardStyle} disbaleHoverEffect>
                    <h3>Reason</h3>

                    <Field>
                        <label>Type</label>
                        <AutoComplete items={["VALUE", "EXPRESSION"]} selectedItem={formValues["reasonType"]} onChange={(e: any) => {
                            setFormValues({ ...formValues, "reasonType": e });
                            formValidators["reasonType"](e);
                        }} />
                        {errors["reasonType"] && <Error>{errors["reasonType"]}</Error>}
                    </Field>

                    {formValues["reasonType"] && formValues["reasonType"].toLowerCase() == "value" &&
                        <Field>
                            <TextField
                                label="Value"
                                size={50}
                                placeholder=""
                                value={formValues["reasonValue"]}
                                onChange={(e: any) => {
                                    setFormValues({ ...formValues, "reasonValue": e });
                                    formValidators["reasonValue"](e);
                                }}
                                required={false}
                            />
                            {errors["reasonValue"] && <Error>{errors["reasonValue"]}</Error>}
                        </Field>
                    }

                    {formValues["reasonType"] && formValues["reasonType"].toLowerCase() == "expression" &&
                        <Field>
                            <TextField
                                label="Expression"
                                size={50}
                                placeholder=""
                                value={formValues["reasonExpression"]}
                                onChange={(e: any) => {
                                    setFormValues({ ...formValues, "reasonExpression": e });
                                    formValidators["reasonExpression"](e);
                                }}
                                required={false}
                            />
                            {errors["reasonExpression"] && <Error>{errors["reasonExpression"]}</Error>}
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

export default FaultForm; 
