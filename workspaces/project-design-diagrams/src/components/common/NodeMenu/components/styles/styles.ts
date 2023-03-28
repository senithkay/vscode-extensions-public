/**
 * Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com) All Rights Reserved.
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */

import { createStyles, makeStyles } from "@material-ui/core/styles";
import { CSSProperties } from "react";

export const useStyles = makeStyles(() =>
    createStyles({
        listItemText: {
            color: "#595959",
            "& .MuiListItemText-primary": {
                fontSize: 14,
                fontFamily: "GilmerRegular",
            },
        },
    })
);

export const DefaultTextProps: CSSProperties = {
    fontFamily: 'GilmerRegular',
    fontSize: '14px'
}

export const ContentTextProps: CSSProperties = {
    fontFamily: 'GilmerRegular',
    fontSize: '15px'
}

export const TitleTextProps: CSSProperties = {
    fontFamily: 'GilmerMedium',
    fontSize: '16px'
}
