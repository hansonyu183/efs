<template>
 <nav class="efs-sidebar-nav" aria-label="EFS sidebar">
  <ul class="efs-sidebar-nav__list">
   <li v-for="node in menuTree" :key="node.key" class="efs-sidebar-nav__item">
    <template v-if="node.type === 'group'">
     <div class="efs-sidebar-nav__group">
      <SemanticIcon :name="node.icon || 'folder'" size="sm" />
      <span class="efs-sidebar-nav__label">{{ resolveNodeTitle(node) }}</span>
     </div>
     <EfsSidebarNav :items="node.children" :current-path="currentPath" :tree="true" @navigate="(path) => emit('navigate', path)" />
    </template>

    <a
     v-else
     :href="node.path || '/'"
     class="efs-sidebar-nav__link"
     :class="{
      'efs-sidebar-nav__link--active': isActive(node.path),
      'efs-sidebar-nav__link--disabled': node.disabled,
     }"
     :aria-current="isActive(node.path) ? 'page' : undefined"
     @click.prevent="handleNavigate(node.path, node.disabled)"
    >
     <span class="efs-sidebar-nav__icon" aria-hidden="true">
      <SemanticIcon :name="node.icon || 'folder'" size="sm" />
     </span>
     <span class="efs-sidebar-nav__body">
      <span class="efs-sidebar-nav__label">{{ resolveNodeTitle(node) }}</span>
     </span>
    </a>
   </li>
  </ul>
 </nav>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue'
import type { FlatMenuNode, SidebarMenuTreeNode } from '../shared/navigation-menu'
import { buildSidebarMenuTree } from '../shared/navigation-menu'
import { splitResPath } from '../legacy/path-helpers'
import { EFS_I18N_CONTEXT } from '../shared/efs-i18n'
import SemanticIcon from '../controls/SemanticIcon.vue'

defineOptions({ name: 'EfsSidebarNav' })

type MenuInput = FlatMenuNode | SidebarMenuTreeNode

interface EfsSidebarNavProps {
 items?: MenuInput[]
 currentPath?: string
 tree?: boolean
}

const props = withDefaults(defineProps<EfsSidebarNavProps>(), {
 items: () => [],
 currentPath: '',
 tree: false,
})

const emit = defineEmits<{
 (e: 'navigate', path: string): void
}>()

const i18nContext = inject(EFS_I18N_CONTEXT, null)
const menuTree = computed<SidebarMenuTreeNode[]>(() => {
 if (props.tree) return (props.items as SidebarMenuTreeNode[]) || []
 return buildSidebarMenuTree(props.items as FlatMenuNode[])
})

function resolveNodeTitle(node: MenuInput) {
 const fallback = node.title || node.key
 const path = 'path' in node ? node.path : undefined
 const parsed = path ? splitResPath(path) : null
 if (parsed) return i18nContext?.translate(`efs.resources.${parsed.domain}.${parsed.res}.title`) || fallback
 return i18nContext?.translate(`efs.domains.${node.key}.title`) || fallback
}

function isActive(path?: string) {
 return Boolean(path && path === props.currentPath)
}

function handleNavigate(path?: string, disabled?: boolean) {
 if (!path || disabled) return
 emit('navigate', path)
}
</script>

<style scoped>
.efs-sidebar-nav,
.efs-sidebar-nav__list {
 display: grid;
 gap: 6px;
}

.efs-sidebar-nav__list {
 margin: 0;
 padding: 0;
 list-style: none;
}

.efs-sidebar-nav__item {
 display: grid;
 gap: 6px;
}

.efs-sidebar-nav__group {
 display: inline-flex;
 align-items: center;
 gap: 8px;
 padding: 6px 10px;
 color: var(--efs-text-muted, #64748b);
 font-size: 0.78rem;
 font-weight: 700;
 text-transform: uppercase;
 letter-spacing: 0.04em;
}

.efs-sidebar-nav :deep(.efs-sidebar-nav) {
 margin-left: 6px;
}

.efs-sidebar-nav__link {
 display: grid;
 grid-template-columns: 20px minmax(0, 1fr);
 align-items: center;
 gap: 10px;
 min-height: 42px;
 padding: 0 12px;
 border-radius: 12px;
 color: inherit;
 text-decoration: none;
}

.efs-sidebar-nav__link:hover,
.efs-sidebar-nav__link--active {
 background: var(--efs-surface-soft, #f4f7fb);
 color: var(--efs-primary, #2563eb);
}

.efs-sidebar-nav__link--disabled {
 opacity: 0.5;
 pointer-events: none;
}

.efs-sidebar-nav__label {
 overflow: hidden;
 text-overflow: ellipsis;
 white-space: nowrap;
}
</style>
