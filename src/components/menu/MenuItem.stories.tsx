import type { Meta, StoryObj } from "@storybook/react";
import { MenuItem } from "./MenuItem";

const meta: Meta<typeof MenuItem> = {
  title: "Atoms/MenuItem",
  component: MenuItem,
  parameters: {
    layout: "centered",
    backgrounds: {
      default: "dark",
      values: [{ name: "dark", value: "#000000" }],
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof MenuItem>;

export const Start: Story = {
  args: {
    label: "START",
    hiddenIndexes: [2],
    hoverColor: "#f635df",
    isHovered: false,
    isActive: false,
  },
};

export const Active: Story = {
  args: {
    label: "START",
    hiddenIndexes: [2],
    hoverColor: "#f635df",
    isHovered: false,
    isActive: true,
  },
};

export const Hovered: Story = {
  args: {
    label: "START",
    hiddenIndexes: [2],
    hoverColor: "#f635df",
    isHovered: true,
    isActive: false,
  },
};

export const About: Story = {
  args: {
    label: "ABOUT",
    hiddenIndexes: [3], // ABOT
    hoverColor: "#35f686",
  },
};

export const Projects: Story = {
  args: {
    label: "PROJECTS",
    hiddenIndexes: [4, 5, 6, 7], // PROJ
    hoverColor: "#bef635",
  },
};

export const Links: Story = {
  args: {
    label: "LINKS",
    hiddenIndexes: [1, 4], // LNKS
    hoverColor: "#f64b4b",
  },
};

export const Contact: Story = {
  args: {
    label: "CONTACT",
    hiddenIndexes: [4, 5, 6], // CONT
    hoverColor: "#4b9cf6",
  },
};
