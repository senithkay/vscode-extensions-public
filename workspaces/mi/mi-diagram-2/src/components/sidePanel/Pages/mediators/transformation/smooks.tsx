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

const SmooksForm = (props: AddMediatorProps) => {
   const { rpcClient } = useVisualizerContext();
   const sidePanelContext = React.useContext(SidePanelContext);
   const [formValues, setFormValues] = useState({} as { [key: string]: any });
   const [errors, setErrors] = useState({} as any);

   useEffect(() => {
       if (sidePanelContext.formValues) {
           setFormValues({ ...formValues, ...sidePanelContext.formValues });
       } else {
           setFormValues({
       "inputType": "xml",
       "outputType": "xml",
       "outputMethod": "Default",
       "outputAction": "Add",});
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
           const xml = getXML(MEDIATORS.SMOOKS, formValues);
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
       "inputType": (e?: any) => validateField("inputType", e, false),
       "inputExpression": (e?: any) => validateField("inputExpression", e, false),
       "configurationKey": (e?: any) => validateField("configurationKey", e, false),
       "outputType": (e?: any) => validateField("outputType", e, false),
       "outputMethod": (e?: any) => validateField("outputMethod", e, false),
       "outputProperty": (e?: any) => validateField("outputProperty", e, false),
       "outputAction": (e?: any) => validateField("outputAction", e, false),
       "outputExpression": (e?: any) => validateField("outputExpression", e, false),
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
                <h3>Input</h3>

                <Field>
                    <label>Input Type</label>
                    <AutoComplete items={["xml", "text"]} selectedItem={formValues["inputType"]} onChange={(e: any) => {
                        setFormValues({ ...formValues, "inputType": e });
                        formValidators["inputType"](e);
                    }} />
                    {errors["inputType"] && <Error>{errors["inputType"]}</Error>}
                </Field>

                <Field>
                    <TextField
                        label="Input Expression"
                        size={50}
                        placeholder=""
                        value={formValues["inputExpression"]}
                        onChange={(e: any) => {
                            setFormValues({ ...formValues, "inputExpression": e });
                            formValidators["inputExpression"](e);
                        }}
                        required={false}
                    />
                    {errors["inputExpression"] && <Error>{errors["inputExpression"]}</Error>}
                </Field>

            </ComponentCard>

            <ComponentCard sx={cardStyle} disbaleHoverEffect>
                <h3>Key</h3>

                <Field>
                    <TextField
                        label="Configuration Key"
                        size={50}
                        placeholder=""
                        value={formValues["configurationKey"]}
                        onChange={(e: any) => {
                            setFormValues({ ...formValues, "configurationKey": e });
                            formValidators["configurationKey"](e);
                        }}
                        required={false}
                    />
                    {errors["configurationKey"] && <Error>{errors["configurationKey"]}</Error>}
                </Field>

            </ComponentCard>

            <ComponentCard sx={cardStyle} disbaleHoverEffect>
                <h3>Output</h3>

                <Field>
                    <label>Output Type</label>
                    <AutoComplete items={["xml", "text", "java"]} selectedItem={formValues["outputType"]} onChange={(e: any) => {
                        setFormValues({ ...formValues, "outputType": e });
                        formValidators["outputType"](e);
                    }} />
                    {errors["outputType"] && <Error>{errors["outputType"]}</Error>}
                </Field>

                <Field>
                    <label>Output Method</label>
                    <AutoComplete items={["Default", "Property", "Expression"]} selectedItem={formValues["outputMethod"]} onChange={(e: any) => {
                        setFormValues({ ...formValues, "outputMethod": e });
                        formValidators["outputMethod"](e);
                    }} />
                    {errors["outputMethod"] && <Error>{errors["outputMethod"]}</Error>}
                </Field>

                {formValues["outputMethod"] && formValues["outputMethod"].toLowerCase() == "property" &&
                    <Field>
                        <TextField
                            label="Output Property"
                            size={50}
                            placeholder=""
                            value={formValues["outputProperty"]}
                            onChange={(e: any) => {
                                setFormValues({ ...formValues, "outputProperty": e });
                                formValidators["outputProperty"](e);
                            }}
                            required={false}
                        />
                        {errors["outputProperty"] && <Error>{errors["outputProperty"]}</Error>}
                    </Field>
                }

                {formValues["outputMethod"] && formValues["outputMethod"].toLowerCase() == "expression" &&
                    <Field>
                        <label>Output Action</label>
                        <AutoComplete items={["Add", "Replace", "Sibiling"]} selectedItem={formValues["outputAction"]} onChange={(e: any) => {
                            setFormValues({ ...formValues, "outputAction": e });
                            formValidators["outputAction"](e);
                        }} />
                        {errors["outputAction"] && <Error>{errors["outputAction"]}</Error>}
                    </Field>
                }

                {formValues["outputMethod"] && formValues["outputMethod"].toLowerCase() == "expression" &&
                    <Field>
                        <TextField
                            label="Output Expression"
                            size={50}
                            placeholder=""
                            value={formValues["outputExpression"]}
                            onChange={(e: any) => {
                                setFormValues({ ...formValues, "outputExpression": e });
                                formValidators["outputExpression"](e);
                            }}
                            required={false}
                        />
                        {errors["outputExpression"] && <Error>{errors["outputExpression"]}</Error>}
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

export default SmooksForm; 
