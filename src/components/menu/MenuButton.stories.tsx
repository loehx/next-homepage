import type { Meta, StoryObj } from "@storybook/react";
import { MenuButton } from "./MenuButton";

const meta: Meta<typeof MenuButton> = {
    title: "Components/Menu/MenuButton",
    component: MenuButton,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
    argTypes: {
        onClick: { action: "clicked" },
    },
};

export default meta;
type Story = StoryObj<typeof MenuButton>;

export const Closed: Story = {
    args: {
        isOpen: false,
    },
};

export const Open: Story = {
    args: {
        isOpen: true,
    },
};
