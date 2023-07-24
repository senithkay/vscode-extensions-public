/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import * as React from "react";

import { composeStories } from "@storybook/testing-react";
import { fireEvent, render, screen } from "@testing-library/react";

import { ConfigElementProps } from "../components/ConfigElement";
import * as stories from "../stories/array/ArrayType.stories";
import expectedResult from "../stories/array/expected-result.json";

const { ArrayTypes } = composeStories(stories);

test("Renders the ConfigForm", () => {
    const onClickPrimaryButton = (configProperties: ConfigElementProps) => {
        expect(configProperties).toMatchObject(expectedResult);
    };

    render(<ArrayTypes onClickPrimaryButton={onClickPrimaryButton}/>);

    fireEvent.click(screen.getByText("Run"));
});
