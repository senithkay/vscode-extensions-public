/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 * 
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
*/

import React, { useEffect, useRef } from 'react';
import { Button, ComponentCard, ProgressIndicator, Typography } from '@wso2-enterprise/ui-toolkit';
import styled from '@emotion/styled';
import SidePanelContext from '../../SidePanelContexProvider';
import { AddMediatorProps, getParamManagerValues, getParamManagerFromValues } from '../mediators/common';
import { useVisualizerContext } from '@wso2-enterprise/mi-rpc-client';
import { getXML } from '../../../../utils/template-engine/mustach-templates/templateUtils';
import { MEDIATORS } from '../../../../resources/constants';
import { Controller, useForm } from 'react-hook-form';
import { ParamManager, ParamValue } from '../../../Form/ParamManager/ParamManager';
import { sidepanelGoBack } from '../..';

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

const InputMappingsForm = (props: AddMediatorProps) => {
    const { rpcClient } = useVisualizerContext();
    const sidePanelContext = React.useContext(SidePanelContext);
    const [ isLoading, setIsLoading ] = React.useState(true);
    const handleOnCancelExprEditorRef = useRef(() => { });

    const { control, formState: { errors, dirtyFields }, handleSubmit, watch, reset } = useForm();

    useEffect(() => {
        reset({
            inputMappings: {
                paramValues: sidePanelContext?.formValues?.inputMappings ? getParamManagerFromValues(sidePanelContext?.formValues?.inputMappings, 0) : [],
                paramFields: [
                    {
                        "type": "TextField",
                        "label": "Mapping Name",
                        "defaultValue": "",
                        "isRequired": false
                    },
                    {
                        "type": "TextField",
                        "label": "Query Parameter",
                        "defaultValue": "",
                        "isRequired": false
                    },
                    {
                        "type": "Dropdown",
                        "label": "Parameter Type",
                        "defaultValue": "Scalar",
                        "isRequired": false,
                        "values": [
                            "Scalar",
                            "Array"
                        ]
                    },
                    {
                        "type": "Dropdown",
                        "label": "SQL Type",
                        "defaultValue": "String",
                        "isRequired": false,
                        "values": [
                            "String",
                            "Integer",
                            "Real",
                            "Double",
                            "Numeric",
                            "TINYINT",
                            "SMALLINT",
                            "BIGINT",
                            "DATE",
                            "TIME",
                            "TIMESTAMP",
                            "BIT",
                            "ORACLE REF CURSOR",
                            "BINARY",
                            "BLOB",
                            "CLOB",
                            "STRUCT",
                            "ARRAY",
                            "UUID",
                            "VARINT",
                            "INETADDRESS",
                            "QUERY_STRING"
                        ]
                    },
                    {
                        "type": "TextField",
                        "label": "Default Value",
                        "defaultValue": "",
                        "isRequired": false
                    },
                    {
                        "type": "Dropdown",
                        "label": "IN/OUT Type",
                        "defaultValue": "IN",
                        "isRequired": false,
                        "values": [
                            "IN",
                            "OUT",
                            "INOUT"
                        ]
                    },
                    {
                        "type": "TextField",
                        "label": "Ordinal",
                        "defaultValue": "",
                        "isRequired": false
                    },
                    {
                        "defaultValue": "",
                        "isRequired": false
                    },
                ]
            },
        });
        setIsLoading(false);
    }, [sidePanelContext.formValues]);

    useEffect(() => {
        handleOnCancelExprEditorRef.current = () => {
            sidepanelGoBack(sidePanelContext);
        };
    }, [sidePanelContext.pageStack]);

    const onClick = async (values: any) => {
        
        values["inputMappings"] = getParamManagerValues(values.inputMappings);
        // const xml = getXML(MEDIATORS.INPUTMAPPINGS, values, dirtyFields, sidePanelContext.formValues);
        // if (Array.isArray(xml)) {
        //     for (let i = 0; i < xml.length; i++) {
        //         await rpcClient.getMiDiagramRpcClient().applyEdit({
        //             documentUri: props.documentUri, range: xml[i].range, text: xml[i].text
        //         });
        //     }
        // } else {
        //     rpcClient.getMiDiagramRpcClient().applyEdit({
        //         documentUri: props.documentUri, range: props.nodePosition, text: xml
        //     });
        // }
        sidePanelContext.setSidePanelState({
            ...sidePanelContext,
            isOpen: false,
            isEditing: false,
            formValues: undefined,
            nodeRange: undefined,
            operationName: undefined
        });
    };

    if (isLoading) {
        return <ProgressIndicator/>;
    }
    return (
        <>
            <Typography sx={{ padding: "10px 20px", borderBottom: "1px solid var(--vscode-editorWidget-border)" }} variant="body3"></Typography>
            <div style={{ padding: "20px" }}>

                <ComponentCard sx={cardStyle} disbaleHoverEffect>
                    <Typography variant="h3">Input Mappings</Typography>
                

                    <Controller
                        name="inputMappings"
                        control={control}
                        render={({ field: { onChange, value } }) => (
                            <ParamManager
                                paramConfigs={value}
                                readonly={false}
                                onChange= {(values) => {
                                    values.paramValues = values.paramValues.map((param: any, index: number) => {
                                        const property: ParamValue[] = param.paramValues;
                                        param.key = property[0].value;
                                        param.value = property[1].value;
                                        param.icon = 'query';
                                        return param;
                                    });
                                    onChange(values);
                                }}
                            />
                        )}
                    />
                </ComponentCard>


                <div style={{ textAlign: "right", marginTop: "10px", float: "right" }}>
                    <Button
                        appearance="primary"
                        onClick={handleSubmit(onClick)}
                    >
                    Submit
                    </Button>
                </div>

            </div>
        </>
    );
};

export default InputMappingsForm; 
