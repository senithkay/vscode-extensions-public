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
import { VSCodeCheckbox } from '@vscode/webview-ui-toolkit/react';
import styled from '@emotion/styled';
import SidePanelContext from '../../../SidePanelContexProvider';
import { useVisualizerContext } from '@wso2-enterprise/mi-rpc-client';
import { getXML } from '../../../../../utils/template-engine/mustach-templates/templateUtils';
import { ENDPOINTS, MEDIATORS } from '../../../../../resources/constants';
import { AddMediatorProps } from '../../mediators/common';

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

const Wrapper = styled.div`
    display: "block",
    margin: "15px 0",
    padding: "0 15px 15px 15px",
    width: "auto",
    cursor: "auto"
`;

const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;
const nameWithoutSpecialCharactorsRegex = /^[a-zA-Z0-9]+$/g;

const HTTPEndpointForm = (props: AddMediatorProps) => {
    const { rpcClient } = useVisualizerContext();
    const sidePanelContext = React.useContext(SidePanelContext);
    const [formValues, setFormValues] = useState({} as { [key: string]: any });
    const [errors, setErrors] = useState({} as any);

    const propertyParamConfigs: ParamConfig = {
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
                label: "Scope",
                defaultValue: "default",
                isRequired: false,
                values: ["default", "transport", "axis2", "axis2-client"]
            },
            {
                id: 2,
                type: "Dropdown",
                label: "Value Type",
                defaultValue: "LITERAL",
                isRequired: false,
                values: ["LITERAL", "EXPRESSION"]
            },
            {
                id: 3,
                type: "TextField",
                label: "Value",
                defaultValue: "",
                isRequired: false,
                enableCondition: [{ "Value Type": "LITERAL" }]
            },
            {
                id: 4,
                type: "TextField",
                label: "Value Expression",
                defaultValue: "",
                isRequired: false,
                enableCondition: [{ "Value Type": "EXPRESSION" }]
            }]
    };

    const oauthParamConfigs: ParamConfig = {
        paramValues: [],
        paramFields: [
            {
                id: 0,
                type: "TextField",
                label: "Name",
                defaultValue: "",
                isRequired: false
            },
            {
                id: 2,
                type: "Dropdown",
                label: "Value Type",
                defaultValue: "LITERAL",
                isRequired: false,
                values: ["LITERAL", "EXPRESSION"]
            },
            {
                id: 3,
                type: "TextField",
                label: "Value",
                defaultValue: "",
                isRequired: false,
                enableCondition: [
                    { "Value Type": "LITERAL" }
                ]
            },
            {
                id: 4,
                type: "TextField",
                label: "Value Expression",
                defaultValue: "",
                isRequired: false,
                enableCondition: [
                    { "Value Type": "EXPRESSION" }
                ]
            }]
    };

    const [propertyParams, setPropertyParams] = useState(propertyParamConfigs);

    const handleOnChangeProperties = (params: any) => {
        setPropertyParams(params);
    };

    const [oauthParams, setOauthParams] = useState(oauthParamConfigs);

    const handleOnChangeOauth = (params: any) => {
        setOauthParams(params);
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
                                isRequired: false
                            },
                            {
                                id: 1,
                                label: "scope",
                                type: "Dropdown",
                                value: property[1],
                                isRequired: false,
                                values: ["default", "transport", "axis2", "axis2-client"]
                            },
                            {
                                id: 2,
                                label: "valueType",
                                type: "Dropdown",
                                value: property[2],
                                isRequired: false,
                                values: ["LITERAL", "EXPRESSION"]
                            },
                            {
                                id: 3,
                                label: "value",
                                type: "TextField",
                                value: property[3],
                                isRequired: false
                            },
                            {
                                id: 4,
                                label: "valueExpression",
                                type: "TextField",
                                value: property[4],
                                isRequired: false
                            }
                        ]
                    })
                )
                setPropertyParams({ ...propertyParams, paramValues: paramValues });
            }
            if (sidePanelContext.formValues["oauthParameters"] && sidePanelContext.formValues["oauthParameters"].length > 0) {
                const paramValues = sidePanelContext.formValues["oauthParameters"].map((property: string, index: string) => (
                    {
                        id: index,
                        parameters: [
                            {
                                id: 0,
                                label: "name",
                                type: "TextField",
                                value: property[0],
                                isRequired: false
                            },
                            {
                                id: 2,
                                label: "valueType",
                                type: "Dropdown",
                                value: property[1],
                                isRequired: false,
                                values: ["LITERAL", "EXPRESSION"]
                            },
                            {
                                id: 3,
                                label: "value",
                                type: "TextField",
                                value: property[2],
                                isRequired: false
                            },
                            {
                                id: 4,
                                label: "valueExpression",
                                type: "TextField",
                                value: property[3],
                                isRequired: false
                            }
                        ]
                    })
                )
                setOauthParams({ ...oauthParams, paramValues: paramValues });
            }
        } else {
            setFormValues({
                "statisticsEnabled": false,
                "traceEnabled": false,
                "httpMethod": "GET",
                "properties": [] as string[][],
                "scope": "default",
                "valueType": "LITERAL",
                "authType": "None",
                "oauthGrantType": "Password Credentials",
                "oauthAuthenticationMode": "Header",
                "oauthParameters": [] as string[][],
                "OAuthProperties.scope": "default",
                "OAuthProperties.valueType": "LITERAL",
                "reliableMessagingEnabled": false,
                "securityEnabled": false,
                "addressingEnabled": false,
                "timeoutAction": "never",
                "optimize": "LEAVE_AS_IS",
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

        formValues["properties"] = propertyParams.paramValues.map(param => param.parameters.slice(0, 5).map(p => p.value));
        propertyParams.paramValues.forEach(param => {
            param.parameters.slice(0, 5).forEach(p => {
                let key = p.label.toLowerCase().replace(/\s/g, '');
                formValues[key] = p.value;
            });
        });

        formValues["oauthParameters"] = oauthParams.paramValues.map(param => param.parameters.slice(0, 5).map(p => p.value));
        propertyParams.paramValues.forEach(param => {
            param.parameters.slice(0, 5).forEach(p => {
                let key = p.label.toLowerCase().replace(/\s/g, '');
                formValues[key] = p.value;
            });
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
        } else {
            const xml = getXML(ENDPOINTS.HTTP, formValues);
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
        "statisticsEnabled": (e?: any) => validateField("statisticsEnabled", e, false),
        "traceEnabled": (e?: any) => validateField("traceEnabled", e, false),
        "uriTemplate": (e?: any) => validateField("uriTemplate", e, false),
        "httpMethod": (e?: any) => validateField("httpMethod", e, false),
        "name": (e?: any) => validateField("name", e, false),
        "scope": (e?: any) => validateField("scope", e, false),
        "valueType": (e?: any) => validateField("valueType", e, false),
        "value": (e?: any) => validateField("value", e, false),
        "valueExpression": (e?: any) => validateField("valueExpression", e, false),
        "authType": (e?: any) => validateField("authType", e, false),
        "basicAuthUsername": (e?: any) => validateField("basicAuthUsername", e, false),
        "basicAuthPassword": (e?: any) => validateField("basicAuthPassword", e, false),
        "oauthGrantType": (e?: any) => validateField("oauthGrantType", e, false),
        "clientId": (e?: any) => validateField("clientId", e, false),
        "clientSecret": (e?: any) => validateField("clientSecret", e, false),
        "refreshToken": (e?: any) => validateField("refreshToken", e, false),
        "oauthUsername": (e?: any) => validateField("oauthUsername", e, false),
        "oauthPassword": (e?: any) => validateField("oauthPassword", e, false),
        "tokenUrl": (e?: any) => validateField("tokenUrl", e, false),
        "oauthAuthenticationMode": (e?: any) => validateField("oauthAuthenticationMode", e, false),
        "OAuthProperties.name": (e?: any) => validateField("OAuthProperties.name", e, false),
        "OAuthProperties.scope": (e?: any) => validateField("OAuthProperties.scope", e, false),
        "OAuthProperties.valueType": (e?: any) => validateField("OAuthProperties.valueType", e, false),
        "OAuthProperties.value": (e?: any) => validateField("OAuthProperties.value", e, false),
        "OAuthProperties.valueExpression": (e?: any) => validateField("OAuthProperties.valueExpression", e, false),
        "suspendErrorCodes": (e?: any) => validateField("suspendErrorCodes", e, false),
        "suspendInitialDuration": (e?: any) => validateField("suspendInitialDuration", e, false),
        "suspendMaximumDuration": (e?: any) => validateField("suspendMaximumDuration", e, false),
        "suspendProgressionFactor": (e?: any) => validateField("suspendProgressionFactor", e, false),
        "retryErrorCodes": (e?: any) => validateField("retryErrorCodes", e, false),
        "retryCount": (e?: any) => validateField("retryCount", e, false),
        "retryDelay": (e?: any) => validateField("retryDelay", e, false),
        "reliableMessagingEnabled": (e?: any) => validateField("reliableMessagingEnabled", e, false),
        "securityEnabled": (e?: any) => validateField("securityEnabled", e, false),
        "addressingEnabled": (e?: any) => validateField("addressingEnabled", e, false),
        "timeoutDuration": (e?: any) => validateField("timeoutDuration", e, false),
        "timeoutAction": (e?: any) => validateField("timeoutAction", e, false),
        "optimize": (e?: any) => validateField("optimize", e, false),
        "failoverNonRetryErrorCodes": (e?: any) => validateField("failoverNonRetryErrorCodes", e, false),
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

            <Wrapper>
                <h3>Basic</h3>

                <Field>
                    <VSCodeCheckbox type="checkbox" checked={formValues["statisticsEnabled"]} onChange={(e: any) => {
                        setFormValues({ ...formValues, "statisticsEnabled": e.target.checked });
                        formValidators["statisticsEnabled"](e);
                    }
                    }>Statistics Enabled </VSCodeCheckbox>
                    {errors["statisticsEnabled"] && <Error>{errors["statisticsEnabled"]}</Error>}
                </Field>

                <Field>
                    <VSCodeCheckbox type="checkbox" checked={formValues["traceEnabled"]} onChange={(e: any) => {
                        setFormValues({ ...formValues, "traceEnabled": e.target.checked });
                        formValidators["traceEnabled"](e);
                    }
                    }>Trace Enabled </VSCodeCheckbox>
                    {errors["traceEnabled"] && <Error>{errors["traceEnabled"]}</Error>}
                </Field>

                <Field>
                    <TextField
                        label="URI Template"
                        size={50}
                        placeholder=""
                        value={formValues["uriTemplate"]}
                        onChange={(e: any) => {
                            setFormValues({ ...formValues, "uriTemplate": e });
                            formValidators["uriTemplate"](e);
                        }}
                        required={false}
                    />
                    {errors["uriTemplate"] && <Error>{errors["uriTemplate"]}</Error>}
                </Field>

                <Field>
                    <label>HTTP Method</label>
                    <AutoComplete items={["GET", "POST", "PUT", "DELETE", "HEAD", "OPTIONS", "PATCH", "Leave_as_is"]} selectedItem={formValues["httpMethod"]} onChange={(e: any) => {
                        setFormValues({ ...formValues, "httpMethod": e });
                        formValidators["httpMethod"](e);
                    }} />
                    {errors["httpMethod"] && <Error>{errors["httpMethod"]}</Error>}
                </Field>

            </Wrapper>

            <Wrapper>
                <h3>Advanced</h3>

                <ComponentCard sx={cardStyle} disbaleHoverEffect>
                    <h3>Endpoint Properties</h3>

                    <ComponentCard sx={cardStyle} disbaleHoverEffect>
                        <h3>Properties</h3>

                        {formValues["properties"] && (
                            <ParamManager
                                paramConfigs={propertyParams}
                                readonly={false}
                                onChange={handleOnChangeProperties} />
                        )}
                    </ComponentCard>
                </ComponentCard>

                <ComponentCard sx={cardStyle} disbaleHoverEffect>
                    <h3>Auth Configurations</h3>

                    <Field>
                        <label>Auth Type</label>
                        <AutoComplete items={["None", "Basic Auth", "OAuth"]} selectedItem={formValues["authType"]} onChange={(e: any) => {
                            setFormValues({ ...formValues, "authType": e });
                            formValidators["authType"](e);
                        }} />
                        {errors["authType"] && <Error>{errors["authType"]}</Error>}
                    </Field>

                    {formValues["authType"] && formValues["authType"].toLowerCase() == "basic auth" &&
                        <Field>
                            <TextField
                                label="Basic Auth Username"
                                size={50}
                                placeholder=""
                                value={formValues["basicAuthUsername"]}
                                onChange={(e: any) => {
                                    setFormValues({ ...formValues, "basicAuthUsername": e });
                                    formValidators["basicAuthUsername"](e);
                                }}
                                required={false}
                            />
                            {errors["basicAuthUsername"] && <Error>{errors["basicAuthUsername"]}</Error>}
                        </Field>
                    }

                    {formValues["authType"] && formValues["authType"].toLowerCase() == "basic auth" &&
                        <Field>
                            <TextField
                                label="Basic Auth Password"
                                size={50}
                                placeholder=""
                                value={formValues["basicAuthPassword"]}
                                onChange={(e: any) => {
                                    setFormValues({ ...formValues, "basicAuthPassword": e });
                                    formValidators["basicAuthPassword"](e);
                                }}
                                required={false}
                            />
                            {errors["basicAuthPassword"] && <Error>{errors["basicAuthPassword"]}</Error>}
                        </Field>
                    }

                    {formValues["authType"] && formValues["authType"].toLowerCase() == "oauth" &&
                        <Field>
                            <label>OAuth Grant Type</label>
                            <AutoComplete items={["Authorization Code", "Client Credentials", "Password Credentials"]} selectedItem={formValues["oauthGrantType"]} onChange={(e: any) => {
                                setFormValues({ ...formValues, "oauthGrantType": e });
                                formValidators["oauthGrantType"](e);
                            }} />
                            {errors["oauthGrantType"] && <Error>{errors["oauthGrantType"]}</Error>}
                        </Field>
                    }

                    {formValues["authType"] && formValues["authType"].toLowerCase() == "oauth" &&
                        <Field>
                            <TextField
                                label="Client ID"
                                size={50}
                                placeholder=""
                                value={formValues["clientId"]}
                                onChange={(e: any) => {
                                    setFormValues({ ...formValues, "clientId": e });
                                    formValidators["clientId"](e);
                                }}
                                required={false}
                            />
                            {errors["clientId"] && <Error>{errors["clientId"]}</Error>}
                        </Field>
                    }

                    {formValues["authType"] && formValues["authType"].toLowerCase() == "oauth" &&
                        <Field>
                            <TextField
                                label="Client Secret"
                                size={50}
                                placeholder=""
                                value={formValues["clientSecret"]}
                                onChange={(e: any) => {
                                    setFormValues({ ...formValues, "clientSecret": e });
                                    formValidators["clientSecret"](e);
                                }}
                                required={false}
                            />
                            {errors["clientSecret"] && <Error>{errors["clientSecret"]}</Error>}
                        </Field>
                    }

                    {formValues["authType"] && formValues["authType"].toLowerCase() == "oauth" && formValues["oauthGrantType"] && formValues["oauthGrantType"].toLowerCase() == "authorization code" &&
                        <Field>
                            <TextField
                                label="Refresh Token"
                                size={50}
                                placeholder=""
                                value={formValues["refreshToken"]}
                                onChange={(e: any) => {
                                    setFormValues({ ...formValues, "refreshToken": e });
                                    formValidators["refreshToken"](e);
                                }}
                                required={false}
                            />
                            {errors["refreshToken"] && <Error>{errors["refreshToken"]}</Error>}
                        </Field>
                    }

                    {formValues["authType"] && formValues["authType"].toLowerCase() == "oauth" && formValues["oauthGrantType"] && formValues["oauthGrantType"].toLowerCase() == "password credentials" &&
                        <Field>
                            <TextField
                                label="OAuth Username"
                                size={50}
                                placeholder=""
                                value={formValues["oauthUsername"]}
                                onChange={(e: any) => {
                                    setFormValues({ ...formValues, "oauthUsername": e });
                                    formValidators["oauthUsername"](e);
                                }}
                                required={false}
                            />
                            {errors["oauthUsername"] && <Error>{errors["oauthUsername"]}</Error>}
                        </Field>
                    }
                    {formValues["authType"] && formValues["authType"].toLowerCase() == "oauth" && formValues["oauthGrantType"] && formValues["oauthGrantType"].toLowerCase() == "password credentials" &&
                        <Field>
                            <TextField
                                label="OAuth Password"
                                size={50}
                                placeholder=""
                                value={formValues["oauthPassword"]}
                                onChange={(e: any) => {
                                    setFormValues({ ...formValues, "oauthPassword": e });
                                    formValidators["oauthPassword"](e);
                                }}
                                required={false}
                            />
                            {errors["oauthPassword"] && <Error>{errors["oauthPassword"]}</Error>}
                        </Field>
                    }
                    {formValues["authType"] && formValues["authType"].toLowerCase() == "oauth" &&
                        <Field>
                            <TextField
                                label="Token URL"
                                size={50}
                                placeholder=""
                                value={formValues["tokenUrl"]}
                                onChange={(e: any) => {
                                    setFormValues({ ...formValues, "tokenUrl": e });
                                    formValidators["tokenUrl"](e);
                                }}
                                required={false}
                            />
                            {errors["tokenUrl"] && <Error>{errors["tokenUrl"]}</Error>}
                        </Field>
                    }

                    {formValues["authType"] && formValues["authType"].toLowerCase() == "oauth" &&
                        <Field>
                            <label>OAuth Authentication Mode</label>
                            <AutoComplete items={["Header", "Payload"]} selectedItem={formValues["oauthAuthenticationMode"]} onChange={(e: any) => {
                                setFormValues({ ...formValues, "oauthAuthenticationMode": e });
                                formValidators["oauthAuthenticationMode"](e);
                            }} />
                            {errors["oauthAuthenticationMode"] && <Error>{errors["oauthAuthenticationMode"]}</Error>}
                        </Field>
                    }

                    {formValues["authType"] && formValues["authType"].toLowerCase() == "oauth" &&
                        <ComponentCard sx={cardStyle} disbaleHoverEffect>
                            <h3>OAuth Parameters</h3>

                        {formValues["oauthParameters"] && (
                            <ParamManager
                                paramConfigs={oauthParams}
                                readonly={false}
                                onChange={handleOnChangeOauth} />
                        )}
                    </ComponentCard>}
                </ComponentCard>

                <ComponentCard sx={cardStyle} disbaleHoverEffect>
                    <h3>Endpoint Suspend State</h3>

                    <Field>
                        <TextField
                            label="Suspend Error Codes"
                            size={50}
                            placeholder=""
                            value={formValues["suspendErrorCodes"]}
                            onChange={(e: any) => {
                                setFormValues({ ...formValues, "suspendErrorCodes": e });
                                formValidators["suspendErrorCodes"](e);
                            }}
                            required={false}
                        />
                        {errors["suspendErrorCodes"] && <Error>{errors["suspendErrorCodes"]}</Error>}
                    </Field>

                    <Field>
                        <TextField
                            label="Suspend Initial Duration"
                            size={50}
                            placeholder=""
                            value={formValues["suspendInitialDuration"]}
                            onChange={(e: any) => {
                                setFormValues({ ...formValues, "suspendInitialDuration": e });
                                formValidators["suspendInitialDuration"](e);
                            }}
                            required={false}
                        />
                        {errors["suspendInitialDuration"] && <Error>{errors["suspendInitialDuration"]}</Error>}
                    </Field>

                    <Field>
                        <TextField
                            label="Suspend Maximum Duration"
                            size={50}
                            placeholder=""
                            value={formValues["suspendMaximumDuration"]}
                            onChange={(e: any) => {
                                setFormValues({ ...formValues, "suspendMaximumDuration": e });
                                formValidators["suspendMaximumDuration"](e);
                            }}
                            required={false}
                        />
                        {errors["suspendMaximumDuration"] && <Error>{errors["suspendMaximumDuration"]}</Error>}
                    </Field>

                    <Field>
                        <TextField
                            label="Suspend Progression Factor"
                            size={50}
                            placeholder=""
                            value={formValues["suspendProgressionFactor"]}
                            onChange={(e: any) => {
                                setFormValues({ ...formValues, "suspendProgressionFactor": e });
                                formValidators["suspendProgressionFactor"](e);
                            }}
                            required={false}
                        />
                        {errors["suspendProgressionFactor"] && <Error>{errors["suspendProgressionFactor"]}</Error>}
                    </Field>

                </ComponentCard>

                <ComponentCard sx={cardStyle} disbaleHoverEffect>
                    <h3>Endpoint Timeout State</h3>

                    <Field>
                        <TextField
                            label="Retry Error Codes"
                            size={50}
                            placeholder=""
                            value={formValues["retryErrorCodes"]}
                            onChange={(e: any) => {
                                setFormValues({ ...formValues, "retryErrorCodes": e });
                                formValidators["retryErrorCodes"](e);
                            }}
                            required={false}
                        />
                        {errors["retryErrorCodes"] && <Error>{errors["retryErrorCodes"]}</Error>}
                    </Field>

                    <Field>
                        <TextField
                            label="Retry Count"
                            size={50}
                            placeholder=""
                            value={formValues["retryCount"]}
                            onChange={(e: any) => {
                                setFormValues({ ...formValues, "retryCount": e });
                                formValidators["retryCount"](e);
                            }}
                            required={false}
                        />
                        {errors["retryCount"] && <Error>{errors["retryCount"]}</Error>}
                    </Field>

                    <Field>
                        <TextField
                            label="Retry Delay"
                            size={50}
                            placeholder=""
                            value={formValues["retryDelay"]}
                            onChange={(e: any) => {
                                setFormValues({ ...formValues, "retryDelay": e });
                                formValidators["retryDelay"](e);
                            }}
                            required={false}
                        />
                        {errors["retryDelay"] && <Error>{errors["retryDelay"]}</Error>}
                    </Field>

                </ComponentCard>

                <ComponentCard sx={cardStyle} disbaleHoverEffect>
                    <h3>Timeout</h3>

                    <Field>
                        <TextField
                            label="Timeout Duration"
                            size={50}
                            placeholder=""
                            value={formValues["timeoutDuration"]}
                            onChange={(e: any) => {
                                setFormValues({ ...formValues, "timeoutDuration": e });
                                formValidators["timeoutDuration"](e);
                            }}
                            required={false}
                        />
                        {errors["timeoutDuration"] && <Error>{errors["timeoutDuration"]}</Error>}
                    </Field>

                    <Field>
                        <label>Timeout Action</label>
                        <AutoComplete items={["never", "discard", "fault"]} selectedItem={formValues["timeoutAction"]} onChange={(e: any) => {
                            setFormValues({ ...formValues, "timeoutAction": e });
                            formValidators["timeoutAction"](e);
                        }} />
                        {errors["timeoutAction"] && <Error>{errors["timeoutAction"]}</Error>}
                    </Field>

                </ComponentCard>

                {/* <Field>
                    <label>Optimize</label>
                    <AutoComplete items={["LEAVE_AS_IS", "mtom", "swa"]} selectedItem={formValues["optimize"]} onChange={(e: any) => {
                        setFormValues({ ...formValues, "optimize": e });
                        formValidators["optimize"](e);
                    }} />
                    {errors["optimize"] && <Error>{errors["optimize"]}</Error>}
                </Field> */}

                <ComponentCard sx={cardStyle} disbaleHoverEffect>
                    <h3>Failover Error Codes</h3>

                    <Field>
                        <TextField
                            label="Failover Non Retry Error Codes"
                            size={50}
                            placeholder=""
                            value={formValues["failoverNonRetryErrorCodes"]}
                            onChange={(e: any) => {
                                setFormValues({ ...formValues, "failoverNonRetryErrorCodes": e });
                                formValidators["failoverNonRetryErrorCodes"](e);
                            }}
                            required={false}
                        />
                        {errors["failoverNonRetryErrorCodes"] && <Error>{errors["failoverNonRetryErrorCodes"]}</Error>}
                    </Field>

                </ComponentCard>

            </Wrapper>

            <Wrapper>
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

            </Wrapper>


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

export default HTTPEndpointForm; 
