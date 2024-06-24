/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 * 
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
*/

import React, { useEffect, useRef } from 'react';
import { AutoComplete, Button, ProgressIndicator, TextField, Typography } from '@wso2-enterprise/ui-toolkit';
import { VSCodeCheckbox } from '@vscode/webview-ui-toolkit/react';
import styled from '@emotion/styled';
import SidePanelContext from '../../SidePanelContexProvider';
import { AddMediatorProps } from '../mediators/common';
import { useVisualizerContext } from '@wso2-enterprise/mi-rpc-client';
import { getXML } from '../../../../utils/template-engine/mustach-templates/templateUtils';
import { MEDIATORS } from '../../../../resources/constants';
import { Controller, useForm } from 'react-hook-form';
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

const TransformationForm = (props: AddMediatorProps) => {
    const { rpcClient } = useVisualizerContext();
    const sidePanelContext = React.useContext(SidePanelContext);
    const [ isLoading, setIsLoading ] = React.useState(true);
    const handleOnCancelExprEditorRef = useRef(() => { });

    const { control, formState: { errors, dirtyFields }, handleSubmit, watch, reset } = useForm();

    useEffect(() => {
        reset({
            outputType: sidePanelContext?.formValues?.outputType || "XML",
            useColumnNumbers: sidePanelContext?.formValues?.useColumnNumbers || false,
            escapeNonPrintableCharacters: sidePanelContext?.formValues?.escapeNonPrintableCharacters || false,
            rdfBaseUri: sidePanelContext?.formValues?.rdfBaseUri || "",
            groupedElement: sidePanelContext?.formValues?.groupedElement || "",
            rowName: sidePanelContext?.formValues?.rowName || "",
            rowNamespace: sidePanelContext?.formValues?.rowNamespace || "",
            xsltPath: sidePanelContext?.formValues?.xsltPath || "",
        });
        setIsLoading(false);
    }, [sidePanelContext.formValues]);

    useEffect(() => {
        handleOnCancelExprEditorRef.current = () => {
            sidepanelGoBack(sidePanelContext);
        };
    }, [sidePanelContext.pageStack]);

    const onClick = async (values: any) => {
        
        // const xml = getXML(MEDIATORS.TRANSFORMATION, values, dirtyFields, sidePanelContext.formValues);
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

                <Field>
                    <Controller
                        name="outputType"
                        control={control}
                        render={({ field }) => (
                            <AutoComplete label="Output Type" name="outputType" items={["XML", "RDF", "JSON"]} value={field.value} onValueChange={(e: any) => {
                                field.onChange(e);
                            }} />
                        )}
                    />
                    {errors.outputType && <Error>{errors.outputType.message.toString()}</Error>}
                </Field>

                <Field>
                    <Controller
                        name="useColumnNumbers"
                        control={control}
                        render={({ field }) => (
                            <VSCodeCheckbox {...field} type="checkbox" checked={field.value} onChange={(e: any) => {field.onChange(e.target.checked)}}>Use Column Numbers</VSCodeCheckbox>
                        )}
                    />
                    {errors.useColumnNumbers && <Error>{errors.useColumnNumbers.message.toString()}</Error>}
                </Field>

                <Field>
                    <Controller
                        name="escapeNonPrintableCharacters"
                        control={control}
                        render={({ field }) => (
                            <VSCodeCheckbox {...field} type="checkbox" checked={field.value} onChange={(e: any) => {field.onChange(e.target.checked)}}>Escape Non-printable Characters</VSCodeCheckbox>
                        )}
                    />
                    {errors.escapeNonPrintableCharacters && <Error>{errors.escapeNonPrintableCharacters.message.toString()}</Error>}
                </Field>

                {watch("outputType") == "RDF" &&
                <Field>
                    <Controller
                        name="rdfBaseUri"
                        control={control}
                        render={({ field }) => (
                            <TextField {...field} label="RDF Base URI" size={50} placeholder="" />
                        )}
                    />
                    {errors.rdfBaseUri && <Error>{errors.rdfBaseUri.message.toString()}</Error>}
                </Field>
                }

                {watch("outputType") == "XML" &&
                <Field>
                    <Controller
                        name="groupedElement"
                        control={control}
                        render={({ field }) => (
                            <TextField {...field} label="Grouped by Element" size={50} placeholder="" />
                        )}
                    />
                    {errors.groupedElement && <Error>{errors.groupedElement.message.toString()}</Error>}
                </Field>
                }

                {watch("outputType") == "XML" &&
                <Field>
                    <Controller
                        name="rowName"
                        control={control}
                        render={({ field }) => (
                            <TextField {...field} label="Row Name" size={50} placeholder="" />
                        )}
                    />
                    {errors.rowName && <Error>{errors.rowName.message.toString()}</Error>}
                </Field>
                }

                {!((watch("outputType") == "JSON") ) &&
                <Field>
                    <Controller
                        name="rowNamespace"
                        control={control}
                        render={({ field }) => (
                            <TextField {...field} label="Row Namespace" size={50} placeholder="" />
                        )}
                    />
                    {errors.rowNamespace && <Error>{errors.rowNamespace.message.toString()}</Error>}
                </Field>
                }

                {!((watch("outputType") == "JSON") ) &&
                <Field>
                    <Controller
                        name="xsltPath"
                        control={control}
                        render={({ field }) => (
                            <TextField {...field} label="XSLT Path" size={50} placeholder="" />
                        )}
                    />
                    {errors.xsltPath && <Error>{errors.xsltPath.message.toString()}</Error>}
                </Field>
                }


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

export default TransformationForm; 
