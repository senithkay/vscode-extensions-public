import React from 'react';

import {STNode} from "@ballerina/syntax-tree";

import {getDefaultModel} from "../../utils";
import {LeftPane} from '../LeftPane';
import {RightPane} from '../RightPane';

import {statementEditorStyles} from "./styles";

interface ViewProps {
    kind: string,
    label: string
}

function MainContainer(props: ViewProps) {
    const {kind, label} = props;

    const defaultModel = getDefaultModel(kind);

    const currentModel: { model: STNode } = {
        model: defaultModel
    }

    const overlayClasses = statementEditorStyles();

    return (
        <div className={overlayClasses.App}>
            <LeftPane
                model={defaultModel}
                currentModel={currentModel}
                kind={kind}
                label={label}
            />
            <div className={overlayClasses.vl}/>
            <RightPane/>
        </div>
    )
}

export default React.memo(MainContainer); // To prevent rendering the component in each time the parent change
