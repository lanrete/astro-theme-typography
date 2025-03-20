import type { UserConfig } from '~/types'

export const userConfig: Partial<UserConfig> = {
  // Override the default config here
  site: {
    title: 'Inner Side',
    author: 'lrt',
    description: 'Everyone has a inner side. This is mine.',
    website: 'https://lrt.one/',
    socialLinks: [
      {
        name: 'github',
        href: 'https://github.com/lanrete/astro-theme-typography',
      },
      {
        name: 'rss',
        href: '/atom.xml',
      }
    },
  // seo: { twitter: "@moeyua13" },
}
