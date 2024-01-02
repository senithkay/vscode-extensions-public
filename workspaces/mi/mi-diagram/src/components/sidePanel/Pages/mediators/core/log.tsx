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

const LogForm = (props: AddMediatorProps) => {
   const sidePanelContext = React.useContext(SidePanelContext);
   const [formValues, setFormValues] = useState({} as { [key: string]: any });
   const [errors, setErrors] = useState({} as any);

   useEffect(() => {
       if (sidePanelContext.formValues) {
           setFormValues({ ...formValues, ...sidePanelContext.formValues });
       } else {
           setFormValues({
       "category": "INFO",
       "level": "SIMPLE",
       "properties": [] as string[][],
       "propertyValueType": "LITERAL",});
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
       }
   };

   const formValidators: { [key: string]: (e?: any) => string | undefined } = {
       "category": (e?: any) => validateField("category", e, true),
       "level": (e?: any) => validateField("level", e, true),
       "separator": (e?: any) => validateField("separator", e, false),
       "propertyName": (e?: any) => validateField("propertyName", e, false),
       "propertyValueType": (e?: any) => validateField("propertyValueType", e, false),
       "propertyValue": (e?: any) => validateField("propertyValue", e, false),
       "propertyExpression": (e?: any) => validateField("propertyExpression", e, false),
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

                <ComponentCard sx={cardStyle} disbaleHoverEffect>
                    <ComponentCard sx={cardStyle} disbaleHoverEffect>
                        <h3>Properties</h3>

                        <div>
                            <TextField
                                label="Property Name"
                                size={50}
                                placeholder=""
                                value={formValues["propertyName"]}
                                onChange={(e: any) => {
                                    setFormValues({ ...formValues, "propertyName": e });
                                    formValidators["propertyName"](e);
                                }}
                                required={false}
                            />
                            {errors["propertyName"] && <Error>{errors["propertyName"]}</Error>}
                        </div>

                        <div>
                            <label>Property Value Type</label>
                            <AutoComplete items={["LITERAL", "EXPRESSION"]} selectedItem={formValues["propertyValueType"]} onChange={(e: any) => {
                                setFormValues({ ...formValues, "propertyValueType": e });
                                formValidators["propertyValueType"](e);
                            }} />
                            {errors["propertyValueType"] && <Error>{errors["propertyValueType"]}</Error>}
                        </div>

                        {formValues["propertyValueType"] && formValues["propertyValueType"].toLowerCase() == "literal" &&
                            <div>
                                <TextField
                                    label="Property Value"
                                    size={50}
                                    placeholder=""
                                    value={formValues["propertyValue"]}
                                    onChange={(e: any) => {
                                        setFormValues({ ...formValues, "propertyValue": e });
                                        formValidators["propertyValue"](e);
                                    }}
                                    required={false}
                                />
                                {errors["propertyValue"] && <Error>{errors["propertyValue"]}</Error>}
                            </div>
                        }

                        {formValues["propertyValueType"] && formValues["propertyValueType"].toLowerCase() == "expression" &&
                            <div>
                            </div>
                        }

                    </ComponentCard>
                <div style={{ textAlign: "right", marginTop: "10px" }}>
                    <Button appearance="primary" onClick={() => {
                        if (!(validateField("propertyName", formValues["propertyName"], true) || validateField("propertyValue", formValues["propertyValue"], true))) {
                            setFormValues({
                                ...formValues, "propertyName": undefined, "propertyValue": undefined,
                                "properties": [...formValues["properties"], [formValues["propertyName"], formValues["propertyValueType"], formValues["propertyValue"]]]
                            });
                        }
                    }}>
                        Add
                    </Button>
                </div>
                {formValues["properties"] && formValues["properties"].length > 0 && (
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
                </ComponentCard>
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
