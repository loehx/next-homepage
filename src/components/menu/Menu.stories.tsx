import type { Meta, StoryObj } from "@storybook/preact";
import { Menu } from "./index";
import { ReactLenis } from "lenis/react";

const meta: Meta<typeof Menu> = {
    title: "Components/Menu/Menu",
    component: Menu,
    decorators: [
        (Story) => (
            <ReactLenis root options={{ lerp: 0.1, smoothWheel: true }}>
                <div
                    style={{
                        height: "500vh",
                        background: "linear-gradient(to bottom, #1a1a1a, #333)",
                        position: "relative",
                    }}
                >
                    <div
                        style={{
                            height: "100vh",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                        }}
                    >
                        <h1>Page 1 (Scroll down)</h1>
                    </div>
                    <div
                        style={{
                            height: "100vh",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                        }}
                    >
                        <h1>Page 2 (Menu button visible)</h1>
                    </div>
                    <div style={{ height: "300vh" }} />
                    <Story />
                </div>
            </ReactLenis>
        ),
    ],
};

export default meta;
type Story = StoryObj<typeof Menu>;

export const Default: Story = {};
