/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { GetRecordConfigResponse, GetRecordConfigRequest, LineRange, RecordTypeField, TypeField, PropertyTypeMemberInfo, UpdateRecordConfigRequest, RecordSourceGenRequest, RecordSourceGenResponse, GetRecordModelFromSourceRequest, GetRecordModelFromSourceResponse } from "@wso2-enterprise/ballerina-core";
import { Dropdown, HelperPane, Typography } from "@wso2-enterprise/ui-toolkit";
import styled from "@emotion/styled";
import { useEffect, useRef, useState } from "react";
import { useRpcContext } from "@wso2-enterprise/ballerina-rpc-client";
import { RecordConfigView } from "./RecordConfigView";


type ConfigureRecordPageProps = {
    fileName: string;
    targetLineRange: LineRange;
    onChange: (value: string, isRecordConfigureChange: boolean) => void;
    currentValue: string;
    recordTypeField: RecordTypeField;
};

export const LabelContainer = styled.div({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    paddingBottom: '20px'
});

export function ConfigureRecordPage(props: ConfigureRecordPageProps) {
    console.log("ConfigureRecordPage", props);
    const { fileName, targetLineRange, onChange, currentValue, recordTypeField } = props;
    const { rpcClient } = useRpcContext();

    const [recordModel, setRecordModel] = useState<TypeField[]>([]);
    const [selectedMemberName, setSelectedMemberName] = useState<string>("");
    const firstRender = useRef<boolean>(true);
    const sourceCode = useRef<string>(currentValue);
    const [isLoading, setIsLoading] = useState<boolean>(false);



    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
            if (currentValue) {
                getExistingRecordModel();
            } else {
                getNewRecordModel();
            }
        } else if (currentValue !== sourceCode.current) {
            // Only update if currentValue is different from our last known source code
            if (currentValue) {
                getExistingRecordModel();
            } else {
                getNewRecordModel();
            }
        }
    }, [currentValue]);


    const getExistingRecordModel = async () => {
        setIsLoading(true);
        const getRecordModelFromSourceRequest: GetRecordModelFromSourceRequest = {
            filePath: fileName,
            typeMembers: recordTypeField.recordTypeMembers,
            expr: currentValue
        }

        console.log("GET RECORD MODEL FROM SOURCE REQUEST", getRecordModelFromSourceRequest);

        const getRecordModelFromSourceResponse: GetRecordModelFromSourceResponse = await rpcClient.getBIDiagramRpcClient().getRecordModelFromSource(getRecordModelFromSourceRequest);
        console.log("GET RECORD MODEL FROM SOURCE RESPONSE", getRecordModelFromSourceResponse);
        const newRecordModel = getRecordModelFromSourceResponse.recordConfig;

        if (newRecordModel) {
            const recordConfig: TypeField = {
                name: newRecordModel.name,
                ...newRecordModel
            }

            setRecordModel([recordConfig]);
            setSelectedMemberName(newRecordModel.name);
        }

        setIsLoading(false);
    }

    const getNewRecordModel = async () => {
        setIsLoading(true);
        const defaultSelection = recordTypeField.recordTypeMembers[0];
        setSelectedMemberName(defaultSelection.type);

        let org = "";
        let module = "";
        let version = "";

        // Parse packageInfo if it exists and contains colon separators
        if (defaultSelection?.packageInfo) {
            const parts = defaultSelection.packageInfo.split(':');
            if (parts.length === 3) {
                [org, module, version] = parts;
            }
        }

        const request: GetRecordConfigRequest = {
            filePath: fileName,
            codedata: {
                org: org,
                module: module,
                version: version,
            },
            typeConstraint: defaultSelection.type,
        }
        const typeFieldResponse: GetRecordConfigResponse = await rpcClient.getBIDiagramRpcClient().getRecordConfig(request);
        if (typeFieldResponse.recordConfig) {

            console.log("TYPE FIELD RESPONSE", typeFieldResponse);

            const recordConfig: TypeField = {
                name: defaultSelection.type,
                ...typeFieldResponse.recordConfig
            }

            setRecordModel([recordConfig]);
        }

        setIsLoading(false);
    }

    const handleMemberChange = async (value: string) => {
        const member = recordTypeField.recordTypeMembers.find(m => m.type === value);
        if (member) {
            setIsLoading(true);
            setSelectedMemberName(member.type);

            let org = "";
            let module = "";
            let version = "";

            // Parse packageInfo if it exists
            if (member.packageInfo) {
                const parts = member.packageInfo.split(':');
                if (parts.length === 3) {
                    [org, module, version] = parts;
                }
            }

            const request: GetRecordConfigRequest = {
                filePath: fileName,
                codedata: {
                    org: org,
                    module: module,
                    version: version,
                },
                typeConstraint: member.type,
            }

            const typeFieldResponse: GetRecordConfigResponse = await rpcClient.getBIDiagramRpcClient().getRecordConfig(request);
            if (typeFieldResponse.recordConfig) {

                const recordConfig: TypeField = {
                    name: member.type,
                    ...typeFieldResponse.recordConfig
                }

                setRecordModel([recordConfig]);
            }
        }

        setIsLoading(false);
    };

    const handleModelChange = async (updatedModel: TypeField[]) => {
        const request: RecordSourceGenRequest = {
            filePath: fileName,
            type: updatedModel[0]
        }
        console.log("====>>> request for recordConfig: ", request);
        const recordSourceResponse: RecordSourceGenResponse = await rpcClient.getBIDiagramRpcClient().getRecordSource(request);
        console.log("====>>> recordSourceResponse: ", recordSourceResponse.recordValue);

        if (recordSourceResponse.recordValue) {
            const content = recordSourceResponse.recordValue;
            onChange(content, true);
            sourceCode.current = content;
        }
    }

    return (
        <>
            <HelperPane.Body>
                {isLoading ? (
                    <HelperPane.Loader />
                ) : (
                    <>
                        {recordTypeField?.recordTypeMembers.length > 1 && (
                            <LabelContainer>
                                <Dropdown
                                    id="type-selector"
                                    label="Type"
                                    value={selectedMemberName}
                                    items={recordTypeField.recordTypeMembers.map((member) => ({
                                        label: member.type,
                                        value: member.type
                                    }))}
                                    onValueChange={(value) => handleMemberChange(value)}
                                />

                            </LabelContainer>
                        )}
                        {selectedMemberName && recordModel ?
                            (
                                <RecordConfigView
                                    recordModel={recordModel}
                                    onModelChange={handleModelChange}
                                />
                            ) : (
                                <Typography variant="body3">No matching record found.</Typography>
                            )}
                    </>
                )}
            </HelperPane.Body>
        </>
    );
}
