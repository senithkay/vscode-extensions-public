/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { HelperPane, Icon } from '@wso2-enterprise/ui-toolkit';
import { HELPER_PANE_PAGE, HelperPanePageType } from '.';

type CategoryPageProps = {
    setCurrentPage: (page: HelperPanePageType) => void;
    onClose: () => void;
};

const getIcon = (name: string) => {
    return <Icon name={name} sx={{ height: "18px", width: "18px" }} iconSx={{ fontSize: "20px" }} />;
};

export const CategoryPage = ({ setCurrentPage, onClose }: CategoryPageProps) => {
    return (
        <>
            <HelperPane.Header title="Select Category" titleSx={{ fontFamily: "GilmerRegular" }} onClose={onClose} />
            <HelperPane.Body>
                <HelperPane.CategoryItem
                    label="Variables"
                    onClick={() => setCurrentPage(HELPER_PANE_PAGE.VARIABLES)}
                    getIcon={() => getIcon("bi-variable")}
                    labelSx={{ fontFamily: "GilmerMedium" }}
                />
                <HelperPane.CategoryItem
                    label="Functions"
                    onClick={() => setCurrentPage(HELPER_PANE_PAGE.FUNCTIONS)}
                    getIcon={() => getIcon("bi-function")}
                    labelSx={{ fontFamily: "GilmerMedium" }}
                />
                <HelperPane.CategoryItem
                    label="Configurables"
                    onClick={() => setCurrentPage(HELPER_PANE_PAGE.CONFIGURABLE)}
                    getIcon={() => getIcon("bi-configurable")}
                    labelSx={{ fontFamily: "GilmerMedium" }}
                />
            </HelperPane.Body>
        </>
    );
};
