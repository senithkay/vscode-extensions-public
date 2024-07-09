/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { MachineEvent, VisualizerLocation, CommandProps } from "../../state-machine-types";

export interface VisualizerAPI {
    openView: (params: VisualizerLocation) => void;
    goBack: () => void;
    sendMachineEvent: (params: MachineEvent) => void;
    executeCommand: (params: CommandProps) => void;
}
