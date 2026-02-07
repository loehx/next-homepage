import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { COLORS } from "../capabilities/constants";
import { Gradients, GrainOverlay } from "./Gradients";
import styles from "./Gradients.module.css";

const meta: Meta<typeof Gradients> = {
  title: "Gradients",
  component: Gradients,
  parameters: {
    layout: "fullscreen",
  },
  argTypes: {
    colors: { control: "object" },
    grainSize: { control: { type: "range", min: 0.01, max: 2.0, step: 0.01 } },
    grainDepth: { control: { type: "range", min: 1, max: 10, step: 1 } },
    grainIntensity: { control: { type: "range", min: 0.1, max: 2.0, step: 0.1 } },
    grainOpacity: { control: { type: "range", min: 0, max: 1.0, step: 0.05 } },
  },
};

export default meta;

type Story = StoryObj<typeof Gradients>;

export const Custom: Story = {
  args: {
    colors: [COLORS[0], COLORS[1]],
    grainSize: 0.8,
    grainDepth: 4,
    grainIntensity: 0.5,
    grainOpacity: 0.4,
  },
  render: (args) => (
    <div className={styles.container}>
      <h1 className={styles.title}>Custom Grainy Gradient</h1>
      <div style={{ width: "100%", height: "400px", borderRadius: "24px" }}>
        <Gradients {...args} />
      </div>
    </div>
  ),
};

export const Grid: StoryObj = {
  render: () => {
    const pairs: [string, string][] = [];
    for (let i = 0; i < COLORS.length; i++) {
      for (let j = i + 1; j < COLORS.length; j++) {
        pairs.push([COLORS[i], COLORS[j]]);
      }
    }

    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Color Palette Gradients</h1>
        <div className={styles.grid}>
          {pairs.map(([c1, c2], index) => (
            <div key={index} className={styles.card}>
              <Gradients colors={[c1, c2]} className={styles.meshGradient} />
              <span className={styles.label}>
                {c1} + {c2}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  },
};

export const Mesh: StoryObj = {
  render: () => {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Organic Mesh Gradient</h1>
        <div className={styles.meshContainer}>
          <div
            className={styles.meshGradient}
            style={{
              backgroundColor: "#000",
              backgroundImage: `
                radial-gradient(at 0% 0%, ${COLORS[0]} 0px, transparent 50%),
                radial-gradient(at 50% 0%, ${COLORS[1]} 0px, transparent 50%),
                radial-gradient(at 100% 0%, ${COLORS[2]} 0px, transparent 50%),
                radial-gradient(at 0% 100%, ${COLORS[3]} 0px, transparent 50%),
                radial-gradient(at 50% 100%, ${COLORS[4]} 0px, transparent 50%),
                radial-gradient(at 100% 100%, ${COLORS[0]} 0px, transparent 50%),
                radial-gradient(at 50% 50%, ${COLORS[2]} 0px, transparent 50%)
              `,
            }}
          />
          <GrainOverlay grainOpacity={0.6} />
        </div>
      </div>
    );
  },
};
