/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 * 
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
*/


import React, { useEffect, useState } from 'react';
import { Button, ComponentCard, TextField } from '@wso2-enterprise/ui-toolkit';
import { VSCodeDataGrid, VSCodeDataGridRow, VSCodeDataGridCell } from '@vscode/webview-ui-toolkit/react';
import styled from '@emotion/styled';
import SidePanelContext from '../../../SidePanelContexProvider';
import { useVisualizerContext } from '@wso2-enterprise/mi-rpc-client';
import { ENDPOINTS } from '../../../../../resources/constants';
import { AddMediatorProps } from '../../../../Form/common';
import { getTemplateEndpointMustacheTemplate } from "../../../../../utils/template-engine/mustach-templates/endpoints/template";
import Mustache from 'mustache';

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

const TemplateEndpointForm = (props: AddMediatorProps) => {
   const { rpcClient } = useVisualizerContext();
   const sidePanelContext = React.useContext(SidePanelContext);
   const [formValues, setFormValues] = useState({} as { [key: string]: any });
   const [errors, setErrors] = useState({} as any);

   useEffect(() => {
       if (sidePanelContext.formValues && Object.keys(sidePanelContext.formValues).length > 0) {
           setFormValues({ ...formValues, ...sidePanelContext.formValues });
       } else {
           setFormValues({
       "parameters": [] as string[][],});
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
           const template = getTemplateEndpointMustacheTemplate();
           const xml = Mustache.render(template, formValues).trim();
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
       "description": (e?: any) => validateField("description", e, false),
       "targetTemplate": (e?: any) => validateField("targetTemplate", e, false),
       "parameterName": (e?: any) => validateField("parameterName", e, false),
       "parameterValue": (e?: any) => validateField("parameterValue", e, false),
       "avaiableTemplates": (e?: any) => validateField("avaiableTemplates", e, false),

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
                        onTextChange={(e: any) => {
                            setFormValues({ ...formValues, "description": e });
                            formValidators["description"](e);
                        }}
                        required={false}
                    />
                    {errors["description"] && <Error>{errors["description"]}</Error>}
                </Field>

                <Field>
                    <TextField
                        label="Target Template"
                        size={50}
                        placeholder=""
                        value={formValues["targetTemplate"]}
                        onTextChange={(e: any) => {
                            setFormValues({ ...formValues, "targetTemplate": e });
                            formValidators["targetTemplate"](e);
                        }}
                        required={false}
                    />
                    {errors["targetTemplate"] && <Error>{errors["targetTemplate"]}</Error>}
                </Field>

                <ComponentCard sx={cardStyle} disbaleHoverEffect>
                    <h3>Parameters</h3>

                        <Field>
                            <TextField
                                label="Parameter Name"
                                size={50}
                                placeholder=""
                                value={formValues["parameterName"]}
                                onTextChange={(e: any) => {
                                    setFormValues({ ...formValues, "parameterName": e });
                                    formValidators["parameterName"](e);
                                }}
                                required={false}
                            />
                            {errors["parameterName"] && <Error>{errors["parameterName"]}</Error>}
                        </Field>

                        <Field>
                            <TextField
                                label="Parameter Value"
                                size={50}
                                placeholder=""
                                value={formValues["parameterValue"]}
                                onTextChange={(e: any) => {
                                    setFormValues({ ...formValues, "parameterValue": e });
                                    formValidators["parameterValue"](e);
                                }}
                                required={false}
                            />
                            {errors["parameterValue"] && <Error>{errors["parameterValue"]}</Error>}
                        </Field>


                <div style={{ textAlign: "right", marginTop: "10px" }}>
                    <Button appearance="primary" onClick={() => {
                        if (!(validateField("parameterName", formValues["parameterName"], true) || validateField("", formValues[""], true))) {
                            setFormValues({
                                ...formValues, "parameterName": undefined, "": undefined,
                                "parameters": [...formValues["parameters"], [formValues["parameterName"], formValues["parameterValue"], formValues[""]]]
                            });
                        }
                    }}>
                        Add
                    </Button>
                </div>
                {formValues["parameters"] && formValues["parameters"].length > 0 && (
                    <ComponentCard sx={cardStyle} disbaleHoverEffect>
                        <h3>Parameters Table</h3>
                        <VSCodeDataGrid style={{ display: 'flex', flexDirection: 'column' }}>
                            <VSCodeDataGridRow className="header" style={{ display: 'flex', background: 'gray' }}>
                                <VSCodeDataGridCell key={0} style={{ flex: 1 }}>
                                    Name
                                </VSCodeDataGridCell>
                                <VSCodeDataGridCell key={1} style={{ flex: 1 }}>
                                    Value Type
                                </VSCodeDataGridCell>
                                <VSCodeDataGridCell key={2} style={{ flex: 1 }}>
                                    Value
                                </VSCodeDataGridCell>
                            </VSCodeDataGridRow>
                            {formValues["parameters"].map((property: string, index: string) => (
                                <VSCodeDataGridRow key={index} style={{ display: 'flex' }}>
                                    <VSCodeDataGridCell key={0} style={{ flex: 1 }}>
                                        {property[0]}
                                    </VSCodeDataGridCell>
                                    <VSCodeDataGridCell key={1} style={{ flex: 1 }}>
                                        {property[1]}
                                    </VSCodeDataGridCell>
                                    <VSCodeDataGridCell key={2} style={{ flex: 1 }}>
                                        {property[2]}
                                    </VSCodeDataGridCell>
                                </VSCodeDataGridRow>
                            ))}
                        </VSCodeDataGrid>
                    </ComponentCard>
                )}
                </ComponentCard>
                <Field>
                    <TextField
                        label="Avaiable Templates"
                        size={50}
                        placeholder=""
                        value={formValues["avaiableTemplates"]}
                        onTextChange={(e: any) => {
                            setFormValues({ ...formValues, "avaiableTemplates": e });
                            formValidators["avaiableTemplates"](e);
                        }}
                        required={false}
                    />
                    {errors["avaiableTemplates"] && <Error>{errors["avaiableTemplates"]}</Error>}
                </Field>

            </ComponentCard>


            <div style={{ display: "flex", textAlign: "right", justifyContent: "flex-end", marginTop: "10px" }}>
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

export default TemplateEndpointForm; 
