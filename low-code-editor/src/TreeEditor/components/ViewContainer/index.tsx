import React from 'react';

import { Expression } from '../../models/definitions';
import { LeftPane } from '../LeftPane';
import { RightPane } from '../RightPane';

import { statementEditorStyles } from "./styles";

export const sampleModel: Expression = {
    type: ["boolean"],
    kind: "DefaultBooleanC"
}

export function MainContainer() {
    const currentModel: { model: Expression } = {
        model: sampleModel
    }

    const overlayClasses = statementEditorStyles();

    return (
        <div className={overlayClasses.App}>
            <LeftPane model={sampleModel} currentModel={currentModel} />
            <div className={overlayClasses.vl}/>
            <RightPane />
        </div>
    )
}
