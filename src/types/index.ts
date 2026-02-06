import type { CollectionEntry } from 'astro:content'

export type Post = CollectionEntry<'posts'>
export type Photo = CollectionEntry<'photos'>
export * from './themeConfig.ts'
