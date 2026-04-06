import type { Meta, StoryObj } from "@storybook/react";
import { MenuOverlay } from "./MenuOverlay";

const meta: Meta<typeof MenuOverlay> = {
  title: "UI Components/Menu/MenuOverlay",
  component: MenuOverlay,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof MenuOverlay>;

export const Closed: Story = {
  args: {
    isOpen: false,
    activeItemIndex: 0,
    onClose: () => console.log("onClose"),
    onItemClick: (pos) => console.log("onItemClick", pos),
  },
};

export const Open: Story = {
  args: {
    isOpen: true,
    activeItemIndex: 0,
    onClose: () => console.log("onClose"),
    onItemClick: (pos) => console.log("onItemClick", pos),
  },
};
