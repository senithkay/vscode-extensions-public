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
import { ExpressionBar, ExpressionBarProps, ITEM_TYPE_KIND } from './ExpressionBar';

const Template: ComponentStory<typeof ExpressionBar> = (args: ExpressionBarProps) => {
    const [value, setValue] = useState('');

    return <ExpressionBar {...args} value={value} onChange={async (text: string) => setValue(text)} />;
};

export const Default = Template.bind();
Default.args = {
    autoFocus: true,
    getCompletions: () => {
        return [
            { tag: 'utils', label: 'fn1', value: 'utils.fn1', description: 'Description of fn1', args: ['value1', 'value2'], kind: ITEM_TYPE_KIND.Function },
            { tag: 'utils', label: 'fn2', value: 'utils.fn2', description: 'Description of fn2', args: ['arg1', '...args'], kind: ITEM_TYPE_KIND.Function },
            { tag: 'utils', label: 'fn3', value: 'utils.fn3', description: 'Description of fn3', kind: ITEM_TYPE_KIND.Function },
            { label: 'user', value: 'user', kind: ITEM_TYPE_KIND.Parameter },
            { label: 'name', value: 'name', kind: ITEM_TYPE_KIND.Property },
            { label: 'age', value: 'age', kind: ITEM_TYPE_KIND.Property },
            { label: 'email', value: 'email', kind: ITEM_TYPE_KIND.Property }
        ];
    },
    onItemSelect: (text: string) => {
        console.log('--- Item Selected ---')
        console.log(`Updated TextField: ${text}`);
    },
    onSave: (text: string) => {
        console.log('--- Saved ---');
        console.log(`Updated TextField: ${text}`);
    }
};

export default { component: ExpressionBar, title: 'ExpressionBar' };

