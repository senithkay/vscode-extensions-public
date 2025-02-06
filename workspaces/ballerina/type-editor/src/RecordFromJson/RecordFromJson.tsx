/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useState } from 'react';
import { Button, SidePanelBody, TextArea, CheckBox } from '@wso2-enterprise/ui-toolkit';
import styled from '@emotion/styled';
import { FileSelect } from '../style';
import { FileSelector } from '../components/FileSelector';
import { BallerinaRpcClient } from '@wso2-enterprise/ballerina-rpc-client';
import { JsonToRecord } from '@wso2-enterprise/ballerina-core';
import { NOT_SUPPORTED_TYPE } from '@wso2-enterprise/ballerina-core';

interface RecordFromJsonProps {
    name: string;
    onImport: () => void;
    onCancel: () => void;
    rpcClient: BallerinaRpcClient;
}

namespace S {
    export const Container = styled(SidePanelBody)`
        display: flex;
        flex-direction: column;
        gap: 20px;
    `;

    export const Footer = styled.div<{}>`
        display: flex;
        gap: 8px;
        flex-direction: row;
        justify-content: flex-end;
        align-items: center;
        margin-top: 8px;
        width: 100%;
    `;
}

export const RecordFromJson = (props: RecordFromJsonProps) => {
    const { name, onImport, onCancel, rpcClient } = props;
    const [json, setJson] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [isClosed, setIsClosed] = useState<boolean>(false);
    const [isSeparateDefinitions, setIsSeparateDefinitions] = useState<boolean>(false);

    const validateJson = (jsonString: string) => {
        try {
            if (jsonString.trim() === "") {
                setError("");
                return;
            }
            JSON.parse(jsonString);
            setError("");
        } catch (e) {
            setError("Invalid JSON format");
        }
    };

    const onJsonChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newJson = event.target.value;
        setJson(newJson);
        validateJson(newJson);
    }

    const onJsonUpload = (json: string) => {
        setJson(json);
        validateJson(json);
    }

    const importJsonAsRecord = async () => {
        const resp: JsonToRecord | NOT_SUPPORTED_TYPE = await rpcClient.getRecordCreatorRpcClient().convertJsonToRecord({
            jsonString: json,
            recordName: name,
            isClosed,
            isRecordTypeDesc: !isSeparateDefinitions,
        });
        console.log(resp);
    }

    return (
        <>
            <h4>Import Record From JSON</h4>
            <FileSelect>
                <FileSelector label="Select JSON file" extension="json" onReadFile={onJsonUpload} />
            </FileSelect>
            <TextArea
                rows={10}
                value={json}
                onChange={onJsonChange}
                errorMsg={error}
            />
            <CheckBox label="Is Closed" checked={isClosed} onChange={setIsClosed} />
            <CheckBox label="Is Separate Definitions" checked={isSeparateDefinitions} onChange={setIsSeparateDefinitions} />
            <S.Footer>
                <Button appearance="secondary" onClick={onCancel}>Cancel</Button>
                <Button onClick={importJsonAsRecord} disabled={!!error || !json.trim()}>Import</Button>
            </S.Footer>
        </>
    );
};
