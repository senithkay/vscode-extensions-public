/**
 * Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com) All Rights Reserved.
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
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

import { createStyles, makeStyles } from "@material-ui/core/styles";
import { Colors } from '../../resources';

const background = require('../../resources/assets/PatternBg.svg') as string;

export const useStyles = makeStyles(() =>
    createStyles({
        button: {
            backgroundColor: Colors.PRIMARY,
            borderRadius: '5px',
            color: 'white',
            fontSize: '12px',
            marginInline: '5px',
            minWidth: '140px',
            '&:hover': {
                backgroundColor: Colors.PRIMARY_LIGHT
            }
        },
        container: {
            alignItems: 'center',
            backgroundImage: `url(${background})`,
            backgroundRepeat: 'repeat',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            height: '100vh',
            width: '100vw'
        },
        messageBox: {
            color: '#6b6b6b',
            fontFamily: 'GilmerRegular',
            fontSize: '16px',
            padding: '10px'
        }
    })
);
