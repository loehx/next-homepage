import type { Meta, StoryObj } from "@storybook/react";
import { iPhone3D } from "./iPhone3D";

const meta: Meta<typeof iPhone3D> = {
  title: "Components/Capability/iPhone3D",
  component: iPhone3D,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <div style={{ width: '100%', height: '100vh', background: '#000' }}>
        <Story />
      </div>
    ),
  ],
  tags: ["autodocs"],
  argTypes: {
    imageUrl: {
      control: "text",
      description: "URL of the image to display on the iPhone screen",
    },
    hueRotate: {
      control: { type: "range", min: 0, max: 360, step: 1 },
      description: "Hue rotation in degrees",
    },
    isVisible: {
      control: "boolean",
      description: "Whether the component is visible",
    },
    flipKey: {
      control: { type: "number", min: 0, step: 1 },
      description: "Key to trigger flip animation",
    },
  },
};

export default meta;
type Story = StoryObj<typeof iPhone3D>;

export const Default: Story = {
  args: {
    imageUrl: "https://placehold.co/400x800/1a1a1a/ffffff?text=Screen",
    isVisible: true,
  },
};

export const CustomImage: Story = {
  args: {
    imageUrl: "https://picsum.photos/400/800",
    isVisible: true,
  },
};

export const WithHueRotate: Story = {
  args: {
    imageUrl: "https://picsum.photos/400/800",
    hueRotate: 180,
    isVisible: true,
  },
};

export const Hidden: Story = {
  args: {
    imageUrl: "https://picsum.photos/400/800",
    isVisible: false,
  },
};
