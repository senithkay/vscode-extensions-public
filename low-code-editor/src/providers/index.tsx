import React from "react";

import { Provider as DiagramProvider } from "./contexts/Diagram";

// TODO: Complete Props declaation
interface Props {
    children: JSX.Element
};

export default function Provider(props: any) {
    const {
        children,
        onMutate,
        onModify,
        ...restProps
    } = props;

    const initialState = restProps;

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
