import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta = {
  title: "Utilities/Fonts",
};

export default meta;
type Story = StoryObj;

const containerStyle = { padding: "2rem", color: "var(--color-text)", backgroundColor: "var(--color-background)" };
const h2Style = { fontSize: "3rem", marginBottom: "2rem", color: "var(--color-text)" };
const h3Style = { fontSize: "1rem", marginBottom: "0.5rem", opacity: 0.7, color: "var(--color-text-light)" };
const pStyle = { fontSize: "1.5rem", color: "var(--color-text)" };
const sampleText = "The quick brown fox jumps over the lazy dog";

const letterSpacings = [
  { name: "Tight", value: "-0.05em" },
  { name: "Slightly Tight", value: "-0.02em" },
  { name: "Default", value: "0em" },
  { name: "Slightly Wide", value: "0.02em" },
  { name: "Wide", value: "0.05em" },
  { name: "Extra Wide", value: "0.1em" },
  { name: "Very Wide", value: "0.15em" },
];

const uppercaseSpacings = [
  { name: "Tight", value: "-0.05em" },
  { name: "Default", value: "0em" },
  { name: "Wide", value: "0.05em" },
  { name: "Extra Wide", value: "0.1em" },
  { name: "Very Wide", value: "0.15em" },
];

export const VANK: Story = {
  render: () => (
    <div style={containerStyle}>
      <h2 style={{ ...h2Style, fontFamily: "Vank" }}>VANK Font - Letter Spacing Variants</h2>
      {letterSpacings.map(({ name, value }) => (
        <div key={value} style={{ marginBottom: "2rem" }}>
          <h3 style={{ ...h3Style, fontFamily: "Vank" }}>{name} ({value})</h3>
          <p style={{ ...pStyle, fontFamily: "Vank", letterSpacing: value }}>{sampleText}</p>
        </div>
      ))}
      <div style={{ marginTop: "3rem", paddingTop: "2rem", borderTop: "1px solid var(--color-border)" }}>
        <h2 style={{ fontFamily: "Vank", fontSize: "2rem", marginBottom: "2rem", textTransform: "uppercase", color: "var(--color-text)" }}>
          Uppercase Variants
        </h2>
        {uppercaseSpacings.map(({ name, value }) => (
          <div key={`upper-${value}`} style={{ marginBottom: "2rem" }}>
            <h3 style={{ ...h3Style, fontFamily: "Vank" }}>Uppercase - {name} ({value})</h3>
            <p style={{ ...pStyle, fontFamily: "Vank", letterSpacing: value, textTransform: "uppercase" }}>{sampleText}</p>
          </div>
        ))}
      </div>
    </div>
  ),
};

export const JetBrainsMono: Story = {
  render: () => (
    <div style={containerStyle}>
      <h2 style={{ ...h2Style, fontFamily: "JetBrains Mono", marginBottom: "1rem" }}>JetBrains Mono</h2>
      <p style={{ ...pStyle, fontFamily: "JetBrains Mono", marginBottom: "0.5rem" }}>{sampleText}</p>
      <p style={{ fontFamily: "JetBrains Mono", fontSize: "1rem", color: "var(--color-text)" }}>
        ABCDEFGHIJKLMNOPQRSTUVWXYZ<br />
        abcdefghijklmnopqrstuvwxyz<br />
        0123456789 !@#$%^&*()
      </p>
      <pre style={{ fontFamily: "JetBrains Mono", fontSize: "0.875rem", background: "var(--color-border)", color: "var(--color-text)", padding: "1rem", borderRadius: "4px" }}>
{`function example() {
  const code = "monospace";
  return code;
}`}
      </pre>
    </div>
  ),
};

export const AllFonts: Story = {
  render: () => (
    <div style={containerStyle}>
      <div style={{ marginBottom: "3rem" }}>
        <h2 style={{ ...h2Style, fontFamily: "Vank", marginBottom: "1rem" }}>VANK Font</h2>
        <p style={{ ...pStyle, fontFamily: "Vank" }}>{sampleText}</p>
      </div>
      <div>
        <h2 style={{ ...h2Style, fontFamily: "JetBrains Mono", marginBottom: "1rem" }}>JetBrains Mono</h2>
        <p style={{ ...pStyle, fontFamily: "JetBrains Mono" }}>{sampleText}</p>
      </div>
    </div>
  ),
};
