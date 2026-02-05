import { h } from 'preact';
import './Button.css';

export interface ButtonProps {
  label: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  block?: boolean;
  disabled?: boolean;
}

export function Button({
  label,
  onClick,
  variant = 'primary',
  size = 'medium',
  block = false,
  disabled = false,
}: ButtonProps) {
  const classes = [
    'button',
    variant !== 'primary' && `button--${variant}`,
    size !== 'medium' && `button--${size}`,
    block && 'button--block',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      className={classes}
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </button>
  );
}
