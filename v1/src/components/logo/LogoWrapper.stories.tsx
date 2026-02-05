import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { LogoWrapper } from "./LogoWrapper";

const meta: Meta<typeof LogoWrapper> = {
    title: "Molecules/LogoWrapper",
    component: LogoWrapper,
    parameters: {
        layout: "fullscreen",
    },
    decorators: [
        (Story) => (
            <div style={{ height: "300vh", background: "#111" }}>
                <div style={{ 
                    height: "100vh", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center",
                    color: "white",
                    fontSize: "2rem",
                    textAlign: "center",
                    padding: "0 20px"
                }}>
                    Scroll down to see the logo appear (at 0.5 VH)
                </div>
                <Story />
                <div style={{ 
                    height: "100vh", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center",
                    color: "white",
                    fontSize: "2rem"
                }}>
                    Logo should stay visible now
                </div>
            </div>
        ),
    ],
};

export default meta;
type Story = StoryObj<typeof LogoWrapper>;

export const Default: Story = {};
