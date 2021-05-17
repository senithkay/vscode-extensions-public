// tslint:disable: jsx-no-multiline-js
import React, { useReducer } from "react";

export function createContext(reducer: any, actions: any = {}, defaultState: any = {}) {
    const Context = React.createContext(defaultState);

    const Provider = (props: any) => {
        const { children, initialState, callbacks } = props;
        const [state, dispatch] = useReducer(
            reducer,
            {
                ...defaultState,
                ...initialState
            }
        );

        const boundActions: any = {};
        /* tslint:disable-next-line */
        for (const key in actions) {
            boundActions[key] = actions[key](dispatch);
        }

        return (
            <Context.Provider
                value={{
                    state,
                    callbacks: {
                        ...boundActions,
                        ...callbacks
                    }
                }}
            >
                {children}
            </Context.Provider>
        );
    };

    return { Context, Provider };
}
