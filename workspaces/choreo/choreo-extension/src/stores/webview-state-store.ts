/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import type { WebviewState } from "@wso2-enterprise/choreo-core";
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
