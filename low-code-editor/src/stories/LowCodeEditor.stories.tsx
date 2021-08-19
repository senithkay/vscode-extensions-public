import React from 'react';

import { ComponentMeta, ComponentStory } from '@storybook/react';

import { sizingAndPositioningST } from '../DiagramGenerator/generatorUtil';

import LowCodeEditor, { LowCodeEditorProps } from './../index';
import syntaxTree from "./data/st-raw.json"

export default {
  title: 'LowCodeEditor/Diagram',
  component: LowCodeEditor,
};

const Template: ComponentStory<typeof LowCodeEditor> = (args) => <LowCodeEditor {...args} />;

export const Diagram = Template.bind({});

const lowCodeEditorArgs: LowCodeEditorProps = {
  syntaxTree: sizingAndPositioningST(syntaxTree),
  getAiSuggestions: async ({ mapFrom, userID, mapTo }) => ({ jobNumber: "000", suggestedMappings: [] }),
};
Diagram.args = lowCodeEditorArgs;
