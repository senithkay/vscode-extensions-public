/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useState } from 'react';
import { ComponentStory } from '@storybook/react';
import { ExpressionBar, ExpressionBarProps } from './ExpressionBar';

const Template: ComponentStory<typeof ExpressionBar> = (args: ExpressionBarProps) => {
    const [value, setValue] = useState('=');

    return <ExpressionBar {...args} value={value} onChange={setValue} />;
};

export const Default = Template.bind();
Default.args = {
    functionNames: [
        { label: 'fn1', description: 'Description of fn1', args: ['value1', 'value2'] },
        { label: 'fn2', description: 'Description of fn2', args: ['arg1', '[arg2, ...]'] },
        { label: 'fn3', description: 'Description of fn3' }
    ],
    autoFocus: true
};

export default { component: ExpressionBar, title: 'ExpressionBar' };

