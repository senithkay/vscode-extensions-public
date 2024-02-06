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

const FilterForm = (props: AddMediatorProps) => {
   const { rpcClient } = useVisualizerContext();
   const sidePanelContext = React.useContext(SidePanelContext);
   const [formValues, setFormValues] = useState({} as { [key: string]: any });
   const [errors, setErrors] = useState({} as any);

   useEffect(() => {
       if (sidePanelContext.formValues) {
           setFormValues({ ...formValues, ...sidePanelContext.formValues });
       } else {
           setFormValues({
       "conditionType": "Source and Regular Expression",});
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
           const xml = getXML(MEDIATORS.FILTER, formValues);
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
       "conditionType": (e?: any) => validateField("conditionType", e, false),
       "regularExpression": (e?: any) => validateField("regularExpression", e, false),
       "source": (e?: any) => validateField("source", e, false),
       "xPath": (e?: any) => validateField("xPath", e, false),
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

                <ComponentCard sx={cardStyle} disbaleHoverEffect>
                    <h3>Condition</h3>

                    <Field>
                        <label>Condition Type</label>
                        <AutoComplete items={["Source and Regular Expression", "XPath"]} selectedItem={formValues["conditionType"]} onChange={(e: any) => {
                            setFormValues({ ...formValues, "conditionType": e });
                            formValidators["conditionType"](e);
                        }} />
                        {errors["conditionType"] && <Error>{errors["conditionType"]}</Error>}
                    </Field>

                    {formValues["conditionType"] && formValues["conditionType"].toLowerCase() == "source and regular expression" &&
                        <Field>
                            <TextField
                                label="Regular Expression"
                                size={50}
                                placeholder=""
                                value={formValues["regularExpression"]}
                                onChange={(e: any) => {
                                    setFormValues({ ...formValues, "regularExpression": e });
                                    formValidators["regularExpression"](e);
                                }}
                                required={false}
                            />
                            {errors["regularExpression"] && <Error>{errors["regularExpression"]}</Error>}
                        </Field>
                    }

                    {formValues["conditionType"] && formValues["conditionType"].toLowerCase() == "source and regular expression" &&
                        <Field>
                            <TextField
                                label="Source"
                                size={50}
                                placeholder=""
                                value={formValues["source"]}
                                onChange={(e: any) => {
                                    setFormValues({ ...formValues, "source": e });
                                    formValidators["source"](e);
                                }}
                                required={false}
                            />
                            {errors["source"] && <Error>{errors["source"]}</Error>}
                        </Field>
                    }

                    {formValues["conditionType"] && formValues["conditionType"].toLowerCase() == "xpath" &&
                        <Field>
                            <TextField
                                label="XPath"
                                size={50}
                                placeholder=""
                                value={formValues["xPath"]}
                                onChange={(e: any) => {
                                    setFormValues({ ...formValues, "xPath": e });
                                    formValidators["xPath"](e);
                                }}
                                required={false}
                            />
                            {errors["xPath"] && <Error>{errors["xPath"]}</Error>}
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

export default FilterForm; 
