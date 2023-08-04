/*
 *  Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
 *
 *  This software is the property of WSO2 LLC. and its suppliers, if any.
 *  Dissemination of any information or reproduction of any material contained
 *  herein is strictly forbidden, unless permitted by WSO2 in accordance with
 *  the WSO2 Commercial License available at http://wso2.com/licenses.
 *  For specific language governing the permissions and limitations under
 *  this license, please see the license as well as any agreement you’ve
 *  entered into with WSO2 governing the purchase of this software and any
 *  associated services.
 */
/* tslint:disable:variable-name */
import React from 'react';

import { DataGrid } from './DataGrid';

export default {
    title: 'DataGrid',
    component: DataGrid,
};

export const Data_Grid_Comp = () =>
    (
        <div style={{width: 300, height: 300}}>
            <DataGrid
                data={[
                    [
                        { gridColumn: '1', isHeader: true, content: 'Header1' },
                        { gridColumn: '2', content: 'Content' }
                    ],
                    [
                        { gridColumn: '1', isHeader: true, content: 'Header2' },
                        { gridColumn: '2', content: (<div style={{display: "flex", flexDirection: "column"}}><>WSO2</><>Colombo</></div>) },
                    ]
                ]}
            />
        </div>
    );
