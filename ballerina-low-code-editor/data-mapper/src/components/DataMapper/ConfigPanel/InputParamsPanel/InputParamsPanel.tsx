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
import React, { useState } from "react";

import styled from "@emotion/styled";
import { WarningBanner } from "@wso2-enterprise/ballerina-low-code-edtior-ui-components";
import { NodePosition } from "@wso2-enterprise/syntax-tree";

import { Title } from "../DataMapperConfigPanel";
import { RecordButtonGroup } from "../RecordButtonGroup";

import { InputParamItem } from "./InputParam";
import { InputParamEditor } from "./InputParamEditor";
import { DataMapperInputParam } from "./types";

export interface InputConfigWidgetProps {
    inputParams: DataMapperInputParam[];
    isAddExistType: boolean;
    onUpdateParams: (newParams: DataMapperInputParam[]) => void;
    enableAddNewRecord: () => void;
    setAddExistType: (value: boolean) => void;
    imports: string[];
    fnSTPosition: NodePosition;
    currentFileContent: string;
}

export function InputParamsPanel(props: InputConfigWidgetProps) {
    const {
        inputParams,
        isAddExistType,
        onUpdateParams,
        enableAddNewRecord,
        setAddExistType,
        currentFileContent,
        fnSTPosition,
        imports
    } = props;

    const [editingIndex, setEditingIndex] = useState(-1);

    const hasInvalidInputs = inputParams.some(input => input.isUnsupported);

    const handleEnableAddNewRecord = () => {
        enableAddNewRecord();
    };

    const enableAddNew = () => {
        setAddExistType(true);
    };

    const disableAddNew = () => {
        setAddExistType(false);
    };

    const onAddNew = (param: DataMapperInputParam) => {
        onUpdateParams([...inputParams, param]);
        setAddExistType(false);
    };

    const onUpdate = (index: number, param: DataMapperInputParam) => {
        onUpdateParams([
            ...inputParams.slice(0, index),
            param,
            ...inputParams.slice(index + 1),
        ]);
        setEditingIndex(-1);
    };

    const onUpdateCancel = () => {
        setEditingIndex(-1);
    };

    const onEditClick = (index: number, param: DataMapperInputParam) => {
        setEditingIndex(index);
    };

    const onDeleteClick = (index: number, param: DataMapperInputParam) => {
        onUpdateParams([...inputParams.filter((item, i) => index !== i)]);
    };

    const typeUnsupportedBanner = hasInvalidInputs && (
        <Warning message='Only records are currently supported as data mapper inputs' />
    );

    return (
        <InputParamsContainer data-testid='dm-inputs'>
            <Title>Inputs</Title>
            {typeUnsupportedBanner}
            {inputParams.map((param, index) =>
                editingIndex === index ? (
                    <InputParamEditor
                        index={editingIndex}
                        param={param}
                        onUpdate={onUpdate}
                        onCancel={onUpdateCancel}
                        currentFileContent={currentFileContent}
                        fnSTPosition={fnSTPosition}
                        imports={imports}
                    />
                ) : (
                    <InputParamItem
                        index={index}
                        inputParam={param}
                        onEditClick={onEditClick}
                        onDelete={onDeleteClick}
                    />
                )
            )}
            {isAddExistType && (
                <InputParamEditor
                    param={{ name: "", type: "" }}
                    onSave={onAddNew}
                    onCancel={disableAddNew}
                    currentFileContent={currentFileContent}
                    fnSTPosition={fnSTPosition}
                    imports={imports}
                />
            )}
            {!isAddExistType && editingIndex === -1 && (
                <RecordButtonGroup
                    openRecordEditor={handleEnableAddNewRecord}
                    showTypeList={enableAddNew}
                />
            )}
        </InputParamsContainer>
    );
}

const InputParamsContainer = styled.div(() => ({}));

const Warning = styled(WarningBanner)`
    border-width: 1px !important;
    width: unset;
    margin: 5px 0;
`
