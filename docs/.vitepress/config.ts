import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'bmad-dev-loop',
  titleTemplate: ':title — bmad-dev-loop',
  description:
    'Automated multi-story delivery orchestrator: dev → review → PR → CI → merge. An OpenCode / Claude skill, installable from source.',
  base: '/bmad-dev-loop/',
  cleanUrls: true,
  lastUpdated: true,
  appearance: 'dark',
  head: [
    ['meta', { name: 'theme-color', content: '#0b1020' }],
    ['meta', { name: 'og:type', content: 'website' }],
    ['meta', { name: 'og:title', content: 'bmad-dev-loop' }],
    [
      'meta',
      {
        name: 'og:description',
        content: 'Automated multi-story delivery orchestrator for coding agents.',
      },
    ],
    ['meta', { name: 'og:image', content: '/bmad-dev-loop/og-image.svg' }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:title', content: 'bmad-dev-loop' }],
    [
      'meta',
      {
        name: 'twitter:description',
        content: 'Automated multi-story delivery orchestrator for coding agents.',
      },
    ],
    ['meta', { name: 'twitter:image', content: '/bmad-dev-loop/og-image.svg' }],
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/bmad-dev-loop/favicon.svg' }],
  ],

  vite: {},

  markdown: {
    theme: {
      light: 'github-light',
      dark: 'github-dark',
    },
    lineNumbers: true,
    container: {
      tipLabel: 'Tip',
      warningLabel: 'Warning',
      dangerLabel: 'Danger',
      infoLabel: 'Info',
      detailsLabel: 'Details',
    },
  },

  themeConfig: {
    logo: { src: '/logo.svg', alt: 'bmad-dev-loop' },
    siteTitle: 'bmad-dev-loop',

    nav: [
      { text: 'Guide', link: '/guide/installation', activeMatch: '/guide/' },
      { text: 'Reference', link: '/reference/skill', activeMatch: '/reference/' },
      { text: 'Examples', link: '/examples/sample-sprint', activeMatch: '/examples/' },
      { text: 'Changelog', link: '/changelog' },
      { text: 'About', link: '/about' },
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Getting started',
          items: [
            { text: 'Installation', link: '/guide/installation' },
            { text: 'Quickstart', link: '/guide/quickstart' },
          ],
        },
        {
          text: 'How it works',
          items: [
            { text: 'The workflow', link: '/guide/workflow' },
            { text: 'Customization', link: '/guide/customization' },
            { text: 'Safety & HALT', link: '/guide/safety' },
          ],
        },
        {
          text: 'Operations',
          items: [
            { text: 'Troubleshooting', link: '/guide/troubleshooting' },
          ],
        },
      ],
      '/reference/': [
        {
          text: 'Skill reference',
          items: [
            { text: 'SKILL.md', link: '/reference/skill' },
            { text: 'Step contracts', link: '/reference/steps' },
            { text: 'CLI reference', link: '/reference/cli' },
            { text: 'loop-status schema', link: '/reference/schema' },
          ],
        },
      ],
      '/examples/': [
        {
          text: 'Sample data',
          items: [
            { text: 'Sample sprint-status.yaml', link: '/examples/sample-sprint' },
            { text: 'Sample loop-status.yaml', link: '/examples/sample-output' },
            { text: 'End-to-end demo', link: '/examples/end-to-end-demo' },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/mmornati/bmad-dev-loop' },
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2026 Marco Mornati',
    },

    editLink: {
      pattern: 'https://github.com/mmornati/bmad-dev-loop/edit/main/docs/:path',
      text: 'Edit this page on GitHub',
    },

    outline: { level: [2, 3], label: 'On this page' },

    docFooter: { prev: 'Previous', next: 'Next' },

    search: {
      provider: 'local',
      options: {
        miniSearch: {
          searchOptions: { fuzzy: 0.2, prefix: true, boost: { title: 4, text: 1 } },
        },
      },
    },
  },
});
