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
            <TypeName isInvalid={inputParam.inInvalid}>{inputParam.type}</TypeName>
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
            <ClickToEditContainer isInvalid={inputParam.inInvalid} onClick={!inputParam.inInvalid && handleEdit}>
                {label}
            </ClickToEditContainer>
            <Box component="span" display="flex">
                {!inputParam.inInvalid && (
                    <EditButton
                        onClick={handleEdit}
                        icon={<EditIcon fontSize="small" />}
                    />
                )}
                <DeleteButton
                    onClick={handleDelete}
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
