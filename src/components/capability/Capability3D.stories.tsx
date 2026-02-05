import type { Meta, StoryObj } from "@storybook/react";
import { Capability } from "./Capability";
import { iPhone3D } from "./iPhone3D";
import { DETAILS } from "./constants";

// Wrapper component to adapt iPhone3D to Phone interface
function iPhone3DWrapper({ isLoaded }: { isLoaded: boolean }) {
  return (
    <iPhone3D
      imageUrl="https://via.placeholder.com/400x800/1a1a1a/ffffff?text=iPhone+Screen"
      isVisible={isLoaded}
      onLoad={() => {
        // Component handles its own loading state
      }}
    />
  );
}

const meta: Meta<typeof Capability> = {
  title: "Components/Capability/Capability3D",
  component: Capability,
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
type Story = StoryObj<typeof Capability>;

export const Default: Story = {
  args: {
    isPlaying: true,
    renderPhone: iPhone3D,
  },
};

export const SecondItem: Story = {
  args: {
    activeIndex: 1,
    isPlaying: true,
    renderPhone: iPhone3D,
  },
};

export const Paused: Story = {
  args: {
    activeIndex: 0,
    isPlaying: false,
    renderPhone: iPhone3D,
  },
};

export const LastItem: Story = {
  args: {
    activeIndex: 5,
    isPlaying: true,
    renderPhone: iPhone3D,
  },
};
