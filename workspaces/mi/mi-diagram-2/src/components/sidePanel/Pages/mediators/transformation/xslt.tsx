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
import { VSCodeCheckbox, VSCodeDataGrid, VSCodeDataGridRow, VSCodeDataGridCell } from '@vscode/webview-ui-toolkit/react';
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

const XSLTForm = (props: AddMediatorProps) => {
   const { rpcClient } = useVisualizerContext();
   const sidePanelContext = React.useContext(SidePanelContext);
   const [formValues, setFormValues] = useState({} as { [key: string]: any });
   const [errors, setErrors] = useState({} as any);

   useEffect(() => {
       if (sidePanelContext.formValues) {
           setFormValues({ ...formValues, ...sidePanelContext.formValues });
       } else {
           setFormValues({
       "xsltSchemaKeyType": "Static",
       "properties": [] as string[][],
       "propertyValueType": "LITERAL",
       "resources": [] as string[][],
       "features": [] as string[][],
       "featureEnabled": false,});
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
           const xml = getXML(MEDIATORS.XSLT, formValues);
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
       "sourceXPath": (e?: any) => validateField("sourceXPath", e, false),
       "xsltSchemaKeyType": (e?: any) => validateField("xsltSchemaKeyType", e, false),
       "xsltStaticSchemaKey": (e?: any) => validateField("xsltStaticSchemaKey", e, false),
       "xsltDynamicSchemaKey": (e?: any) => validateField("xsltDynamicSchemaKey", e, false),
       "propertyName": (e?: any) => validateField("propertyName", e, false),
       "propertyValueType": (e?: any) => validateField("propertyValueType", e, false),
       "propertyValue": (e?: any) => validateField("propertyValue", e, false),
       "propertyExpression": (e?: any) => validateField("propertyExpression", e, false),
       "location": (e?: any) => validateField("location", e, false),
       "resourceRegistryKey": (e?: any) => validateField("resourceRegistryKey", e, false),
       "featureName": (e?: any) => validateField("featureName", e, false),
       "featureEnabled": (e?: any) => validateField("featureEnabled", e, false),
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
                        label="Source XPath"
                        size={50}
                        placeholder=""
                        value={formValues["sourceXPath"]}
                        onChange={(e: any) => {
                            setFormValues({ ...formValues, "sourceXPath": e });
                            formValidators["sourceXPath"](e);
                        }}
                        required={false}
                    />
                    {errors["sourceXPath"] && <Error>{errors["sourceXPath"]}</Error>}
                </Field>

                <ComponentCard sx={cardStyle} disbaleHoverEffect>
                    <h3>XSLT Schema Key</h3>

                    <Field>
                        <label>XSLT Schema Key Type</label>
                        <AutoComplete items={["Static", "Dynamic"]} selectedItem={formValues["xsltSchemaKeyType"]} onChange={(e: any) => {
                            setFormValues({ ...formValues, "xsltSchemaKeyType": e });
                            formValidators["xsltSchemaKeyType"](e);
                        }} />
                        {errors["xsltSchemaKeyType"] && <Error>{errors["xsltSchemaKeyType"]}</Error>}
                    </Field>

                    {formValues["xsltSchemaType"] && formValues["xsltSchemaType"].toLowerCase() == "static" &&
                        <Field>
                            <TextField
                                label="XSLT Static Schema Key"
                                size={50}
                                placeholder=""
                                value={formValues["xsltStaticSchemaKey"]}
                                onChange={(e: any) => {
                                    setFormValues({ ...formValues, "xsltStaticSchemaKey": e });
                                    formValidators["xsltStaticSchemaKey"](e);
                                }}
                                required={false}
                            />
                            {errors["xsltStaticSchemaKey"] && <Error>{errors["xsltStaticSchemaKey"]}</Error>}
                        </Field>
                    }

                    {formValues["xsltSchemaType"] && formValues["xsltSchemaType"].toLowerCase() == "dynamic" &&
                        <Field>
                            <TextField
                                label="XSLT Dynamic Schema Key"
                                size={50}
                                placeholder=""
                                value={formValues["xsltDynamicSchemaKey"]}
                                onChange={(e: any) => {
                                    setFormValues({ ...formValues, "xsltDynamicSchemaKey": e });
                                    formValidators["xsltDynamicSchemaKey"](e);
                                }}
                                required={false}
                            />
                            {errors["xsltDynamicSchemaKey"] && <Error>{errors["xsltDynamicSchemaKey"]}</Error>}
                        </Field>
                    }

                    <ComponentCard sx={cardStyle} disbaleHoverEffect>
                        <h3>Properties</h3>

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
                    <ComponentCard sx={cardStyle} disbaleHoverEffect>
                        <h3>Resources</h3>

                            <Field>
                                <TextField
                                    label="Location"
                                    size={50}
                                    placeholder=""
                                    value={formValues["location"]}
                                    onChange={(e: any) => {
                                        setFormValues({ ...formValues, "location": e });
                                        formValidators["location"](e);
                                    }}
                                    required={false}
                                />
                                {errors["location"] && <Error>{errors["location"]}</Error>}
                            </Field>

                            <Field>
                                <TextField
                                    label="Resource Registry Key"
                                    size={50}
                                    placeholder=""
                                    value={formValues["resourceRegistryKey"]}
                                    onChange={(e: any) => {
                                        setFormValues({ ...formValues, "resourceRegistryKey": e });
                                        formValidators["resourceRegistryKey"](e);
                                    }}
                                    required={false}
                                />
                                {errors["resourceRegistryKey"] && <Error>{errors["resourceRegistryKey"]}</Error>}
                            </Field>


                    <div style={{ textAlign: "right", marginTop: "10px" }}>
                        <Button appearance="primary" onClick={() => {
                            if (!(validateField("location", formValues["location"], true) || validateField("", formValues[""], true))) {
                                setFormValues({
                                    ...formValues, "location": undefined, "": undefined,
                                    "resources": [...formValues["resources"], [formValues["location"], formValues["resourceRegistryKey"], formValues[""]]]
                                });
                            }
                        }}>
                            Add
                        </Button>
                    </div>
                    {formValues["resources"] && formValues["resources"].length > 0 && (
                        <ComponentCard sx={cardStyle} disbaleHoverEffect>
                            <h3>Resources Table</h3>
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
                                {formValues["resources"].map((property: string, index: string) => (
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
                    <ComponentCard sx={cardStyle} disbaleHoverEffect>
                        <h3>Features</h3>

                            <Field>
                                <TextField
                                    label="Feature Name"
                                    size={50}
                                    placeholder=""
                                    value={formValues["featureName"]}
                                    onChange={(e: any) => {
                                        setFormValues({ ...formValues, "featureName": e });
                                        formValidators["featureName"](e);
                                    }}
                                    required={false}
                                />
                                {errors["featureName"] && <Error>{errors["featureName"]}</Error>}
                            </Field>

                            <Field>
                                <VSCodeCheckbox type="checkbox" checked={formValues["featureEnabled"]} onChange={(e: any) => {
                                    setFormValues({ ...formValues, "featureEnabled": e.target.checked });
                                    formValidators["featureEnabled"](e);
                                }
                                }>Feature Enabled </VSCodeCheckbox>
                                {errors["featureEnabled"] && <Error>{errors["featureEnabled"]}</Error>}
                            </Field>


                    <div style={{ textAlign: "right", marginTop: "10px" }}>
                        <Button appearance="primary" onClick={() => {
                            if (!(validateField("featureName", formValues["featureName"], true) || validateField("", formValues[""], true))) {
                                setFormValues({
                                    ...formValues, "featureName": undefined, "": undefined,
                                    "features": [...formValues["features"], [formValues["featureName"], formValues["featureEnabled"], formValues[""]]]
                                });
                            }
                        }}>
                            Add
                        </Button>
                    </div>
                    {formValues["features"] && formValues["features"].length > 0 && (
                        <ComponentCard sx={cardStyle} disbaleHoverEffect>
                            <h3>Features Table</h3>
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
                                {formValues["features"].map((property: string, index: string) => (
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

export default XSLTForm; 
