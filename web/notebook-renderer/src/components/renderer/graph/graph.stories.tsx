import { Attributes, ComponentChildren, Ref } from 'preact';
import { Meta } from '@storybook/react';
import { GraphForNotebookOutput } from './graph';
import { NotebookCellResult } from '../types';

export default {
    component: GraphForNotebookOutput,
    title: 'Components/Graph',
} as Meta;

const Template = (args: JSX.IntrinsicAttributes & { notebookCellOutput: Readonly<NotebookCellResult>; } 
    & Readonly<Attributes & { children?: ComponentChildren; ref?: Ref<any>; }>) => <GraphForNotebookOutput {...args} />;

export const EmptyGraph = {
    args: {
        notebookCellOutput:{
            shellValue: {
                value: `[]`,
                mimeType: 'table',
                type: 'table'
            }
        }
    },
};

export const SimpleGraph1 = {
    args: {
        notebookCellOutput:{
            shellValue: {
                value: `[
                    {"username":"John","salary":100},
                    {"username":"Adam","salary":300},
                    {"username":"Jake","salary":100}
                ]`,
                mimeType: 'table',
                type: 'table'
            }
        }
    },
};

export const SimpleGraph2 = {
    args: {
        notebookCellOutput:{
            shellValue: {
                value: `[
                    {"username":"John","salary":100,"fullname":{"firstname":"John","lastname":"Doe"}},
                    {"username":"Adam","salary":300,"fullname":{"firstname":"Adam","lastname":"Smith"}},
                    {"username":"Jake","salary":100,"fullname":{"firstname":"jake","lastname":"Peralta"}}
                ]`,
                mimeType: 'table',
                type: 'table'
            }
        }
    },
};

export const InconsistentGraph1 = {
    args: {
        notebookCellOutput:{
            shellValue: {
                value: `[
                    {"username":"John","salary":100,"region":"LA"},
                    {"username":"Adam","salary":300,"title":"Manager"},
                    {"username":"Jake","salary":100}
                ]`,
                mimeType: 'table',
                type: 'table'
            }
        }
    },
};
