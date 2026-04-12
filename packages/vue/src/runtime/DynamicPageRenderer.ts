export function DynamicPageRenderer(pageType, manifest) {
  return {
    pageType,
    manifest,
    strategy: 'standard-shell-runtime-renderer'
  }
}
