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

const AggregateForm = (props: AddMediatorProps) => {
   const { rpcClient } = useVisualizerContext();
   const sidePanelContext = React.useContext(SidePanelContext);
   const [formValues, setFormValues] = useState({} as { [key: string]: any });
   const [errors, setErrors] = useState({} as any);

   useEffect(() => {
       if (sidePanelContext.formValues) {
           setFormValues({ ...formValues, ...sidePanelContext.formValues });
       } else {
           setFormValues({
       "completionTimeout": "0",
       "completionMinMessagesType": "VALUE",
       "completionMinMessagesValue": "-1",
       "completionMaxMessagesType": "VALUE",
       "completionMaxMessagesValue": "-1",
       "aggregateElementType": "ROOT",
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
           const xml = getXML(MEDIATORS.AGGREGATE, formValues);
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
       "completionTimeout": (e?: any) => validateField("completionTimeout", e, false),
       "completionMinMessagesType": (e?: any) => validateField("completionMinMessagesType", e, false),
       "completionMinMessagesValue": (e?: any) => validateField("completionMinMessagesValue", e, false),
       "completionMinMessages": (e?: any) => validateField("completionMinMessages", e, false),
       "completionMaxMessagesType": (e?: any) => validateField("completionMaxMessagesType", e, false),
       "completionMaxMessagesValue": (e?: any) => validateField("completionMaxMessagesValue", e, false),
       "completionMaxMessages": (e?: any) => validateField("completionMaxMessages", e, false),
       "aggregateID": (e?: any) => validateField("aggregateID", e, false),
       "enclosingElementProperty": (e?: any) => validateField("enclosingElementProperty", e, false),
       "correlationExpression": (e?: any) => validateField("correlationExpression", e, false),
       "aggregateElementType": (e?: any) => validateField("aggregateElementType", e, false),
       "aggregationExpression": (e?: any) => validateField("aggregationExpression", e, false),
       "sequenceType": (e?: any) => validateField("sequenceType", e, false),
       "sequenceKey": (e?: any) => validateField("sequenceKey", e, false),

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

                <ComponentCard sx={cardStyle} disbaleHoverEffect>
                    <h3>Complete Condition</h3>

                    <Field>
                        <TextField
                            label="Completion Timeout"
                            size={50}
                            placeholder=""
                            value={formValues["completionTimeout"]}
                            onChange={(e: any) => {
                                setFormValues({ ...formValues, "completionTimeout": e });
                                formValidators["completionTimeout"](e);
                            }}
                            required={false}
                        />
                        {errors["completionTimeout"] && <Error>{errors["completionTimeout"]}</Error>}
                    </Field>

                    <Field>
                        <label>Completion Min Messages Type</label>
                        <AutoComplete items={["VALUE", "EXPRESSION"]} selectedItem={formValues["completionMinMessagesType"]} onChange={(e: any) => {
                            setFormValues({ ...formValues, "completionMinMessagesType": e });
                            formValidators["completionMinMessagesType"](e);
                        }} />
                        {errors["completionMinMessagesType"] && <Error>{errors["completionMinMessagesType"]}</Error>}
                    </Field>

                    {formValues["completionMinMessagesType"] && formValues["completionMinMessagesType"].toLowerCase() == "value" &&
                        <Field>
                            <TextField
                                label="Completion Min Messages Value"
                                size={50}
                                placeholder=""
                                value={formValues["completionMinMessagesValue"]}
                                onChange={(e: any) => {
                                    setFormValues({ ...formValues, "completionMinMessagesValue": e });
                                    formValidators["completionMinMessagesValue"](e);
                                }}
                                required={false}
                            />
                            {errors["completionMinMessagesValue"] && <Error>{errors["completionMinMessagesValue"]}</Error>}
                        </Field>
                    }

                    {formValues["completionMinMessagesType"] && formValues["completionMinMessagesType"].toLowerCase() == "expression" &&
                        <Field>
                            <TextField
                                label="Completion Min Messages"
                                size={50}
                                placeholder=""
                                value={formValues["completionMinMessages"]}
                                onChange={(e: any) => {
                                    setFormValues({ ...formValues, "completionMinMessages": e });
                                    formValidators["completionMinMessages"](e);
                                }}
                                required={false}
                            />
                            {errors["completionMinMessages"] && <Error>{errors["completionMinMessages"]}</Error>}
                        </Field>
                    }

                    <Field>
                        <label>Completion Max Messages Type</label>
                        <AutoComplete items={["VALUE", "EXPRESSION"]} selectedItem={formValues["completionMaxMessagesType"]} onChange={(e: any) => {
                            setFormValues({ ...formValues, "completionMaxMessagesType": e });
                            formValidators["completionMaxMessagesType"](e);
                        }} />
                        {errors["completionMaxMessagesType"] && <Error>{errors["completionMaxMessagesType"]}</Error>}
                    </Field>

                    {formValues["completionMaxMessagesType"] && formValues["completionMaxMessagesType"].toLowerCase() == "value" &&
                        <Field>
                            <TextField
                                label="Completion Max Messages Value"
                                size={50}
                                placeholder=""
                                value={formValues["completionMaxMessagesValue"]}
                                onChange={(e: any) => {
                                    setFormValues({ ...formValues, "completionMaxMessagesValue": e });
                                    formValidators["completionMaxMessagesValue"](e);
                                }}
                                required={false}
                            />
                            {errors["completionMaxMessagesValue"] && <Error>{errors["completionMaxMessagesValue"]}</Error>}
                        </Field>
                    }

                    {formValues["completionMaxMessagesType"] && formValues["completionMaxMessagesType"].toLowerCase() == "expression" &&
                        <Field>
                            <TextField
                                label="Completion Max Messages"
                                size={50}
                                placeholder=""
                                value={formValues["completionMaxMessages"]}
                                onChange={(e: any) => {
                                    setFormValues({ ...formValues, "completionMaxMessages": e });
                                    formValidators["completionMaxMessages"](e);
                                }}
                                required={false}
                            />
                            {errors["completionMaxMessages"] && <Error>{errors["completionMaxMessages"]}</Error>}
                        </Field>
                    }

                </ComponentCard>

                <Field>
                    <TextField
                        label="Aggregate ID"
                        size={50}
                        placeholder=""
                        value={formValues["aggregateID"]}
                        onChange={(e: any) => {
                            setFormValues({ ...formValues, "aggregateID": e });
                            formValidators["aggregateID"](e);
                        }}
                        required={false}
                    />
                    {errors["aggregateID"] && <Error>{errors["aggregateID"]}</Error>}
                </Field>

                <Field>
                    <TextField
                        label="Enclosing Element Property"
                        size={50}
                        placeholder=""
                        value={formValues["enclosingElementProperty"]}
                        onChange={(e: any) => {
                            setFormValues({ ...formValues, "enclosingElementProperty": e });
                            formValidators["enclosingElementProperty"](e);
                        }}
                        required={false}
                    />
                    {errors["enclosingElementProperty"] && <Error>{errors["enclosingElementProperty"]}</Error>}
                </Field>

                <Field>
                    <TextField
                        label="Correlation Expression"
                        size={50}
                        placeholder=""
                        value={formValues["correlationExpression"]}
                        onChange={(e: any) => {
                            setFormValues({ ...formValues, "correlationExpression": e });
                            formValidators["correlationExpression"](e);
                        }}
                        required={false}
                    />
                    {errors["correlationExpression"] && <Error>{errors["correlationExpression"]}</Error>}
                </Field>

                <Field>
                    <label>Aggregate Element Type</label>
                    <AutoComplete items={["ROOT", "CHILD"]} selectedItem={formValues["aggregateElementType"]} onChange={(e: any) => {
                        setFormValues({ ...formValues, "aggregateElementType": e });
                        formValidators["aggregateElementType"](e);
                    }} />
                    {errors["aggregateElementType"] && <Error>{errors["aggregateElementType"]}</Error>}
                </Field>

                <Field>
                    <TextField
                        label="Aggregation Expression"
                        size={50}
                        placeholder=""
                        value={formValues["aggregationExpression"]}
                        onChange={(e: any) => {
                            setFormValues({ ...formValues, "aggregationExpression": e });
                            formValidators["aggregationExpression"](e);
                        }}
                        required={false}
                    />
                    {errors["aggregationExpression"] && <Error>{errors["aggregationExpression"]}</Error>}
                </Field>

            </ComponentCard>

            <ComponentCard sx={cardStyle} disbaleHoverEffect>
                <h3>OnComplete</h3>

                <Field>
                    <label>Sequence Type</label>
                    <AutoComplete items={["ANONYMOUS", "REGISTRY_REFERENCE"]} selectedItem={formValues["sequenceType"]} onChange={(e: any) => {
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

export default AggregateForm; 
