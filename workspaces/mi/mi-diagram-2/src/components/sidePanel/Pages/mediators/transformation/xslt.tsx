/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 * 
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
*/


import React, { useEffect, useState } from 'react';
import { AutoComplete, Button, ComponentCard, ParamConfig, ParamManager, TextField } from '@wso2-enterprise/ui-toolkit';
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

const generatePropertyDisplayValue = (paramValues: any) => {
    const result: string = paramValues.parameters[0].value + " " + paramValues.parameters[2].value ?? paramValues.parameters[3].value;
    return result.trim();
};

const generateDisplayValue = (paramValues: any) => {
    const result: string = paramValues.parameters[0].value + " " + paramValues.parameters[1].value;
    return result.trim();
};

const XSLTForm = (props: AddMediatorProps) => {
    const { rpcClient } = useVisualizerContext();
    const sidePanelContext = React.useContext(SidePanelContext);
    const [formValues, setFormValues] = useState({} as { [key: string]: any });
    const [errors, setErrors] = useState({} as any);

    const propertyConfigs: ParamConfig = {
        paramValues: [],
        paramFields: [
            {
                id: 0,
                type: "TextField",
                label: "Property Name",
                defaultValue: "",
                isRequired: false
            },
            {
                id: 1,
                type: "Dropdown",
                label: "Property Value Type",
                defaultValue: "LITERAL",
                isRequired: false,
                values: ["LITERAL", "EXPRESSION"]
            },
            {
                id: 2,
                type: "TextField",
                label: "Proeprty Value",
                defaultValue: "default",
                isRequired: false,
                enableCondition: [{ 1: "LITERAL" }]
            },
            {
                id: 3,
                type: "TextField",
                label: "Property Expression",
                defaultValue: "",
                isRequired: false,
                enableCondition: [{ 1: "EXPRESSION" }]
            },
        ]
    };

    const resourceConfigs: ParamConfig = {
        paramValues: [],
        paramFields: [
            {
                id: 0,
                type: "TextField",
                label: "Location",
                defaultValue: "",
                isRequired: false
            },
            {
                id: 1,
                type: "TextField",
                label: "Resource Registry Key",
                defaultValue: "",
                isRequired: false
            },
        ]
    };

    const featureConfigs: ParamConfig = {
        paramValues: [],
        paramFields: [
            {
                id: 0,
                type: "TextField",
                label: "Feature Name",
                defaultValue: "",
                isRequired: false
            },
            {
                id: 1,
                type: "Checkbox",
                label: "Feature Enabled",
                defaultValue: false,
                isRequired: false
            },
        ]
    };

    const [properties, setProperties] = useState(propertyConfigs);
    const [resources, setResources] = useState(resourceConfigs);
    const [features, setFeatures] = useState(featureConfigs);

    const handleOnChangeProperties = (params: any) => {
        const modifiedParams = {
            ...params, paramValues: params.paramValues.map((param: any) => {
                return {
                    ...param,
                    key: param.parameters[0].value,
                    value: generatePropertyDisplayValue(param),
                    icon: "query"
                }
            })
        };
        setProperties(modifiedParams);
    };

    const handleOnChangeFeatures = (params: any) => {
        const modifiedParams = {
            ...params, paramValues: params.paramValues.map((param: any) => {
                return {
                    ...param,
                    key: param.parameters[0].value,
                    value: generateDisplayValue(param),
                    icon: "query"
                }
            })
        };
        setFeatures(modifiedParams);
    };

    const handleOnChangeResources = (params: any) => {
        const modifiedParams = {
            ...params, paramValues: params.paramValues.map((param: any) => {
                return {
                    ...param,
                    key: param.parameters[0].value,
                    value: generateDisplayValue(param),
                    icon: "query"
                }
            })
        };
        setResources(modifiedParams);
    };
    useEffect(() => {
        if (sidePanelContext.formValues && Object.keys(sidePanelContext.formValues).length > 0) {
            setFormValues({ ...formValues, ...sidePanelContext.formValues });
            if (sidePanelContext.formValues["properties"] && sidePanelContext.formValues["properties"].length > 0) {
                const paramValues = sidePanelContext.formValues["properties"].map((property: string, index: string) => (
                    {
                        id: index,
                        parameters: [
                            {
                                id: 0,
                                label: "propertyName",
                                type: "TextField",
                                value: property[0],
                                isRequired: false,
                            },
                            {
                                id: 1,
                                label: "propertyValueType",
                                type: "Dropdown",
                                value: property[1],
                                isRequired: false,
                                values: ["LITERAL", "EXPRESSION"]
                            },
                            {
                                id: 2,
                                label: "propertyValue",
                                type: "TextField",
                                value: property[2],
                                isRequired: false
                            },
                            {
                                id: 3,
                                label: "propertyExpression",
                                type: "TextField",
                                value: property[3],
                                isRequired: false,
                            }
                        ],
                        key: property[0],
                        value: property[2] ?? property[3],
                        icon: "query"
                    })
                );
                setProperties({ ...properties, paramValues: paramValues });

            }
            if (sidePanelContext.formValues["resources"] && sidePanelContext.formValues["resources"].length > 0) {
                const paramValues = sidePanelContext.formValues["resources"].map((property: string, index: string) => (
                    {
                        id: index,
                        parameters: [
                            {
                                id: 0,
                                label: "location",
                                type: "TextField",
                                value: property[0],
                                isRequired: false,
                            },
                            {
                                id: 1,
                                label: "resourceRegistryKey",
                                type: "TextField",
                                value: property[1],
                                isRequired: false,
                            }
                        ],
                        key: property[0],
                        value: property[1],
                        icon: "query"
                    })
                );
                setResources({ ...resources, paramValues: paramValues });
            }
            if (sidePanelContext.formValues["features"] && sidePanelContext.formValues["features"].length > 0) {
                const paramValues = sidePanelContext.formValues["features"].map((property: string, index: string) => (
                    {
                        id: index,
                        parameters: [
                            {
                                id: 0,
                                label: "featureName",
                                type: "TextField",
                                value: property[0],
                                isRequired: false,
                            },
                            {
                                id: 1,
                                label: "featureEnabled",
                                type: "Checkbox",
                                value: property[1],
                                isRequired: false,
                            }
                        ],
                        key: property[0],
                        value: property[1].toString(),
                        icon: "query"
                    })
                );
                setFeatures({ ...features, paramValues: paramValues });
            }
        } else {
            setFormValues({
                "xsltSchemaKeyType": "Static",
                "properties": [] as string[][],
                "propertyValueType": "LITERAL",
                "resources": [] as string[][],
                "features": [] as string[][],
            });
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
        processParamValues("properties", properties, 4);
        processParamValues("features", features, 2);
        processParamValues("resources", resources, 2);
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
        } else {
            const xml = getXML(MEDIATORS.XSLT, formValues);
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

    const processParamValues = (key: string, values: ParamConfig, index: number) => {
        formValues[key] = values.paramValues.map(param => param.parameters.slice(0, index).map(p => p.value));
        properties.paramValues.forEach(param => {
            param.parameters.slice(0, index).forEach(p => {
                let key = p.label.toLowerCase().replace(/\s/g, '');
                formValues[key] = p.value;
            });
        });
    }

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
                        <AutoComplete items={["Static", "Dynamic"]} value={formValues["xsltSchemaKeyType"]} onValueChange={(e: any) => {
                            setFormValues({ ...formValues, "xsltSchemaKeyType": e });
                            formValidators["xsltSchemaKeyType"](e);
                        }} />
                        {errors["xsltSchemaKeyType"] && <Error>{errors["xsltSchemaKeyType"]}</Error>}
                    </Field>

                    {formValues["xsltSchemaKeyType"] && formValues["xsltSchemaKeyType"].toLowerCase() == "static" &&
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

                    {formValues["xsltSchemaKeyType"] && formValues["xsltSchemaKeyType"].toLowerCase() == "dynamic" &&
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

                        {formValues["properties"] && (
                            <ParamManager
                                paramConfigs={properties}
                                readonly={false}
                                onChange={handleOnChangeProperties} />
                        )}
                    </ComponentCard>
                    <ComponentCard sx={cardStyle} disbaleHoverEffect>
                        <h3>Resources</h3>

                        {formValues["resources"] && (
                            <ParamManager
                                paramConfigs={resources}
                                readonly={false}
                                onChange={handleOnChangeResources} />
                        )}
                    </ComponentCard>
                    <ComponentCard sx={cardStyle} disbaleHoverEffect>
                        <h3>Features</h3>

                        {formValues["features"] && (
                            <ParamManager
                                paramConfigs={features}
                                readonly={false}
                                onChange={handleOnChangeFeatures} />
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

export default XSLTForm; 
