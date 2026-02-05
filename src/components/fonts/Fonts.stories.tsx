import type { Meta, StoryObj } from "@storybook/preact";

const meta: Meta = {
  title: "Typography/Fonts",
};

export default meta;
type Story = StoryObj;

export const VANK: Story = {
  render: () => (
    <div style={{ padding: "2rem", color: "var(--color-text)", backgroundColor: "var(--color-background)" }}>
      <h2 style={{ fontFamily: "Vank", fontSize: "3rem", marginBottom: "2rem", color: "var(--color-text)" }}>
        VANK Font - Letter Spacing Variants
      </h2>
      
      <div style={{ marginBottom: "2rem" }}>
        <h3 style={{ fontFamily: "Vank", fontSize: "1rem", marginBottom: "0.5rem", opacity: 0.7, color: "var(--color-text-light)" }}>
          Tight (-0.05em)
        </h3>
        <p style={{ fontFamily: "Vank", fontSize: "1.5rem", letterSpacing: "-0.05em", color: "var(--color-text)" }}>
          The quick brown fox jumps over the lazy dog
        </p>
      </div>

      <div style={{ marginBottom: "2rem" }}>
        <h3 style={{ fontFamily: "Vank", fontSize: "1rem", marginBottom: "0.5rem", opacity: 0.7, color: "var(--color-text-light)" }}>
          Slightly Tight (-0.02em)
        </h3>
        <p style={{ fontFamily: "Vank", fontSize: "1.5rem", letterSpacing: "-0.02em", color: "var(--color-text)" }}>
          The quick brown fox jumps over the lazy dog
        </p>
      </div>

      <div style={{ marginBottom: "2rem" }}>
        <h3 style={{ fontFamily: "Vank", fontSize: "1rem", marginBottom: "0.5rem", opacity: 0.7, color: "var(--color-text-light)" }}>
          Default (0em)
        </h3>
        <p style={{ fontFamily: "Vank", fontSize: "1.5rem", letterSpacing: "0em", color: "var(--color-text)" }}>
          The quick brown fox jumps over the lazy dog
        </p>
      </div>

      <div style={{ marginBottom: "2rem" }}>
        <h3 style={{ fontFamily: "Vank", fontSize: "1rem", marginBottom: "0.5rem", opacity: 0.7, color: "var(--color-text-light)" }}>
          Slightly Wide (0.02em)
        </h3>
        <p style={{ fontFamily: "Vank", fontSize: "1.5rem", letterSpacing: "0.02em", color: "var(--color-text)" }}>
          The quick brown fox jumps over the lazy dog
        </p>
      </div>

      <div style={{ marginBottom: "2rem" }}>
        <h3 style={{ fontFamily: "Vank", fontSize: "1rem", marginBottom: "0.5rem", opacity: 0.7, color: "var(--color-text-light)" }}>
          Wide (0.05em)
        </h3>
        <p style={{ fontFamily: "Vank", fontSize: "1.5rem", letterSpacing: "0.05em", color: "var(--color-text)" }}>
          The quick brown fox jumps over the lazy dog
        </p>
      </div>

      <div style={{ marginBottom: "2rem" }}>
        <h3 style={{ fontFamily: "Vank", fontSize: "1rem", marginBottom: "0.5rem", opacity: 0.7, color: "var(--color-text-light)" }}>
          Extra Wide (0.1em)
        </h3>
        <p style={{ fontFamily: "Vank", fontSize: "1.5rem", letterSpacing: "0.1em", color: "var(--color-text)" }}>
          The quick brown fox jumps over the lazy dog
        </p>
      </div>

      <div style={{ marginBottom: "2rem" }}>
        <h3 style={{ fontFamily: "Vank", fontSize: "1rem", marginBottom: "0.5rem", opacity: 0.7, color: "var(--color-text-light)" }}>
          Very Wide (0.15em)
        </h3>
        <p style={{ fontFamily: "Vank", fontSize: "1.5rem", letterSpacing: "0.15em", color: "var(--color-text)" }}>
          The quick brown fox jumps over the lazy dog
        </p>
      </div>

      <div style={{ marginTop: "3rem", paddingTop: "2rem", borderTop: "1px solid var(--color-border)" }}>
        <h2 style={{ fontFamily: "Vank", fontSize: "2rem", marginBottom: "2rem", textTransform: "uppercase", color: "var(--color-text)" }}>
          Uppercase Variants
        </h2>

        <div style={{ marginBottom: "2rem" }}>
          <h3 style={{ fontFamily: "Vank", fontSize: "1rem", marginBottom: "0.5rem", opacity: 0.7, color: "var(--color-text-light)" }}>
            Uppercase - Tight (-0.05em)
          </h3>
          <p style={{ fontFamily: "Vank", fontSize: "1.5rem", letterSpacing: "-0.05em", textTransform: "uppercase", color: "var(--color-text)" }}>
            The quick brown fox jumps over the lazy dog
          </p>
        </div>

        <div style={{ marginBottom: "2rem" }}>
          <h3 style={{ fontFamily: "Vank", fontSize: "1rem", marginBottom: "0.5rem", opacity: 0.7, color: "var(--color-text-light)" }}>
            Uppercase - Default (0em)
          </h3>
          <p style={{ fontFamily: "Vank", fontSize: "1.5rem", letterSpacing: "0em", textTransform: "uppercase", color: "var(--color-text)" }}>
            The quick brown fox jumps over the lazy dog
          </p>
        </div>

        <div style={{ marginBottom: "2rem" }}>
          <h3 style={{ fontFamily: "Vank", fontSize: "1rem", marginBottom: "0.5rem", opacity: 0.7, color: "var(--color-text-light)" }}>
            Uppercase - Wide (0.05em)
          </h3>
          <p style={{ fontFamily: "Vank", fontSize: "1.5rem", letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--color-text)" }}>
            The quick brown fox jumps over the lazy dog
          </p>
        </div>

        <div style={{ marginBottom: "2rem" }}>
          <h3 style={{ fontFamily: "Vank", fontSize: "1rem", marginBottom: "0.5rem", opacity: 0.7, color: "var(--color-text-light)" }}>
            Uppercase - Extra Wide (0.1em)
          </h3>
          <p style={{ fontFamily: "Vank", fontSize: "1.5rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-text)" }}>
            The quick brown fox jumps over the lazy dog
          </p>
        </div>

        <div style={{ marginBottom: "2rem" }}>
          <h3 style={{ fontFamily: "Vank", fontSize: "1rem", marginBottom: "0.5rem", opacity: 0.7, color: "var(--color-text-light)" }}>
            Uppercase - Very Wide (0.15em)
          </h3>
          <p style={{ fontFamily: "Vank", fontSize: "1.5rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--color-text)" }}>
            The quick brown fox jumps over the lazy dog
          </p>
        </div>
      </div>
    </div>
  ),
};

export const JetBrainsMono: Story = {
  render: () => (
    <div style={{ padding: "2rem", color: "var(--color-text)", backgroundColor: "var(--color-background)" }}>
      <h2 style={{ fontFamily: "JetBrains Mono", fontSize: "3rem", marginBottom: "1rem", color: "var(--color-text)" }}>
        JetBrains Mono
      </h2>
      <p style={{ fontFamily: "JetBrains Mono", fontSize: "1.5rem", marginBottom: "0.5rem", color: "var(--color-text)" }}>
        The quick brown fox jumps over the lazy dog
      </p>
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
    <div style={{ padding: "2rem", color: "var(--color-text)", backgroundColor: "var(--color-background)" }}>
      <div style={{ marginBottom: "3rem" }}>
        <h2 style={{ fontFamily: "Vank", fontSize: "3rem", marginBottom: "1rem", color: "var(--color-text)" }}>
          VANK Font
        </h2>
        <p style={{ fontFamily: "Vank", fontSize: "1.5rem", color: "var(--color-text)" }}>
          The quick brown fox jumps over the lazy dog
        </p>
      </div>
      <div>
        <h2 style={{ fontFamily: "JetBrains Mono", fontSize: "3rem", marginBottom: "1rem", color: "var(--color-text)" }}>
          JetBrains Mono
        </h2>
        <p style={{ fontFamily: "JetBrains Mono", fontSize: "1.5rem", color: "var(--color-text)" }}>
          The quick brown fox jumps over the lazy dog
        </p>
      </div>
    </div>
  ),
};
