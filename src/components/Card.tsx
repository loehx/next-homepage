import { h } from 'preact';
import type { ComponentChildren } from 'preact';
import './Card.css';

export interface CardProps {
  title: string;
  description: string;
  imageUrl?: string;
  imageAlt?: string;
  footer?: ComponentChildren;
  layout?: 'vertical' | 'horizontal';
  compact?: boolean;
}

export function Card({
  title,
  description,
  imageUrl,
  imageAlt = '',
  footer,
  layout = 'vertical',
  compact = false,
}: CardProps) {
  const classes = [
    'card',
    layout === 'horizontal' && 'card--horizontal',
    compact && 'card--compact',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes}>
      {imageUrl && (
        <img
          src={imageUrl}
          alt={imageAlt}
          className="card__image"
        />
      )}
      <div className="card__content">
        <h3 className="card__title">{title}</h3>
        <p className="card__description">{description}</p>
        {footer && <div className="card__footer">{footer}</div>}
      </div>
    </div>
  );
}
