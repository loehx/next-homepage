import type { Meta, StoryObj } from "@storybook/react";
import { Intro } from "./Intro";

const meta: Meta<typeof Intro> = {
  title: "Page Sections/Intro",
  component: Intro,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  argTypes: {
    progress: {
      control: { type: "range", min: 0, max: 1, step: 0.01 },
      description: "Scroll progress (0-1)",
    },
    isActive: {
      control: "boolean",
      description: "Whether animation is active",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Intro>;

export const Default: Story = {
  args: {
    progress: 0,
    isActive: true,
  },
};

export const Scrolled: Story = {
  args: {
    progress: 0.5,
    isActive: true,
  },
};

export const FullyScrolled: Story = {
  args: {
    progress: 1,
    isActive: true,
  },
};

export const Paused: Story = {
  args: {
    progress: 0,
    isActive: false,
  },
};
