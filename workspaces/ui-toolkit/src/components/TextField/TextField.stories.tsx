/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
/* tslint:disable:variable-name */
import React from 'react';

import { TextField } from './TextField';

export default {
    title: 'TextField',
    component: TextField,
};

export const Text_Field_Comp = () =>
    (
        <>
            <TextField
                value="Sample Text1"
                label="TextField1"
                autoFocus
                errorMsg="Test Error"
                placeholder="placeholder"
                onChange={e => { console.log(e) }}
            />
            <TextField
                value="Sample Text2"
                label="TextField2"
                required
                errorMsg="Test Error"
                placeholder="placeholder"
                onChange={e => { console.log(e) }}
            />
            <TextField
                value="Sample Text3"
                required
                placeholder="placeholder"
                onChange={e => { console.log(e) }}
            />
        </>
    );
