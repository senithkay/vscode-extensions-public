/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { css } from '@emotion/css';
import { HelperPane } from '@wso2-enterprise/ui-toolkit';
import { FunctionIcon, VarIcon } from './icons';
import { ConfigIcon } from './icons/ConfigIcon';
import { HELPER_PANE_PAGE, HelperPanePageType } from '.';

type CategoryPageProps = {
    setCurrentPage: (page: HelperPanePageType) => void;
    onClose: () => void;
};

const bodyStyles = css({
    "& svg": {
        height: "20px",
        width: "20px",
        fill: "var(--vscode-foreground)",
        stroke: "var(--vscode-foreground)",
    }
});

export const CategoryPage = ({ setCurrentPage, onClose }: CategoryPageProps) => {
    return (
        <>
            <HelperPane.Header title="Select Category" onClose={onClose} />
            <HelperPane.Body className={bodyStyles}>
                <HelperPane.CategoryItem
                    label="Variables"
                    onClick={() => setCurrentPage(HELPER_PANE_PAGE.VARIABLES)}
                    getIcon={() => <VarIcon />}
                />
                <HelperPane.CategoryItem
                    label="Functions"
                    onClick={() => setCurrentPage(HELPER_PANE_PAGE.FUNCTIONS)}
                    getIcon={() => <FunctionIcon />}
                />
                <HelperPane.CategoryItem
                    label="Configurables"
                    onClick={() => setCurrentPage(HELPER_PANE_PAGE.CONFIGURABLE)}
                    getIcon={() => <ConfigIcon />}
                />
            </HelperPane.Body>
        </>
    );
};
