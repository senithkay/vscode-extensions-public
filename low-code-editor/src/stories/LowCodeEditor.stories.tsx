import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import LowCodeEditor, { LowCodeEditorProps } from './../index';

interface test {
    
}

export default {
  title: 'LowCodeEditor/Diagram',
  component: LowCodeEditor,
} as ComponentMeta<typeof LowCodeEditor>;

const Template: ComponentStory<typeof LowCodeEditor> = (args) => <LowCodeEditor {...args} />;

export const Diagram = Template.bind({});

const args = {};
Diagram.args = args;
