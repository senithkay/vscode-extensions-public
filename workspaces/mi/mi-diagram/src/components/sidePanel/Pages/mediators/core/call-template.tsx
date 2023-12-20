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
import { VSCodeDataGrid, VSCodeDataGridRow, VSCodeDataGridCell } from '@vscode/webview-ui-toolkit/react';
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

const CallTemplateForm = (props: AddMediatorProps) => {
   const sidePanelContext = React.useContext(SidePanelContext);
   const [formValues, setFormValues] = useState({
       "availableTemplates": "Select From Templates",
       "parameterName": [] as string[][],
       "templateParameterType": "LITERAL",
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
           const xml = getXML(MEDIATORS.CALLTEMPLATE, formValues);
           MIWebViewAPI.getInstance().applyEdit({
               documentUri: props.documentUri, range: props.nodePosition, text: xml
           });
           sidePanelContext.setIsOpen(false);
           sidePanelContext.setFormValues(undefined);
           sidePanelContext.setNodeRange(undefined);
           sidePanelContext.setMediator(undefined);
       }
   };

   const onAddClick = async () => {
       if (!(validateField("propertyName", formValues["propertyName"], true) || validateField("propertyValue", formValues["propertyValue"], true))) {
        setFormValues({ ...formValues, "propertyName": undefined, "propertyValue": undefined ,
        "properties": [...formValues["properties"], [formValues["propertyName"], formValues["propertyValueType"], formValues["propertyValue"]]]});
       }
   }

   const formValidators: { [key: string]: (e?: any) => string | undefined } = {
       "availableTemplates": (e?: any) => validateField("availableTemplates", e, false),
       "parameterName": (e?: any) => validateField("parameterName", e, false),
       "templateParameterType": (e?: any) => validateField("templateParameterType", e, false),
       "parameterValue": (e?: any) => validateField("parameterValue", e, false),
       "parameterExpression": (e?: any) => validateField("parameterExpression", e, false),
       "targetTemplate": (e?: any) => validateField("targetTemplate", e, false),
       "onError": (e?: any) => validateField("onError", e, false),
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
                    <label>Available Templates</label>
                    <AutoComplete items={["Select From Templates"]} selectedItem={formValues["availableTemplates"]} onChange={(e: any) => {
                        setFormValues({ ...formValues, "availableTemplates": e });
                        formValidators["availableTemplates"](e);
                    }} />
                    {errors["availableTemplates"] && <Error>{errors["availableTemplates"]}</Error>}
                </div>

                    <ComponentCard sx={cardStyle} disbaleHoverEffect>
                        <h3>Properties</h3>

                        <div>
                            <TextField
                                label="Parameter Name"
                                size={50}
                                placeholder=""
                                value={formValues["parameterName"]}
                                onChange={(e: any) => {
                                    setFormValues({ ...formValues, "parameterName": e });
                                    formValidators["parameterName"](e);
                                }}
                                required={false}
                            />
                            {errors["parameterName"] && <Error>{errors["parameterName"]}</Error>}
                        </div>

                        <div>
                            <label>Template Parameter Type</label>
                            <AutoComplete items={["LITERAL", "EXPRESSION"]} selectedItem={formValues["templateParameterType"]} onChange={(e: any) => {
                                setFormValues({ ...formValues, "templateParameterType": e });
                                formValidators["templateParameterType"](e);
                            }} />
                            {errors["templateParameterType"] && <Error>{errors["templateParameterType"]}</Error>}
                        </div>

                        {formValues["templateParameterType"] && formValues["templateParameterType"].toLowerCase() == "literal" &&
                            <div>
                                <TextField
                                    label="Parameter Value"
                                    size={50}
                                    placeholder=""
                                    value={formValues["parameterValue"]}
                                    onChange={(e: any) => {
                                        setFormValues({ ...formValues, "parameterValue": e });
                                        formValidators["parameterValue"](e);
                                    }}
                                    required={false}
                                />
                                {errors["parameterValue"] && <Error>{errors["parameterValue"]}</Error>}
                            </div>
                        }

                        {formValues["templateParameterType"] && formValues["templateParameterType"].toLowerCase() == "expression" &&
                            <div>
                            </div>
                        }

                    <div style={{ textAlign: "right", marginTop: "10px" }}>
                        <Button appearance="primary" onClick={onAddClick}>
                            Add
                        </Button>
                    </div>
                    </ComponentCard>
                {formValues["properties"].length > 0 && (
                    <ComponentCard sx={cardStyle} disbaleHoverEffect>
                        <h3>Properties Table</h3>
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
                            {formValues["properties"].map((property: string, index: string) => (
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
                <div>
                    <TextField
                        label="Target Template"
                        size={50}
                        placeholder=""
                        value={formValues["targetTemplate"]}
                        onChange={(e: any) => {
                            setFormValues({ ...formValues, "targetTemplate": e });
                            formValidators["targetTemplate"](e);
                        }}
                        required={false}
                    />
                    {errors["targetTemplate"] && <Error>{errors["targetTemplate"]}</Error>}
                </div>

                <div>
                    <TextField
                        label="OnError"
                        size={50}
                        placeholder=""
                        value={formValues["onError"]}
                        onChange={(e: any) => {
                            setFormValues({ ...formValues, "onError": e });
                            formValidators["onError"](e);
                        }}
                        required={false}
                    />
                    {errors["onError"] && <Error>{errors["onError"]}</Error>}
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

export default CallTemplateForm; 
