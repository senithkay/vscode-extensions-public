import React from 'react';

import {Expression} from '../../models/definitions';
import {getDefaultModel} from "../../utils";
import {LeftPane} from '../LeftPane';
import {RightPane} from '../RightPane';

import {statementEditorStyles} from "./styles";

interface ViewProps {
    kind: string,
    label: string
}

export function MainContainer(props: ViewProps) {
    const {kind, label} = props;

    const defaultModel = getDefaultModel(kind);

    const currentModel: { model: Expression } = {
        model: defaultModel
    }

    const overlayClasses = statementEditorStyles();

    return (
        <div className={overlayClasses.App}>
            <LeftPane model={defaultModel} currentModel={currentModel} kind={kind} label={label}/>
            <div className={overlayClasses.vl}/>
            <RightPane/>
        </div>
    )
}
