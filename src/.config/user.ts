import type { UserConfig } from '~/types'

export const userConfig: Partial<UserConfig> = {
  // Override the default config here
  site: {
    title: '内心世界',
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
    ]
    },
analytics: {
    googleAnalyticsId: 'G-HBNWHXK549',
  },
}
