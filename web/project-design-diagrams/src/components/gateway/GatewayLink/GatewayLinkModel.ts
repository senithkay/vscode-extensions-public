/**
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */

import { SharedLinkModel } from "../../common/shared-link/shared-link";
import { GATEWAY_LINK_TYPE } from "../types";
import { Level, Location } from "../../../resources";

export class GatewayLinkModel extends SharedLinkModel {
    readonly level: Level;
    readonly location: Location;

    constructor(level: Level) {
        super(GATEWAY_LINK_TYPE);
        this.level = level;
        this.location = undefined;
    }
}
