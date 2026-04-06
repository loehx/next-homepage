import type { Meta, StoryObj } from "@storybook/react";
import { Capabilities } from "./Capabilities";

const meta: Meta<typeof Capabilities> = {
  title: "Page Sections/Capabilities",
  component: Capabilities,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  argTypes: {
    activeIndex: {
      control: { type: "number", min: 0, max: 5, step: 1 },
      description: "Active detail index (0-5)",
    },
    isPlaying: {
      control: "boolean",
      description: "Whether animation is playing",
    },
    progress: {
      control: { type: "range", min: 0, max: 1, step: 0.01 },
      description: "Scroll progress (0-1)",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Capabilities>;

export const Default: Story = {
  args: {
    isPlaying: true,
  },
};

export const SecondItem: Story = {
  args: {
    activeIndex: 1,
    isPlaying: true,
  },
};

export const Paused: Story = {
  args: {
    activeIndex: 0,
    isPlaying: false,
  },
};

export const LastItem: Story = {
  args: {
    activeIndex: 5,
    isPlaying: true,
  },
};
