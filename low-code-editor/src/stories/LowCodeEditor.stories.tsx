import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import LowCodeEditor, { LowCodeEditorProps } from './../index';
import syntaxTree from "./data/st-raw.json"
import { sizingAndPositioningST } from '../DiagramGenerator/generatorUtil';

export default {
  title: 'LowCodeEditor/Diagram',
  component: LowCodeEditor,
} as ComponentMeta<typeof LowCodeEditor>;

const Template: ComponentStory<typeof LowCodeEditor> = (args) => <LowCodeEditor {...args} />;

export const Diagram = Template.bind({});

const args: LowCodeEditorProps = {
  syntaxTree: sizingAndPositioningST(syntaxTree),
  getAiSuggestions: async ({ mapFrom, userID, mapTo }) => ({ jobNumber: "000", suggestedMappings: [] }),
};
Diagram.args = args;
