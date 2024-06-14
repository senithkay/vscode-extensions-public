import { WebviewState } from "@wso2-enterprise/choreo-core";
import { createStore } from "zustand";

interface WebviewStateStore {
    state: WebviewState;
    setOpenedComponentKey: (openedComponentKey: string) => void;
    onCloseComponentView: (openedComponentKey: string) => void;
}

export const webviewStateStore = createStore<WebviewStateStore>((set) => ({
    state: { openedComponentKey: "" },
    setOpenedComponentKey: (openedComponentKey) => set(({ state }) => ({ state: { ...state, openedComponentKey } })),
    onCloseComponentView: (openedComponentKey) =>
        set(({ state }) => ({
            state: {
                ...state,
                openedComponentKey: openedComponentKey === state.openedComponentKey ? "" : state.openedComponentKey,
            },
        })),
}));
