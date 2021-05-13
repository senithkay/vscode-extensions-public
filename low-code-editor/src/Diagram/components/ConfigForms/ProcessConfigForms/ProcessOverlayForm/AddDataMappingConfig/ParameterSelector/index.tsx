/*
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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
// tslint:disable: jsx-wrap-multiline
// tslint:disable: jsx-no-lambda
import React, { ReactNode, useState } from 'react';

import { Box, FormHelperText, TextField, Typography } from '@material-ui/core';
import { AddRounded, CloseRounded } from '@material-ui/icons';
import classNames from 'classnames';

import { FormAutocomplete } from '../../../../../../components/Portals/ConfigForm/Elements/Autocomplete';
import { ButtonWithIcon } from '../../../../../Portals/ConfigForm/Elements/Button/ButtonWithIcon';
import { IconBtnWithText } from '../../../../../Portals/ConfigForm/Elements/Button/IconBtnWithText';
import { useStyles as useFormStyles } from "../../../../../Portals/ConfigForm/forms/style";
import { DataMapperInputTypeInfo } from "../../../../../Portals/ConfigForm/types";

interface ParameterSelectorProps {
    parameters: any[];
    insertParameter: (type: DataMapperInputTypeInfo) => void;
    removeParameter: (index: number) => void;
    types: DataMapperInputTypeInfo[];
}

export function ParameterSelector(props: ParameterSelectorProps) {
    const formClasses = useFormStyles();
    const { parameters, insertParameter, removeParameter, types } = props;

    const [parameterType, setParameterType] = useState<DataMapperInputTypeInfo>(undefined);

    const handleChangeVariableType = (evt: any, typeEntry: DataMapperInputTypeInfo) => {
        setParameterType(typeEntry);
    }

    const onParameterAddClick = () => {
        insertParameter(parameterType);
        setParameterType(undefined);
    }

    const parameterElements: ReactNode[] = [];

    parameters.forEach((element, index) => {
        const removeParam = () => {
            removeParameter(index);
        };
        parameterElements.push(
            <div key={index} className={formClasses.headerWrapper}>
                <div className={formClasses.headerLabel}>
                    {`${element.name} : ${element.type}`}
                    <ButtonWithIcon
                        className={formClasses.deleteBtn}
                        onClick={removeParam}
                        icon={<CloseRounded fontSize="small" />}
                    />
                </div>
            </div>
        )
    });

    return (
        <div>
            <div className={formClasses.formTitleWrapper}>
                <div className={formClasses.subtitle}>
                    <Typography variant="h4">
                        <Box paddingTop={2} paddingBottom={2}>Select Input Variables </Box>
                    </Typography>
                </div>
            </div>
            <FormAutocomplete
                itemList={types}
                label={'Select Variables:'}
                onChange={handleChangeVariableType}
                renderItem={(option) => (
                    <React.Fragment>
                        <span>{option.name}</span>
                        {option.type}
                    </React.Fragment>
                )}
                getItemLabel={(option) => option.name}
            />
            <IconBtnWithText
                onClick={onParameterAddClick}
                text="Add Variable"
                icon={<AddRounded fontSize="small" className={formClasses.iconButton} />}
                disabled={false}
            />
            {
                parameterElements.length > 0 &&
                <>
                    <br />
                    <FormHelperText className={formClasses.inputLabelForRequired}>Variables for Mapping :</FormHelperText>
                    <div className={classNames(formClasses.groupedForm, formClasses.marginTB)}>
                        {parameterElements}
                    </div>
                </>
            }
        </div>
    )
}
