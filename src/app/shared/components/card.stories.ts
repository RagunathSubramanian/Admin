import type { Meta, StoryObj } from '@storybook/angular';
import { CardComponent } from './card.component';

const meta: Meta<CardComponent> = {
  title: 'Components/Card',
  component: CardComponent,
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
      description: 'Card title',
    },
    subtitle: {
      control: 'text',
      description: 'Card subtitle',
    },
    padding: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg'],
      description: 'Padding size',
    },
    footer: {
      control: 'boolean',
      description: 'Show footer section',
    },
  },
};

export default meta;
type Story = StoryObj<CardComponent>;

export const Default: Story = {
  args: {
    title: 'Card Title',
    padding: 'md',
  },
  render: (args) => ({
    props: args,
    template: `
      <app-card [title]="title" [subtitle]="subtitle" [padding]="padding" [footer]="footer">
        <p>This is the card content. You can put any content here.</p>
      </app-card>
    `,
  }),
};

export const WithSubtitle: Story = {
  args: {
    title: 'Card Title',
    subtitle: 'This is a subtitle',
    padding: 'md',
  },
  render: (args) => ({
    props: args,
    template: `
      <app-card [title]="title" [subtitle]="subtitle" [padding]="padding">
        <p>Card content goes here.</p>
      </app-card>
    `,
  }),
};

export const WithFooter: Story = {
  args: {
    title: 'Card with Footer',
    padding: 'md',
    footer: true,
  },
  render: (args) => ({
    props: args,
    template: `
      <app-card [title]="title" [padding]="padding" [footer]="footer">
        <p>This card has a footer section.</p>
        <div footer>
          <button class="px-4 py-2 bg-primary-600 text-white rounded-lg">Action</button>
        </div>
      </app-card>
    `,
  }),
};

export const NoPadding: Story = {
  args: {
    title: 'Card without padding',
    padding: 'none',
  },
  render: (args) => ({
    props: args,
    template: `
      <app-card [title]="title" [padding]="padding">
        <div class="p-6 bg-gray-100">
          <p>Content with custom padding.</p>
        </div>
      </app-card>
    `,
  }),
};

export const LargePadding: Story = {
  args: {
    title: 'Card with large padding',
    padding: 'lg',
  },
  render: (args) => ({
    props: args,
    template: `
      <app-card [title]="title" [padding]="padding">
        <p>This card has large padding for more spacious content.</p>
      </app-card>
    `,
  }),
};

