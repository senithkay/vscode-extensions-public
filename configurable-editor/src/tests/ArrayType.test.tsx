import * as React from "react";

import { fireEvent, render, screen } from "@testing-library/react";
import { composeStories } from '@storybook/testing-react';

import { ConfigElementProps } from "../components/ConfigElement";
import * as stories from '../stories/array/ArrayType.stories';

const { ArrayTypes } = composeStories(stories);

const onClickDefaultButton = () => {
    // tslint:disable-next-line: no-console
    console.log("Default Button clicked");
};

const onClickPrimaryButton = (configProperties: ConfigElementProps) => {
    // tslint:disable-next-line: no-console
    expect(configProperties).toBe("jk");
};

test("Renders the ConfigForm", () => {
    render(<ArrayTypes />);

    fireEvent.click(screen.getByText("Run"));
    // expect(screen.getByText("Run"))
});
