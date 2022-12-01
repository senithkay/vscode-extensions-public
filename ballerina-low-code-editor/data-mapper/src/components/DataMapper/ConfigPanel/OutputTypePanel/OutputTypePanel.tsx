/*
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 Inc. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
 */
// tslint:disable: jsx-no-multiline-js
import React from "react";

import styled from "@emotion/styled";
import DeleteOutLineIcon from "@material-ui/icons/DeleteOutline";
import { ButtonWithIcon, WarningBanner } from "@wso2-enterprise/ballerina-low-code-edtior-ui-components";

import { Title } from "../DataMapperConfigPanel";
import { DataMapperOutputParam } from "../InputParamsPanel/types";
import { RecordButtonGroup } from "../RecordButtonGroup";
import { CompletionResponseWithModule, TypeBrowser } from "../TypeBrowser";

export interface OutputConfigWidgetProps {
    outputType: DataMapperOutputParam;
    fetchingCompletions: boolean;
    handleShowOutputType: () => void;
    handleShowRecordEditor: () => void;
    handleOutputDeleteClick: () => void;
    handleOutputTypeChange: (type: string) => void;
    completions: CompletionResponseWithModule[]
}

export function OutputTypePanel(props: OutputConfigWidgetProps) {
    const {
        outputType,
        fetchingCompletions,
        handleShowOutputType,
        handleOutputTypeChange,
        handleShowRecordEditor,
        handleOutputDeleteClick,
        completions
    } = props;

    const typeUnsupportedBanner = outputType.inInvalid && (
        <Warning message='Only record type is currently supported as data mapper output' />
    );

    return (
        <OutputTypeConfigPanel data-testid='dm-output'>
            <Title>Output Type</Title>
            {!outputType.type ? (
                <>
                    <TypeBrowser
                        type={outputType.type}
                        onChange={handleOutputTypeChange}
                        isLoading={fetchingCompletions}
                        recordCompletions={completions}
                    />
                    <RecordButtonGroup openRecordEditor={handleShowRecordEditor} showTypeList={handleShowOutputType} />
                </>
            ) : (
                <>
                    {outputType.type && outputType.inInvalid && typeUnsupportedBanner}
                    <OutputTypeContainer isInvalid={outputType.inInvalid}>
                        <TypeName>{outputType.type}</TypeName>
                        <DeleteButton
                            onClick={handleOutputDeleteClick}
                            icon={<DeleteOutLineIcon fontSize="small" />}
                        />
                    </OutputTypeContainer>
                </>
            )}
        </OutputTypeConfigPanel>
    );
}

const OutputTypeContainer = styled.div(({ isInvalid }: { isInvalid?: boolean }) => ({
    background: "white",
    padding: 10,
    borderRadius: 5,
    border: "1px solid #dee0e7",
    color: `${isInvalid ? '#fe523c' : 'inherit'}`,
    margin: "1rem 0 0.25rem",
    justifyContent: "space-between",
    display: "flex",
    width: "100%",
    alignItems: "center",
}));

const OutputTypeConfigPanel = styled.div`
    width: 100%;
`;

const Warning = styled(WarningBanner)`
    border-width: 1px !important;
    width: unset;
    margin: 5px 0;
`

const DeleteButton = styled(ButtonWithIcon)`
    padding: 0;
    color: #fe523c;
`;

const TypeName = styled.span`
    font-weight: 500;
`;
