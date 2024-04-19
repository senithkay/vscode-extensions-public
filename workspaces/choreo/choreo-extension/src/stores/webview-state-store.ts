import { WebviewState } from "@wso2-enterprise/choreo-core";
import { createStore } from "zustand";

interface WebviewStateStore {
    state: WebviewState;
    setOpenedComponentPath: (openedComponentPath: string) => void;
    onCloseComponentView: (openedComponentPath: string) => void;
}

export const webviewStateStore = createStore<WebviewStateStore>((set) => ({
    state: { openedComponentPath: "" },
    setOpenedComponentPath: (openedComponentPath) => set(({ state }) => ({ state: { ...state, openedComponentPath } })),
    onCloseComponentView: (openedComponentPath) =>
        set(({ state }) => ({
            state: {
                ...state,
                openedComponentPath: openedComponentPath === state.openedComponentPath ? "" : state.openedComponentPath,
            },
        })),
}));
