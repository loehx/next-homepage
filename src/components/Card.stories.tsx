import type { Meta, StoryObj } from '@storybook/preact';
import { h } from 'preact';
import { Card } from './Card';
import { Button } from './Button';

const meta: Meta<typeof Card> = {
  title: 'Components/Card',
  tags: ['autodocs'],
  component: Card,
  decorators: [
    (Story) => h('div', { style: { maxWidth: '400px' } }, h(Story)),
  ],
  argTypes: {
    layout: {
      control: 'select',
      options: ['vertical', 'horizontal'],
    },
    compact: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  args: {
    title: 'Card Title',
    description: 'This is a card component with a description. It can be used to display various types of content.',
    imageUrl: 'https://images.unsplash.com/photo-1661956602116-aa6865609028?w=400',
    imageAlt: 'Abstract background',
  },
};

export const WithoutImage: Story = {
  args: {
    title: 'Text Only Card',
    description: 'This card has no image, just text content.',
  },
};

export const WithFooter: Story = {
  args: {
    title: 'Card with Footer',
    description: 'This card includes a footer section with action buttons.',
    imageUrl: 'https://images.unsplash.com/photo-1661956602116-aa6865609028?w=400',
    imageAlt: 'Abstract background',
    footer: h('div', { style: { display: 'flex', gap: '0.5rem' } }, [
      h(Button, { label: 'Action', size: 'small' }),
      h(Button, { label: 'More', size: 'small', variant: 'outline' }),
    ]),
  },
};

export const Horizontal: Story = {
  args: {
    title: 'Horizontal Card',
    description: 'This card uses a horizontal layout with the image on the side.',
    imageUrl: 'https://images.unsplash.com/photo-1661956602116-aa6865609028?w=400',
    imageAlt: 'Abstract background',
    layout: 'horizontal',
  },
};

export const Compact: Story = {
  args: {
    title: 'Compact Card',
    description: 'This is a compact version with less padding and smaller text.',
    imageUrl: 'https://images.unsplash.com/photo-1661956602116-aa6865609028?w=400',
    imageAlt: 'Abstract background',
    compact: true,
  },
};
