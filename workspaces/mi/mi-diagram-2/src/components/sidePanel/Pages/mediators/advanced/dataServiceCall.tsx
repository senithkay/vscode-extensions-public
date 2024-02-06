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
import { VSCodeDataGrid, VSCodeDataGridRow, VSCodeDataGridCell } from '@vscode/webview-ui-toolkit/react';
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

const DataServiceForm = (props: AddMediatorProps) => {
   const { rpcClient } = useVisualizerContext();
   const sidePanelContext = React.useContext(SidePanelContext);
   const [formValues, setFormValues] = useState({} as { [key: string]: any });
   const [errors, setErrors] = useState({} as any);

   useEffect(() => {
       if (sidePanelContext.formValues) {
           setFormValues({ ...formValues, ...sidePanelContext.formValues });
       } else {
           setFormValues({
       "availableDataServices": "Select from available Data Services",
       "sourceType": "INLINE",
       "operationType": "SINGLE",
       "operations": [] as string[][],
       "DSSProperties": [] as string[][],
       "propertyValueType": "LITERAL",
       "targetType": "Default",});
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
           const xml = getXML(MEDIATORS.DATASERVICE, formValues);
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
       "availableDataServices": (e?: any) => validateField("availableDataServices", e, false),
       "serviceName": (e?: any) => validateField("serviceName", e, false),
       "sourceType": (e?: any) => validateField("sourceType", e, false),
       "operationType": (e?: any) => validateField("operationType", e, false),
       "operationName": (e?: any) => validateField("operationName", e, false),
       "propertyName": (e?: any) => validateField("propertyName", e, false),
       "propertyValueType": (e?: any) => validateField("propertyValueType", e, false),
       "propertyValue": (e?: any) => validateField("propertyValue", e, false),
       "propertyExpression": (e?: any) => validateField("propertyExpression", e, false),
       "targetType": (e?: any) => validateField("targetType", e, false),
       "targetProperty": (e?: any) => validateField("targetProperty", e, false),
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
                    <label>Available Data Services</label>
                    <AutoComplete items={["Select from available Data Services"]} selectedItem={formValues["availableDataServices"]} onChange={(e: any) => {
                        setFormValues({ ...formValues, "availableDataServices": e });
                        formValidators["availableDataServices"](e);
                    }} />
                    {errors["availableDataServices"] && <Error>{errors["availableDataServices"]}</Error>}
                </Field>

                <Field>
                    <TextField
                        label="Service Name"
                        size={50}
                        placeholder=""
                        value={formValues["serviceName"]}
                        onChange={(e: any) => {
                            setFormValues({ ...formValues, "serviceName": e });
                            formValidators["serviceName"](e);
                        }}
                        required={false}
                    />
                    {errors["serviceName"] && <Error>{errors["serviceName"]}</Error>}
                </Field>

                <Field>
                    <label>Source Type</label>
                    <AutoComplete items={["INLINE", "BODY"]} selectedItem={formValues["sourceType"]} onChange={(e: any) => {
                        setFormValues({ ...formValues, "sourceType": e });
                        formValidators["sourceType"](e);
                    }} />
                    {errors["sourceType"] && <Error>{errors["sourceType"]}</Error>}
                </Field>

                <Field>
                    <label>Operation Type</label>
                    <AutoComplete items={["SINGLE", "BATCH", "REQUESTBOX"]} selectedItem={formValues["operationType"]} onChange={(e: any) => {
                        setFormValues({ ...formValues, "operationType": e });
                        formValidators["operationType"](e);
                    }} />
                    {errors["operationType"] && <Error>{errors["operationType"]}</Error>}
                </Field>

                <ComponentCard sx={cardStyle} disbaleHoverEffect>
                    <h3>Operations</h3>

                        <Field>
                            <TextField
                                label="OperationName"
                                size={50}
                                placeholder=""
                                value={formValues["operationName"]}
                                onChange={(e: any) => {
                                    setFormValues({ ...formValues, "operationName": e });
                                    formValidators["operationName"](e);
                                }}
                                required={false}
                            />
                            {errors["operationName"] && <Error>{errors["operationName"]}</Error>}
                        </Field>

                        <ComponentCard sx={cardStyle} disbaleHoverEffect>
                            <h3>DSS Properties</h3>

                                <Field>
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
                                </Field>

                                <Field>
                                    <label>Property Value Type</label>
                                    <AutoComplete items={["LITERAL", "EXPRESSION"]} selectedItem={formValues["propertyValueType"]} onChange={(e: any) => {
                                        setFormValues({ ...formValues, "propertyValueType": e });
                                        formValidators["propertyValueType"](e);
                                    }} />
                                    {errors["propertyValueType"] && <Error>{errors["propertyValueType"]}</Error>}
                                </Field>

                                {formValues["propertyValueType"] && formValues["propertyValueType"].toLowerCase() == "literal" &&
                                    <Field>
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
                                    </Field>
                                }

                                {formValues["propertyValueType"] && formValues["propertyValueType"].toLowerCase() == "expression" &&
                                    <Field>
                                        <TextField
                                            label="Property Expression"
                                            size={50}
                                            placeholder=""
                                            value={formValues["propertyExpression"]}
                                            onChange={(e: any) => {
                                                setFormValues({ ...formValues, "propertyExpression": e });
                                                formValidators["propertyExpression"](e);
                                            }}
                                            required={false}
                                        />
                                        {errors["propertyExpression"] && <Error>{errors["propertyExpression"]}</Error>}
                                    </Field>
                                }


                        <div style={{ textAlign: "right", marginTop: "10px" }}>
                            <Button appearance="primary" onClick={() => {
                                if (!(validateField("propertyName", formValues["propertyName"], true) || validateField("propertyValue", formValues["propertyValue"], true))) {
                                    setFormValues({
                                        ...formValues, "propertyName": undefined, "propertyValue": undefined,
                                        "DSSProperties": [...formValues["DSSProperties"], [formValues["propertyName"], formValues["propertyValueType"], formValues["propertyValue"]]]
                                    });
                                }
                            }}>
                                Add
                            </Button>
                        </div>
                        {formValues["DSSProperties"] && formValues["DSSProperties"].length > 0 && (
                            <ComponentCard sx={cardStyle} disbaleHoverEffect>
                                <h3>DSS Properties Table</h3>
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
                                    {formValues["DSSProperties"].map((property: string, index: string) => (
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

                <div style={{ textAlign: "right", marginTop: "10px" }}>
                    <Button appearance="primary" onClick={() => {
                        if (!(validateField("operationName", formValues["operationName"], true) || validateField("", formValues[""], true))) {
                            setFormValues({
                                ...formValues, "operationName": undefined, "": undefined,
                                "operations": [...formValues["operations"], [formValues["operationName"], formValues["DSSProperties"], formValues[""]]]
                            });
                        }
                    }}>
                        Add
                    </Button>
                </div>
                {formValues["operations"] && formValues["operations"].length > 0 && (
                    <ComponentCard sx={cardStyle} disbaleHoverEffect>
                        <h3>Operations Table</h3>
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
                            {formValues["operations"].map((property: string, index: string) => (
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
                    <label>Target Type</label>
                    <AutoComplete items={["BODY", "PROPERTY"]} selectedItem={formValues["targetType"]} onChange={(e: any) => {
                        setFormValues({ ...formValues, "targetType": e });
                        formValidators["targetType"](e);
                    }} />
                    {errors["targetType"] && <Error>{errors["targetType"]}</Error>}
                </Field>

                {formValues["targetType"] && formValues["targetType"].toLowerCase() == "property" &&
                    <Field>
                        <TextField
                            label="Target Property"
                            size={50}
                            placeholder=""
                            value={formValues["targetProperty"]}
                            onChange={(e: any) => {
                                setFormValues({ ...formValues, "targetProperty": e });
                                formValidators["targetProperty"](e);
                            }}
                            required={false}
                        />
                        {errors["targetProperty"] && <Error>{errors["targetProperty"]}</Error>}
                    </Field>
                }

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

export default DataServiceForm; 
