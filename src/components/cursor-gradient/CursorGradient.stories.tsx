import type { Meta, StoryObj } from "@storybook/react";
import { CursorGradient } from "./CursorGradient";

const meta: Meta<typeof CursorGradient> = {
  title: "Visual Effects/CursorGradient",
  component: CursorGradient,
  parameters: {
    layout: "fullscreen",
  },
  argTypes: {
    theme: {
      control: "radio",
      options: ["light", "dark"],
    },
    gradientColor: {
      control: "color",
    },
    radius: {
      control: { type: "range", min: 100, max: 1000, step: 50 },
    },
    grainOpacity: {
      control: { type: "range", min: 0, max: 1, step: 0.05 },
    },
  },
};

export default meta;
type Story = StoryObj<typeof CursorGradient>;

export const Light: Story = {
  args: {
    theme: "light",
    gradientColor: "rgba(0, 0, 0, 0.1)",
    radius: 500,
    grainOpacity: 0.1,
  },
  render: (args) => (
    <div style={{ width: "100vw", height: "100vh" }}>
      <CursorGradient {...args} />
    </div>
  ),
};

export const Dark: Story = {
  args: {
    theme: "dark",
    gradientColor: "rgba(255, 255, 255, 0.15)",
    radius: 600,
    grainOpacity: 0.15,
  },
  render: (args) => (
    <div style={{ width: "100vw", height: "100vh" }}>
      <CursorGradient {...args} />
    </div>
  ),
};

export const Intense: Story = {
  args: {
    theme: "dark",
    gradientColor: "rgba(0, 255, 255, 0.2)",
    radius: 400,
    grainOpacity: 0.3,
  },
  render: (args) => (
    <div style={{ width: "100vw", height: "100vh" }}>
      <CursorGradient {...args} />
    </div>
  ),
};
