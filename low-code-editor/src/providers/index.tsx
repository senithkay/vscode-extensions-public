import React from "react";

import { STModification } from "../Definitions";
import { TriggerType } from "../Diagram/models";

import { Provider as DiagramProvider } from "./contexts/Diagram";

// TODO: Complete Props declaation
interface Props {
    children: JSX.Element
};

export default function Provider(props: any) {
    const {
        children,
        // onMutate,
        // onModify,
        langServerURL,
        workingFile,
        ...restProps
    } = props;

    const initialState = restProps;

    const onMutate = (mutations: STModification[]) => {
        // TODO Can move to upper scope. Should do later.
        props.onMutate(langServerURL, "file://" + workingFile, mutations);
    }

    const onModify = (triggerType: TriggerType, model?: any, configObject?: any) => {
        // TODO Can move to upper scope. Should do later.
        props.onModify(triggerType, model, configObject);
    }

    const callbacks = {
        onMutate,
        onModify
    };

    return (
        <DiagramProvider
            initialState={initialState}
            callbacks={callbacks}
        >
            {children}
        </DiagramProvider>
    );
}
