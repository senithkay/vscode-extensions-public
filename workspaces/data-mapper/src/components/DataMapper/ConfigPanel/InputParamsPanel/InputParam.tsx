/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content."
 */
// tslint:disable: jsx-no-multiline-js
import React from "react";

import styled from "@emotion/styled";
import { Box } from "@material-ui/core";
import DeleteOutLineIcon from "@material-ui/icons/DeleteOutline";
import EditIcon from "@material-ui/icons/Edit";
import { ButtonWithIcon } from "@wso2-enterprise/ballerina-low-code-edtior-ui-components";

import { DataMapperInputParam } from "./types";

interface InputParamItemProps {
    index: number;
    inputParam: DataMapperInputParam;
    onDelete?: (index: number, inputParam: DataMapperInputParam) => void;
    onEditClick?: (index: number, inputParam: DataMapperInputParam) => void;
}

export function InputParamItem(props: InputParamItemProps) {
    const { index, inputParam, onDelete, onEditClick } = props;

    const label = (
        <>
            <TypeName isInvalid={inputParam.isUnsupported}>{inputParam.isArray ? `${inputParam.type}[]` : inputParam.type}</TypeName>
            <span>{" " + inputParam.name}</span>
        </>
    );

    const handleDelete = () => {
        onDelete(index, inputParam);
    };
    const handleEdit = () => {
        onEditClick(index, inputParam);
    };
    return (
        <InputParamContainer >
            <ClickToEditContainer isInvalid={inputParam.isUnsupported} onClick={!inputParam.isUnsupported && handleEdit}>
                {label}
            </ClickToEditContainer>
            <Box component="span" display="flex">
                {!inputParam.isUnsupported && (
                    <EditButton
                        onClick={handleEdit}
                        icon={<EditIcon fontSize="small" />}
                        dataTestId={`data-mapper-config-edit-input-${index}`}
                    />
                )}
                <DeleteButton
                    onClick={handleDelete}
                    dataTestId={`data-mapper-config-delete-input-${index}`}
                    icon={<DeleteOutLineIcon fontSize="small" />}
                />
            </Box>
        </InputParamContainer>
    );
}

const ClickToEditContainer = styled.div(({ isInvalid }: { isInvalid?: boolean }) => ({
    cursor: isInvalid ? 'auto' : 'pointer',
    width: '100%'
}));

const DeleteButton = styled(ButtonWithIcon)`
    padding: 0;
    color: #FE523C;
`;

const EditButton = styled(ButtonWithIcon)`
    padding: 0;
    margin-right: 5px;
    color: #36B475;
`;

const InputParamContainer = styled.div(() => ({
    background: 'white',
    padding: 10,
    borderRadius: 5,
    border: '1px solid #dee0e7',
    margin: '1rem 0 0.25rem',
    justifyContent: 'space-between',
    display: 'flex',
    width: '100%',
    alignItems: 'center'
}));

const TypeName = styled.span(({ isInvalid }: { isInvalid?: boolean }) => ({
    fontWeight: 500,
    color: `${isInvalid ? '#fe523c' : 'inherit'}`,
}));
