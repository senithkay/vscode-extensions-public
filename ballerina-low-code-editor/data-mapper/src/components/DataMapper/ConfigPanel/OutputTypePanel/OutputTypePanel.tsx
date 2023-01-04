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
// tslint:disable: jsx-no-lambda
import React from "react";

import styled from "@emotion/styled";
import DeleteOutLineIcon from "@material-ui/icons/DeleteOutline";
import { ButtonWithIcon, WarningBanner } from "@wso2-enterprise/ballerina-low-code-edtior-ui-components";

import { Title } from "../DataMapperConfigPanel";
import { InputParamEditor } from "../InputParamsPanel/InputParamEditor";
import { DataMapperOutputParam } from "../InputParamsPanel/types";
import { RecordButtonGroup } from "../RecordButtonGroup";
import { CompletionResponseWithModule, TypeBrowser } from "../TypeBrowser";
import { getTypeIncompatibilityMsg } from "../utils";

export interface OutputConfigWidgetProps {
    outputType: DataMapperOutputParam;
    fetchingCompletions: boolean;
    completions: CompletionResponseWithModule[]
    showOutputType: boolean;
    isArraySupported: boolean;
    handleShowOutputType: () => void;
    handleHideOutputType: () => void;
    handleOutputTypeChange: (type: string, isArray: boolean) => void;
    handleShowRecordEditor: () => void;
    handleOutputDeleteClick: () => void;
}

export function OutputTypePanel(props: OutputConfigWidgetProps) {
    const {
        outputType,
        fetchingCompletions,
        completions,
        showOutputType,
        isArraySupported,
        handleShowOutputType,
        handleHideOutputType,
        handleOutputTypeChange,
        handleShowRecordEditor,
        handleOutputDeleteClick
    } = props;

    const typeIncompatibilityMsg = outputType.isUnsupported
        && getTypeIncompatibilityMsg(outputType.typeNature, outputType.type, "output");
    const typeUnsupportedBanner = outputType.isUnsupported && (
        <Warning
            testId="unsupported-output-banner"
            message={typeIncompatibilityMsg}
        />
    );

    return (
        <OutputTypeConfigPanel data-testid='dm-output'>
            <Title>Output Type</Title>
            {!outputType.type ? (
                <>
                    {showOutputType && (
                        <InputParamEditor
                            onCancel={handleHideOutputType}
                            onUpdate={(_, param) => handleOutputTypeChange(param.type, param.isArray)}
                            loadingCompletions={fetchingCompletions}
                            completions={completions}
                            hideName={true}
                            isArraySupported={isArraySupported}
                        />
                    )}
                    <RecordButtonGroup openRecordEditor={handleShowRecordEditor} showTypeList={handleShowOutputType} />
                </>
            ) : (
                <>
                    <OutputTypeContainer isInvalid={outputType.isUnsupported}>
                        <TypeName>{outputType?.isArray ? `${outputType.type}[]` : outputType.type}</TypeName>
                        <DeleteButton
                            onClick={handleOutputDeleteClick}
                            icon={<DeleteOutLineIcon fontSize="small" />}
                            dataTestId="data-mapper-config-delete-output"
                        />
                    </OutputTypeContainer>
                    {outputType.type && outputType.isUnsupported && typeUnsupportedBanner}
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
