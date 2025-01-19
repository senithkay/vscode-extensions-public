/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { css } from '@emotion/css';
import { NodeIcon } from '@wso2-enterprise/bi-diagram';
import { HelperPane } from '@wso2-enterprise/ui-toolkit';
import { FunctionIcon, VarIcon } from './icons';
import { ConfigIcon } from './icons/ConfigIcon';

type CategoryPageProps = {
    setCurrentPage: (page: number) => void;
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
            <HelperPane.Body className={bodyStyles} isLoading={false}>
                <HelperPane.CategoryItem
                    label="Variables"
                    onClick={() => setCurrentPage(1)}
                    getIcon={() => <VarIcon />}
                />
                <HelperPane.CategoryItem
                    label="Functions"
                    onClick={() => setCurrentPage(2)}
                    getIcon={() => <FunctionIcon />}
                />
                <HelperPane.CategoryItem
                    label="Configurables"
                    onClick={() => setCurrentPage(3)}
                    getIcon={() => <ConfigIcon />}
                />
            </HelperPane.Body>
        </>
    );
};
