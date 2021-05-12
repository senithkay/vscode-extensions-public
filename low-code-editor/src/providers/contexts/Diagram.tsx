import { createContext } from "../utils";

const reducer = (state: any, action: any) => {
    switch (action.type) {
        case 'XYZ':
            return state;
        default:
            return state;
    }
};

const actions: any = {};

const initialState: any = {};

export const { Context, Provider } = createContext(
    reducer,
    actions,
    initialState
);
