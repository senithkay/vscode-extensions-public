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
import React from 'react';

// tslint:disable-next-line: no-submodule-imports
import {Story} from '@storybook/react/types-6-0';

import {StatementEditorButton} from "../../../../Portals/ConfigForm/Elements/Button/StatementEditorButton";
import {useStyles} from "../../../../Portals/ConfigForm/forms/style";

import {WhileForm, WhileFormProps} from "./WhileForm";


export default {
    title: 'Low Code Editor/Diagram/Statements/While',
    component: WhileForm,
};


const Template: Story<WhileFormProps> = (args: WhileFormProps) => {
    const classes = useStyles();
    return(
        <div className={classes.storyStyle}>
            <WhileForm {...args}/>
        </div>
    );
}

export const While = Template.bind({});
While.args = {
    statementEditor: <StatementEditorButton/>,
    expressionEditor: (
        <div className="exp-container">
            <input/>
        </div>
    )
};
