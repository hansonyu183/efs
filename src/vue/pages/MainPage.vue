<template>
 <div class="efs-main-layout" :class="layoutClasses" data-dense="false">
  <aside
   v-if="shouldRenderSidebar"
   class="efs-main-layout__sidebar"
   :class="{ 'efs-main-layout__sidebar--open': sidebarOpen }"
  >
   <div class="efs-main-layout__brand-wrap">
    <slot name="brand">
     <img v-if="props.brandIcon" class="efs-main-layout__brand-logo" :src="props.brandIcon" :alt="resolvedBrandTitle" />
     <div v-else class="efs-main-layout__brand-mark">{{ brandInitial }}</div>
     <div class="efs-main-layout__brand-copy">
      <strong class="efs-main-layout__brand">{{ resolvedBrandTitle }}</strong>
      <span v-if="resolvedBrandSubtitle" class="efs-main-layout__brand-subtitle">{{ resolvedBrandSubtitle }}</span>
     </div>
    </slot>
   </div>

   <nav class="efs-main-layout__nav" @click="onSidebarClick">
    <slot name="sidebar" />
   </nav>
  </aside>

  <button
   v-if="shouldRenderSidebar && sidebarOpen && isMobile"
   class="efs-main-layout__scrim"
   type="button"
   :aria-label="resolvedMobileMenuLabel"
   @click="closeSidebar"
  />

  <div class="efs-main-layout__main">
   <header class="efs-main-layout__header">
    <div class="efs-main-layout__header-left">
     <button
      v-if="shouldRenderSidebar"
      class="efs-main-layout__iconbutton"
      type="button"
      :aria-label="resolvedMobileMenuLabel"
      @click="toggleSidebar"
     >
      <SemanticIcon name="menu" :label="resolvedMobileMenuLabel" aria-hidden="true" />
     </button>

     <div class="efs-main-layout__header-meta">
      <slot name="header-title">
       <div class="efs-main-layout__title">{{ resolvedTitle }}</div>
      </slot>
     </div>
    </div>

    <div class="efs-main-layout__header-actions">
     <LocaleSwitcher
      :model-value="props.locale"
      mode="icon"
      @update:model-value="(value) => emit('update:locale', value)"
     />
     <ThemeSwitcher
      :model-value="props.theme"
      mode="icon"
      @update:model-value="(value) => emit('update:theme', value)"
     />
     <details ref="moreMenuRef" class="efs-main-layout__moremenu">
      <summary class="efs-main-layout__iconbutton" :aria-label="resolvedMoreLabel" :title="resolvedMoreLabel">
       <SemanticIcon name="more" :label="resolvedMoreLabel" aria-hidden="true" />
      </summary>
      <div class="efs-main-layout__moremenu-panel">
       <div v-if="$slots.toolbar" class="efs-main-layout__moremenu-extra">
        <slot name="toolbar" />
       </div>

      <button v-if="isMobile" type="button" :title="resolvedAgentShowLabel" :aria-label="resolvedAgentShowLabel" @click="toggleMobileAgentBar">
       <span class="efs-main-layout__menuicon" aria-hidden="true">
        <SemanticIcon name="chat" :label="resolvedAgentShowLabel" size="sm" />
       </span>
       <span class="efs-main-layout__menulabel">{{ resolvedAgentShowLabel }}</span>
      </button>

      <button v-if="resolvedProfileDialog.enabled" type="button" :title="resolvedProfileDialog.label" :aria-label="resolvedProfileDialog.label" @click="openProfileDialog">
       <span class="efs-main-layout__menuicon" aria-hidden="true">
        <SemanticIcon name="user" :label="resolvedProfileDialog.label" size="sm" />
       </span>
       <span class="efs-main-layout__menulabel">{{ resolvedProfileDialog.label }}</span>
      </button>
      <button v-if="resolvedPasswordDialog.enabled" type="button" :title="resolvedPasswordDialog.label" :aria-label="resolvedPasswordDialog.label" @click="openPasswordDialog">
       <span class="efs-main-layout__menuicon" aria-hidden="true">
        <SemanticIcon name="lock" :label="resolvedPasswordDialog.label" size="sm" />
       </span>
       <span class="efs-main-layout__menulabel">{{ resolvedPasswordDialog.label }}</span>
      </button>
      <button type="button" class="efs-main-layout__logout-action" :title="resolvedLogoutLabel" :aria-label="resolvedLogoutLabel" @click="emitLogout">
       <span class="efs-main-layout__menuicon" aria-hidden="true">
        <SemanticIcon name="logout" :label="resolvedLogoutLabel" size="sm" />
       </span>
       <span class="efs-main-layout__menulabel">{{ resolvedLogoutLabel }}</span>
      </button>
     </div>
    </details>
   </div>
   </header>

   <section v-if="showAlertsRegion" class="efs-main-layout__alerts">
    <slot name="alerts" />
    <GlobalAlertsHost v-if="globalAlerts.hasItems.value" />
   </section>

   <main class="efs-main-layout__content">
    <slot />
   </main>

   <section v-if="showAgentBar" class="efs-main-layout__agentbar">
    <div class="efs-main-layout__agentbar-main">
     <div class="efs-main-layout__agentbar-header">
      <strong>{{ resolvedAgentTitle }}</strong>
      <button
       type="button"
       class="efs-main-layout__agentlink"
       :title="resolvedAgentSessionsLabel"
       :aria-label="resolvedAgentSessionsLabel"
       @click="handleAgentSessionsToggle"
      >
       <SemanticIcon name="sessions" :label="resolvedAgentSessionsLabel" aria-hidden="true" />
      </button>
     </div>
     <div v-if="$slots['agent-output']" class="efs-main-layout__agent-output">
      <slot name="agent-output" />
     </div>
     <div class="efs-main-layout__agentbar-form">
      <AppInput :model-value="agentDraft" :placeholder="resolvedAgentPlaceholder" @update:model-value="handleAgentInput" @keyup.enter="submitAgent" />
      <AppButton
       variant="primary"
       :disabled="props.agentBusy || !agentDraft.trim()"
       :title="resolvedAgentSubmitLabel"
       :aria-label="resolvedAgentSubmitLabel"
       @click="submitAgent"
      >
       <SemanticIcon name="send" :label="resolvedAgentSubmitLabel" aria-hidden="true" />
      </AppButton>
     </div>
    </div>
   </section>
  </div>

  <aside v-if="agentSessionsPanelOpen" class="efs-main-layout__agent-sessions">
   <header class="efs-main-layout__agent-sessions-header">
    <strong>{{ resolvedAgentSessionsLabel }}</strong>
    <button
     type="button"
     class="efs-main-layout__iconbutton"
      :aria-label="resolvedCloseLabel"
      :title="resolvedCloseLabel"
     @click="handleAgentSessionsToggle"
    >
     <SemanticIcon name="close"  :label="resolvedCloseLabel" aria-hidden="true" />
    </button>
   </header>
   <div class="efs-main-layout__agent-sessions-body">
    <slot name="agent-sessions">
     <div class="efs-main-layout__agent-sessions-empty">{{ resolvedAgentSessionsEmptyText }}</div>
    </slot>
   </div>
  </aside>

  <div v-if="profileDialogOpen" class="efs-main-layout__dialog-backdrop" @click.self="profileDialogOpen = false">
   <AppPanel class="efs-main-layout__dialog" :title="resolvedProfileDialog.label" :subtitle="resolvedProfileDialog.subtitle">
    <form class="efs-main-layout__dialog-form" @submit.prevent="submitProfile">
     <AppField :label="resolvedProfileDialog.displayNameLabel">
      <AppInput v-model="profileForm.displayName" :placeholder="resolvedProfileDialog.displayNameLabel" />
     </AppField>
     <div class="efs-main-layout__dialog-actions">
      <AppButton type="button" @click="profileDialogOpen = false">{{ resolvedProfileDialog.cancelLabel }}</AppButton>
      <AppButton variant="primary" type="submit" :disabled="!profileForm.displayName.trim()">{{ resolvedProfileDialog.submitLabel }}</AppButton>
     </div>
    </form>
   </AppPanel>
  </div>

  <div v-if="passwordDialogOpen" class="efs-main-layout__dialog-backdrop" @click.self="passwordDialogOpen = false">
   <AppPanel class="efs-main-layout__dialog" :title="resolvedPasswordDialog.label" :subtitle="resolvedPasswordDialog.subtitle">
    <form class="efs-main-layout__dialog-form" @submit.prevent="submitPassword">
     <AppField :label="resolvedPasswordDialog.currentPasswordLabel">
      <AppInput v-model="passwordForm.currentPassword" :placeholder="resolvedPasswordDialog.currentPasswordLabel" type="password" autocomplete="current-password" />
     </AppField>
     <AppField :label="resolvedPasswordDialog.newPasswordLabel">
      <AppInput v-model="passwordForm.newPassword" :placeholder="resolvedPasswordDialog.newPasswordLabel" type="password" autocomplete="new-password" />
     </AppField>
     <AppField :label="resolvedPasswordDialog.confirmPasswordLabel">
      <AppInput v-model="passwordForm.confirmPassword" :placeholder="resolvedPasswordDialog.confirmPasswordLabel" type="password" autocomplete="new-password" />
     </AppField>
     <p v-if="showPasswordMismatch" class="efs-main-layout__dialog-note">{{ resolvedPasswordDialog.mismatchMessage }}</p>
     <div class="efs-main-layout__dialog-actions">
      <AppButton type="button" @click="passwordDialogOpen = false">{{ resolvedPasswordDialog.cancelLabel }}</AppButton>
      <AppButton variant="primary" type="submit" :disabled="passwordSubmitDisabled">{{ resolvedPasswordDialog.submitLabel }}</AppButton>
     </div>
    </form>
   </AppPanel>
  </div>
 </div>
</template>

<script setup lang="ts">
import { useSlots } from 'vue'
import AppButton from '../controls/AppButton.vue'
import AppField from '../controls/AppField.vue'
import AppInput from '../controls/AppInput.vue'
import AppPanel from '../controls/AppPanel.vue'
import LocaleSwitcher from '../controls/LocaleSwitcher.vue'
import ThemeSwitcher from '../controls/ThemeSwitcher.vue'
import SemanticIcon from '../controls/SemanticIcon.vue'
import GlobalAlertsHost from '../feedback/GlobalAlertsHost.vue'
import { useMainPageModel } from '../../model/page/main-page'

defineOptions({ name: 'MainPage' })

interface MainPageProps {
 title?: string
 subtitle?: string
 brandIcon?: string
 brandTitle?: string
 appName?: string
 brandSubtitle?: string
 locale?: string
 theme?: string
 agentBusy?: boolean
 agentInput?: string
 agentSessionsOpen?: boolean
}

const props = withDefaults(defineProps<MainPageProps>(), {
 title: '',
 subtitle: '',
 brandIcon: '',
 brandTitle: '',
 appName: '',
 brandSubtitle: '',
 locale: 'zh-CN',
 theme: 'light',
 agentBusy: false,
 agentInput: '',
 agentSessionsOpen: false,
})

const emit = defineEmits<{
 (e: 'update:locale', value: string): void
 (e: 'update:theme', value: string): void
 (e: 'update:agentInput', value: string): void
 (e: 'update:agentSessionsOpen', value: boolean): void
 (e: 'submit-agent', value: string): void
 (e: 'submit-profile', value: { displayName: string }): void
 (e: 'submit-password', value: { currentPassword: string; newPassword: string; confirmPassword: string }): void
 (e: 'logout'): void
}>()

const slots = useSlots()
const {
 globalAlerts,
 moreMenuRef,
 profileDialogOpen,
 passwordDialogOpen,
 sidebarOpen,
 isMobile,
 profileForm,
 passwordForm,
 agentDraft,
 agentSessionsPanelOpen,
 shouldRenderSidebar,
 resolvedTitle,
 resolvedSubtitle,
 resolvedBrandTitle,
 resolvedBrandSubtitle,
 resolvedMobileMenuLabel,
 resolvedLogoutLabel,
 resolvedMoreLabel,
 resolvedAgentTitle,
 resolvedAgentPlaceholder,
 resolvedAgentSubmitLabel,
 resolvedAgentSessionsLabel,
 resolvedAgentSessionsEmptyText,
 resolvedCloseLabel,
 resolvedAgentShowLabel,
 resolvedProfileDialog,
 showAlertsRegion,
 resolvedPasswordDialog,
 showAgentBar,
 layoutClasses,
 initials,
 brandInitial,
 showPasswordMismatch,
 passwordSubmitDisabled,
 toggleSidebar,
 closeSidebar,
 onSidebarClick,
 openProfileDialog,
 openPasswordDialog,
 submitProfile,
 submitPassword,
 emitLogout,
 handleAgentInput,
 submitAgent,
 handleAgentSessionsToggle,
 toggleMobileAgentBar,
} = useMainPageModel(props, slots, emit)
</script>

<style scoped>
.efs-main-layout {
 min-height: 100vh;
 min-height: 100dvh;
 display: grid;
 grid-template-columns: 280px minmax(0, 1fr);
 background: var(--efs-surface-soft, #f4f7fb);
 color: var(--efs-text, #172033);
}

.efs-main-layout[data-dense='true'],
.efs-main-layout--sidebar-compact {
 grid-template-columns: 88px minmax(0, 1fr);
}

.efs-main-layout--sidebar-hidden {
 grid-template-columns: minmax(0, 1fr);
}

.efs-main-layout__sidebar {
 position: sticky;
 top: 0;
 height: 100vh;
 height: 100dvh;
 padding: 16px 14px;
 border-right: 1px solid var(--efs-border, #dbe3ef);
 background: var(--efs-surface, #fff);
 display: flex;
 flex-direction: column;
 gap: 18px;
 z-index: 30;
}

.efs-main-layout__brand-wrap {
 display: flex;
 align-items: center;
 gap: 12px;
 min-height: 52px;
}

.efs-main-layout__brand-mark {
 width: 40px;
 height: 40px;
 border-radius: 14px;
 display: inline-flex;
 align-items: center;
 justify-content: center;
 background: color-mix(in srgb, var(--efs-primary, #2563eb) 16%, var(--efs-surface, #fff));
 color: var(--efs-primary, #2563eb);
 font-weight: 800;
}

.efs-main-layout__brand-logo {
 width: 40px;
 height: 40px;
 border-radius: 12px;
 object-fit: cover;
 border: 1px solid var(--efs-border, #dbe3ef);
 background: var(--efs-surface, #fff);
}

.efs-main-layout__brand-copy {
 min-width: 0;
 display: grid;
}

.efs-main-layout__brand {
 font-size: 1rem;
 font-weight: 800;
}

.efs-main-layout__brand-subtitle {
 color: var(--efs-text-muted, #64748b);
 font-size: 0.78rem;
 white-space: nowrap;
 overflow: hidden;
 text-overflow: ellipsis;
}

.efs-main-layout__nav {
 display: grid;
 gap: 12px;
 align-content: start;
}

.efs-main-layout__nav :deep(.efs-sidebar-group) {
 display: grid;
 gap: 6px;
}

.efs-main-layout__nav :deep(.efs-sidebar-group__title) {
 padding: 6px 10px;
 color: var(--efs-text-muted, #64748b);
 font-size: 0.78rem;
 font-weight: 700;
 text-transform: uppercase;
 letter-spacing: 0.04em;
}

.efs-main-layout__nav :deep(.efs-sidebar-link) {
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

.efs-main-layout__nav :deep(.efs-sidebar-link:hover),
.efs-main-layout__nav :deep(.efs-sidebar-link.router-link-active) {
 background: var(--efs-surface-soft, #f4f7fb);
 color: var(--efs-primary, #2563eb);
}

.efs-main-layout__nav :deep(.efs-sidebar-link__icon) {
 width: 20px;
 text-align: center;
}

.efs-main-layout__nav :deep(.efs-sidebar-link__label),
.efs-main-layout__nav :deep(.efs-sidebar-link__meta) {
 overflow: hidden;
 text-overflow: ellipsis;
 white-space: nowrap;
}

.efs-main-layout__nav :deep(.efs-sidebar-link__body) {
 display: grid;
 min-width: 0;
}

.efs-main-layout__nav :deep(.efs-sidebar-link__meta) {
 font-size: 0.74rem;
 color: var(--efs-text-muted, #64748b);
}

.efs-main-layout--sidebar-compact .efs-main-layout__brand-copy,
.efs-main-layout--sidebar-compact .efs-main-layout__nav :deep(.efs-sidebar-group__title),
.efs-main-layout--sidebar-compact .efs-main-layout__nav :deep(.efs-sidebar-link__body) {
 display: none;
}

.efs-main-layout--sidebar-compact .efs-main-layout__nav :deep(.efs-sidebar-link) {
 grid-template-columns: 1fr;
 justify-items: center;
 padding: 0;
}

.efs-main-layout__main {
 min-width: 0;
 display: flex;
 flex-direction: column;
 min-height: 100vh;
 min-height: 100dvh;
}

.efs-main-layout__header {
 display: flex;
 justify-content: space-between;
 align-items: center;
 gap: 16px;
 flex-wrap: nowrap;
 padding: 14px 20px;
 border-bottom: 1px solid var(--efs-border, #dbe3ef);
 background: color-mix(in srgb, var(--efs-surface, #fff) 94%, transparent);
 backdrop-filter: blur(12px);
 position: sticky;
 top: 0;
 z-index: 20;
}

.efs-main-layout__header-left {
 display: flex;
 align-items: center;
 gap: 10px;
 min-width: 0;
}

.efs-main-layout__header-meta {
 min-width: 0;
 display: flex;
 align-items: center;
}

.efs-main-layout__title {
 font-size: 1rem;
 font-weight: 700;
 white-space: nowrap;
 overflow: hidden;
 text-overflow: ellipsis;
}

.efs-main-layout__subtitle {
 display: none;
}

.efs-main-layout__iconbutton {
 min-width: 40px;
 height: 40px;
 border-radius: 12px;
 border: 1px solid var(--efs-border, #dbe3ef);
 background: var(--efs-surface, #fff);
 color: var(--efs-text, #172033);
 display: inline-flex;
 align-items: center;
 justify-content: center;
 cursor: pointer;
}

.efs-main-layout__iconbutton--text {
 padding: 0 12px;
}

.efs-main-layout__menuicon {
 display: inline-flex;
 align-items: center;
 justify-content: center;
 min-width: 18px;
 font-size: 0.95rem;
}

.efs-main-layout__menulabel {
 display: inline-flex;
 align-items: center;
 justify-content: center;
 font-size: 0.86rem;
 font-weight: 600;
}

.efs-main-layout__header-actions {
 display: flex;
 align-items: center;
 justify-content: flex-end;
 gap: 10px;
 flex-wrap: nowrap;
 flex-shrink: 0;
}

.efs-main-layout__moremenu {
 position: relative;
}

.efs-main-layout__moremenu summary {
 list-style: none;
}

.efs-main-layout__moremenu summary::-webkit-details-marker {
 display: none;
}

.efs-main-layout__moremenu-panel {
 position: absolute;
 top: calc(100% + 8px);
 right: 0;
 width: min(196px, calc(100vw - 24px));
 padding: 8px;
 border-radius: 16px;
 border: 1px solid var(--efs-border, #dbe3ef);
 background: var(--efs-surface, #fff);
 box-shadow: 0 18px 40px rgba(15, 23, 42, 0.12);
 display: grid;
 gap: 6px;
 z-index: 30;
}

.efs-main-layout__moremenu-panel button {
 width: 100%;
 min-height: 40px;
 min-width: 40px;
 border: 0;
 border-radius: 10px;
 background: transparent;
 text-align: left;
 padding: 0 12px;
 cursor: pointer;
 display: inline-flex;
 align-items: center;
 justify-content: flex-start;
 gap: 8px;
}

.efs-main-layout__moremenu-panel button:hover {
 background: var(--efs-surface-soft, #f4f7fb);
}

.efs-main-layout__moremenu-panel :deep(.efs-localeswitcher),
.efs-main-layout__moremenu-panel :deep(.efs-themeswitcher) {
 width: 100%;
 border-radius: 10px;
 box-shadow: none;
}

.efs-main-layout__menuicon {
 display: inline-flex;
 align-items: center;
 justify-content: center;
 width: 18px;
 color: currentColor;
}

.efs-main-layout__moremenu-extra {
 padding: 4px 0;
 border-top: 1px solid var(--efs-border, #dbe3ef);
 border-bottom: 1px solid var(--efs-border, #dbe3ef);
}

.efs-main-layout__moremenu-panel .efs-main-layout__menulabel {
 display: inline-flex;
 align-items: center;
 min-width: 0;
}

.efs-main-layout__logout-action {
 color: var(--efs-danger, #dc2626);
}

.efs-main-layout__alerts {
 padding: 16px 20px 0;
}

.efs-main-layout__content {
 padding: 20px;
 min-width: 0;
 flex: 1;
}

.efs-main-layout__agentbar {
 position: sticky;
 bottom: 0;
 z-index: 18;
 padding: 12px 20px 20px;
 background: linear-gradient(180deg, rgba(244, 247, 251, 0), rgba(244, 247, 251, 0.92) 24%, rgba(244, 247, 251, 1) 100%);
}

.efs-main-layout__agentbar-main {
 padding: 14px;
 border-radius: 18px;
 border: 1px solid var(--efs-border, #dbe3ef);
 background: var(--efs-surface, #fff);
 box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
 display: grid;
 gap: 12px;
}

.efs-main-layout__agentbar-header {
 display: flex;
 align-items: center;
 justify-content: space-between;
 gap: 12px;
}

.efs-main-layout__agentlink {
 width: 36px;
 height: 36px;
 border: 1px solid var(--efs-border, #dbe3ef);
 border-radius: 10px;
 background: var(--efs-surface, #fff);
 color: var(--efs-primary, #2563eb);
 cursor: pointer;
}

.efs-main-layout__agent-output {
 max-height: 120px;
 overflow: auto;
 color: var(--efs-text-muted, #64748b);
}

.efs-main-layout__agentbar-form {
 display: grid;
 grid-template-columns: minmax(0, 1fr) auto;
 gap: 10px;
}

.efs-main-layout__agentbar-form :deep(.efs-appbutton) {
 min-width: 44px;
}

.efs-main-layout__agent-sessions {
 position: fixed;
 top: 0;
 right: 0;
 width: min(360px, 90vw);
 height: 100vh;
 height: 100dvh;
 border-left: 1px solid var(--efs-border, #dbe3ef);
 background: var(--efs-surface, #fff);
 box-shadow: -18px 0 40px rgba(15, 23, 42, 0.12);
 z-index: 35;
 display: grid;
 grid-template-rows: auto minmax(0, 1fr);
}

.efs-main-layout__agent-sessions-header {
 display: flex;
 align-items: center;
 justify-content: space-between;
 gap: 12px;
 padding: 16px;
 border-bottom: 1px solid var(--efs-border, #dbe3ef);
}

.efs-main-layout__agent-sessions-body {
 min-height: 0;
 overflow: auto;
 padding: 16px;
}

.efs-main-layout__agent-sessions-empty {
 color: var(--efs-text-muted, #64748b);
}

.efs-main-layout__scrim {
 position: fixed;
 inset: 0;
 border: 0;
 background: rgba(15, 23, 42, 0.35);
 z-index: 25;
}

.efs-main-layout__dialog-backdrop {
 position: fixed;
 inset: 0;
 display: grid;
 place-items: center;
 padding: 24px;
 background: rgba(15, 23, 42, 0.4);
 z-index: 40;
}

.efs-main-layout__dialog {
 width: min(100%, 480px);
}

.efs-main-layout__dialog-form {
 display: grid;
 gap: 16px;
}

.efs-main-layout__dialog-actions {
 display: flex;
 justify-content: flex-end;
 gap: 12px;
}

.efs-main-layout__dialog-note {
 margin: 0;
 color: var(--efs-danger, #dc2626);
}

@media (max-width: 960px) {
 .efs-main-layout,
 .efs-main-layout[data-dense='true'],
 .efs-main-layout--sidebar-compact {
  grid-template-columns: 1fr;
 }

 .efs-main-layout__sidebar {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: min(86vw, 300px);
  height: auto;
  transform: translateX(-100%);
  transition: transform 0.2s ease;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.18);
 }

 .efs-main-layout__sidebar--open {
  transform: translateX(0);
 }
}

@media (min-width: 641px) {
 .efs-main-layout:not([data-dense='true']) .efs-main-layout__moremenu-panel .efs-main-layout__menulabel {
  display: inline-flex;
 }
}

@media (max-width: 640px) {
 .efs-main-layout__content {
  padding: 16px;
 }

 .efs-main-layout__header,
 .efs-main-layout__agentbar,
 .efs-main-layout__alerts {
  padding-left: 16px;
  padding-right: 16px;
 }

 .efs-main-layout__agentbar-form {
  grid-template-columns: 1fr;
 }
}

@media (prefers-reduced-motion: reduce) {
 .efs-main-layout__sidebar {
  transition: none;
 }
}
</style>
