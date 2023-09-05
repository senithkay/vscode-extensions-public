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

import React from "react";
import styled from "@emotion/styled";
import { Project} from "@wso2-enterprise/ballerina-languageclient";
import { ChoreoWebViewAPI } from "../utilities/WebViewRpc";
import { CellDiagram } from "@wso2-enterprise/cell-diagram";

const WizardContainer = styled.div`
    width: 100vw;
    height: 100vh;
`;

export interface ChoreoCellViewProps {
    projectId?: string;
    orgName?: string;
}

export function ChoreoCellView(props: ChoreoCellViewProps) {
    const { orgName, projectId } = props;

    const getProjectModel = async (): Promise<Project> => {
        if (orgName && projectId) {
            const org = await ChoreoWebViewAPI.getInstance().getCurrentOrg();
            const projectModel =
                await ChoreoWebViewAPI.getInstance().getChoreoCellView().getProjectModel(org, projectId);
            return projectModel;
        }
        throw new Error("Error while loading project resources.");
    }

    return (
        <WizardContainer>
            <CellDiagram getProjectModel={getProjectModel}/>
        </WizardContainer>
    );
}

// export interface CellViewProps {
//     getProjectModel: () => Promise<Project>;
// }
//
// function CellDiagram(props: CellViewProps) {
//     const { getProjectModel } = props;
//     const [projectModel, setProjectModel] = React.useState<Project>();
//
//     useEffect(() => {
//         getProjectModel().then((pm) => {
//             setProjectModel(pm);
//         });
//     }, []);
//
//     return (
//         <div style={{ height: "100vh", width: "100vw" }}>
//             <pre>{JSON.stringify(projectModel, null, 2)}</pre>
//         </div>
//     );
// }
