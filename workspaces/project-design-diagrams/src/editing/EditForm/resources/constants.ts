/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { CSSProperties } from 'react';
import { SxProps } from '@mui/material';
import { Colors } from '../../../resources';

export const PackageNameRegex: RegExp = new RegExp('^[a-zA-Z0-9\.\_]+$');
export const OrganizationRegex: RegExp = new RegExp('^[a-zA-Z0-9\_]+$');
export const VersionRegex: RegExp = new RegExp('^[a-zA-Z0-9\.\-]+$');

export const PackageNameAntiRegex: RegExp = /[^a-zA-Z0-9_.]/g;

export const PackageNameRules: string = 'Can only contain alphanumerics, underscore, and period.';
export const OrganizationRules: string = 'Can only contain alphanumerics and underscore.';
export const VersioningRules: string = 'Should follow the SemVer best practices.';

export const ButtonColor: string = '#efeff5';

export const TypeInputProps: SxProps = {
    fontFamily: 'GilmerRegular',
    fontSize: '14px',
    height: '40px',
    margin: '10px'
}

export const TextFieldStyles: SxProps = {
    paddingTop: '5px',
    '& .MuiOutlinedInput-root': {
        '&.Mui-focused fieldset': {
            border: `1px solid ${Colors.PRIMARY}`
        }
    }
}

export const DefaultTextProps: CSSProperties = {
    fontFamily: 'GilmerRegular',
    fontSize: '13px'
}

export const DefaultSelectBoxStyles: SxProps = {
    ...DefaultTextProps,
    height: '40px',
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        border: `1px solid ${Colors.PRIMARY}`
    }
}
