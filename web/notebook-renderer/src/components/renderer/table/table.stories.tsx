import { Attributes, ComponentChildren, h, Ref } from 'preact';
import { Meta } from '@storybook/react';
import { TableForNotebookOutput } from './table';
import { NotebookCellResult } from '../types';

export default {
    component: TableForNotebookOutput,
    title: 'Components/Table',
} as Meta;

const Template = (args: JSX.IntrinsicAttributes & { notebookCellOutput: Readonly<NotebookCellResult>; } 
    & Readonly<Attributes & { children?: ComponentChildren; ref?: Ref<any>; }>) => <TableForNotebookOutput {...args} />;

export const SimpleTable1 = {
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

export const SimpleTable2 = {
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
