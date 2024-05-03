/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect, useState } from 'react';
import { AutoComplete, Button, ComponentCard, RequiredFormInput, TextField, LinkButton } from '@wso2-enterprise/ui-toolkit';
import { VSCodeCheckbox, VSCodeDropdown, VSCodeOption } from '@vscode/webview-ui-toolkit/react';
import styled from '@emotion/styled';
import { useVisualizerContext } from '@wso2-enterprise/mi-rpc-client';
import SidePanelContext from '../SidePanelContexProvider';
import { create } from 'xmlbuilder2';
import { Range } from '@wso2-enterprise/mi-syntax-tree/lib/src';
import AddConnection from './AddConnection';
import { ParamConfig, ParamManager } from '../../Form/ParamManager/ParamManager';
import { ExpressionField, ExpressionFieldValue } from '../../Form/ExpressionField/ExpressionInput';

const cardStyle = {
    display: "block",
    margin: "5px 5px",
    padding: "10px 15px 15px 15px",
    width: "auto",
    cursor: "auto",
};

const Error = styled.span`
    color: var(--vscode-errorForeground);
    font-size: 12px;
`;

interface AddConnectorProps {
    formData: any;
    nodePosition: Range;
    documentUri: string;
    connectorName?: string;
    operationName?: string;
}

interface Element {
    inputType: any;
    name: string | number;
    displayName: any;
    required: string;
    helpTip: any;
    comboValues?: any[];
    defaultValue?: any;
    allowedConnectionTypes?: string[];
}

const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;
const nameWithoutSpecialCharactorsRegex = /^[a-zA-Z0-9]+$/g;

const AddConnector = (props: AddConnectorProps) => {
    const { formData, nodePosition, documentUri } = props;
    const { rpcClient } = useVisualizerContext();

    const sidePanelContext = React.useContext(SidePanelContext);
    const [formValues, setFormValues] = useState({} as any);
    const [errors, setErrors] = useState({} as any);
    const [isAddingConnection, setIsAddingConnection] = useState(false);
    const [connections, setConnections] = useState([] as any);
    const [allowedConnectionTypes, setAllowedConnectionTypes] = useState([]);

    const formValidators: { [key: string]: (e?: any) => string | undefined } = {};

    const paramConfigs: ParamConfig = {
        paramValues: [],
        paramFields: [
            {
                id: 0,
                type: "TextField",
                label: "Key",
                defaultValue: "",
                isRequired: true
            },
            {
                id: 1,
                type: "TextField",
                label: "Value",
                defaultValue: "",
                isRequired: true
            }]
    };

    const [params, setParams] = useState(paramConfigs);

    const handleOnChange = (params: any) => {
        const modifiedParams = {
            ...params, paramValues: params.paramValues.map((param: any) => {
                return {
                    ...param,
                    key: param.parameters[0].value,
                    value: param.parameters[1].value,
                    icon: "query"
                }
            })
        };
        setParams(modifiedParams);
    };

    useEffect(() => {
        if (props.formData && props.formData !== "") {
            const findAllowedConnectionTypes = (elements: any): string[] | undefined => {
                for (let element of elements) {
                    if (element.type === 'attribute' && element.value.inputType === 'connection') {
                        return element.value.allowedConnectionTypes;
                    }
                    if (element.type === 'attributeGroup') {
                        return findAllowedConnectionTypes(element.value.elements);
                    }
                }
            };

            (async () => {
                const allowedTypes = findAllowedConnectionTypes(props.formData.elements);
                setAllowedConnectionTypes(allowedTypes);

                const connectorData = await rpcClient.getMiDiagramRpcClient().getConnectorConnections({
                    documentUri: props.documentUri,
                    connectorName: props.formData?.connectorName ?? props.connectorName.toLowerCase().replace(/\s/g, '')
                });

                const filteredConnections = connectorData.connections.filter(
                    connection => allowedTypes?.includes(connection.connectionType));
                const connectorNames = filteredConnections.map(connector => connector.name);

                setConnections(connectorNames);
            })();
        }
    }, [props.formData]);

    useEffect(() => {
        if (sidePanelContext.formValues && Object.keys(sidePanelContext.formValues).length > 0) {
            const parametersValues = sidePanelContext.formValues.parameters.map((param: any) => ({
                [param.name]: param.value
            }));
            const flattenedParameters = Object.assign({}, ...parametersValues);
            setFormValues({ ...formValues, ...flattenedParameters });
        }
    }, [sidePanelContext.formValues]);

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

    const cancelConnection = () => {
        setIsAddingConnection(false);
    }

    const onClick = async () => {
        const newErrors = {} as any;
        Object.keys(formValidators).forEach((key) => {
            const error = formValidators[key]();
            if (error) {
                newErrors[key] = (error);
            }
        });

        params.paramValues.forEach(param => {
            formValues[param.key] = param.value;
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
        } else {
            const template = create();

            const connectorName = props.formData?.connectorName ??
                props.connectorName?.toLowerCase().replace(/\s/g, '') ??
                sidePanelContext.formValues.connectorName;

            const operationName = props.formData?.operationName ?? props.operationName ??
                sidePanelContext.formValues.operationName;

            const root = template.ele(`${connectorName}${operationName ? `.${operationName}` : ''}`);
            root.att('configKey', formValues['configKey']);

            // Fill the values
            Object.keys(formValues).forEach((key) => {
                if (key !== 'configRef' && key !== 'configKey') {
                    if (typeof formValues[key] === 'object' && formValues[key] !== null) {
                        // Handle expression input type
                        const namespaces = formValues[key].namespaces;
                        const value = formValues[key].value;
                        const isExpression = formValues[key].isExpression;

                        if (isExpression) {
                            if (namespaces && namespaces.length > 0) {
                                // Generate XML with namespaces
                                const element = root.ele(key);
                                namespaces.forEach((namespace: any) => {
                                    element.att(`xmlns:${namespace.prefix}`, namespace.uri);
                                });
                                element.txt(`{${value}}`);
                            } else{
                                root.ele(key).txt(`{${value}}`);
                            }
                        } else {
                            root.ele(key).txt(value);
                        }
                    } else {
                        root.ele(key).txt(formValues[key]);
                    }
                }
            });

            const modifiedXml = template.end({ prettyPrint: true, headless: true });

            rpcClient.getMiDiagramRpcClient().applyEdit({
                documentUri: documentUri, range: nodePosition, text: modifiedXml
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

    const onNewConnection = async (connectionName: string) => {
        setConnections([...connections, connectionName]);
        setIsAddingConnection(false);
    }

    const renderFormElement = (element: Element) => {
        switch (element.inputType) {
            case 'string':
                return (
                    <TextField
                        label={element.displayName}
                        size={50}
                        value={formValues[element.name] || ''}
                        onTextChange={(e: any) => {
                            setFormValues({ ...formValues, [element.name]: e });
                            formValidators[element.name](e);
                        }}
                        required={element.required === 'true'}
                        placeholder={element.helpTip}
                    />
                );
            case 'stringOrExpression':
                return (
                    <TextField
                        label={element.displayName}
                        size={50}
                        value={formValues[element.name] || ''}
                        onTextChange={(e: any) => {
                            setFormValues({ ...formValues, [element.name]: e });
                            formValidators[element.name](e);
                        }}
                        required={element.required === 'true'}
                        placeholder={element.helpTip}
                    />
                );
            case 'booleanOrExpression':
                return (
                    <>
                        <label>{element.displayName}</label> {element.required === "true" && <RequiredFormInput />}
                        <AutoComplete
                            identifier={element.displayName}
                            items={["true", "false"]}
                            value={formValues[element.name]}
                            onValueChange={(e: any) => {
                                setFormValues({ ...formValues, [element.name]: e });
                                formValidators[element.name](e);
                            }}
                            allowItemCreate={true}
                            required={element.required === 'true'} />
                    </>
                );
            case 'comboOrExpression':
                return (
                    <>
                        <label>{element.displayName}</label> {element.required && <RequiredFormInput />}
                        <AutoComplete
                            identifier={element.displayName}
                            items={element.comboValues}
                            value={formValues[element.name]}
                            onValueChange={(e: any) => {
                                setFormValues({ ...formValues, [element.name]: e });
                                formValidators[element.name](e);
                            }}
                            allowItemCreate={true}
                            required={element.required === 'true'} />
                    </>

                );
            case 'textAreaOrExpression':
                return (
                    <TextField
                        label={element.displayName}
                        size={50}
                        value={formValues[element.name] || ''}
                        onTextChange={(e: any) => {
                            setFormValues({ ...formValues, [element.name]: e });
                            formValidators[element.name](e);
                        }}
                        required={element.required === 'true'}
                        placeholder={element.helpTip}
                    />
                );
            case 'integerOrExpression':
                return (
                    <ExpressionField
                        label={element.displayName}
                        placeholder={element.helpTip}
                        value={{
                            "isExpression":true,
                            "value":formValues[element.name]?.value ?? '',
                            "namespaces":formValues[element.name]?.namespaces ?? []}}
                        canChange={true}
                        onChange={(e: any) => {
                            setFormValues({ ...formValues, [element.name]: e });
                            formValidators[element.name](e.value);
                        }}
                        openExpressionEditor={(value: ExpressionFieldValue, setValue: any) => {
                            sidePanelContext.setSidePanelState({
                                ...sidePanelContext,
                                expressionEditor: {
                                    isOpen: true,
                                    value,
                                    setValue
                                }
                            });
                        }}
                    />
                );
            case 'connection':
                formValues[element.name] = formValues[element.name] ?? element.allowedConnectionTypes[0];
                formValues['configKey'] = formValues['configKey'] ?? connections[0];
                return (<>
                    <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", width: '100%', gap: '10px' }}>
                        <div style={{ display: "flex", alignItems: "center", gap: '10px' }}>
                            <label>{element.displayName}</label>
                            {element.required && <RequiredFormInput />}
                        </div>
                        <LinkButton onClick={() => setIsAddingConnection(true)}>
                            Add new connection
                        </LinkButton>
                    </div>
                    <AutoComplete
                        identifier={element.displayName}
                        items={connections}
                        value={formValues['configKey']}
                        onValueChange={(e: any) => {
                            setFormValues({ ...formValues, ['configKey']: e });
                            formValidators[element.name](e);
                        }}
                        sx={{ color: 'var(--vscode-editor-foreground)', width: '100%', marginBottom: "10px" }} />
                </>);
            default:
                return null;
        }
    };

    const renderForm: any = (elements: any[]) => {
        return elements.map((element: { type: string; value: any; }) => {
            if (element.type === 'attribute') {
                formValidators[element.value.name] = (e?: any) => validateField(element.value.name, e, element.value.required === 'true', element.value.validation, element.value.regex);
                return <>
                    {renderFormElement(element.value)}
                    {errors[element.value.name] && <Error>{errors[element.value.name]}</Error>}
                </>;
            } else if (element.type === 'attributeGroup') {
                return (
                    <>
                        {element.value.groupName === "General" ? renderForm(element.value.elements) :
                            <>
                                <ComponentCard sx={cardStyle} disbaleHoverEffect>
                                    <h3 style={{ margin: '0 0 15px 0' }}>{element.value.groupName}</h3>
                                    {renderForm(element.value.elements)}
                                </ComponentCard>
                            </>
                        }
                    </>
                );
            }
            return null;
        });
    };

    return (
        <div style={{ padding: "10px" }}>
            {!formData ? (
                <>
                    <ParamManager
                        paramConfigs={params}
                        readonly={false}
                        onChange={handleOnChange} />
                    <div style={{ display: "flex", textAlign: "right", justifyContent: "flex-end", marginTop: "10px" }}>
                        <Button
                            appearance="primary"
                            onClick={onClick}
                        >
                            Submit
                        </Button>
                    </div>
                </>
            ) : isAddingConnection ?
                <AddConnection
                    allowedConnectionTypes={allowedConnectionTypes}
                    nodePosition={sidePanelContext.nodeRange}
                    documentUri={documentUri}
                    onNewConnection={onNewConnection}
                    cancelConnection={cancelConnection}
                    connectorName={props.formData?.connectorName ?? props.connectorName.toLowerCase().replace(/\s/g, '')} />
                :
                <>
                    {renderForm(props.formData.elements)}
                    <div style={{ display: "flex", textAlign: "right", justifyContent: "flex-end", marginTop: "10px" }}>
                        <Button
                            appearance="primary"
                            onClick={onClick}
                        >
                            Submit
                        </Button>
                    </div>
                </>
            }
        </div>
    );
};

export default AddConnector;
