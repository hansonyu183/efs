<template>
  <AuthLayout
    title="欢迎登录"
    subtitle="使用标准 AuthLayout + 标准 switcher 的登录页示例"
    app-name="EFS Demo"
    layout="split"
    :locale="locale"
    :theme="theme"
    :show-locale-switcher="true"
    :show-theme-switcher="true"
    hero-title="企业认证页必须优先使用统一 Auth 壳层"
    hero-subtitle="品牌区、hero 区、告警区、底部辅助区和 theme/locale 切换能力，都应由标准组件承载，而不是在业务项目里再拼第二套。"
    footer-text="演示账号：admin / demo"
    support-text="如需开通真实账号，请联系平台管理员。"
    @update:locale="locale = $event"
    @update:theme="theme = $event"
  >
    <template #alerts>
      <AppAlerts :items="alerts" />
    </template>

    <form class="demo-login-page__form" @submit.prevent="submitLogin">
      <AppField label="用户名">
        <AppInput v-model="form.username" placeholder="请输入用户名" autocomplete="username" />
      </AppField>
      <AppField label="密码">
        <AppInput v-model="form.password" placeholder="请输入密码" type="password" autocomplete="current-password" />
      </AppField>
      <AppButton variant="primary" block type="submit">登录</AppButton>
    </form>
  </AuthLayout>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import AuthLayout from '../../../../packages/vue/src/components/foundation/AuthLayout.vue'
import AppAlerts from '../../../../packages/vue/src/components/foundation/AppAlerts.vue'
import AppButton from '../../../../packages/vue/src/components/foundation/AppButton.vue'
import AppField from '../../../../packages/vue/src/components/foundation/AppField.vue'
import AppInput from '../../../../packages/vue/src/components/foundation/AppInput.vue'

const router = useRouter()
const locale = ref('zh-CN')
const theme = ref<'light' | 'dark'>('light')
const alerts = ref([{ level: 'info', message: '这是标准登录页示例，提交后将跳转到工作台。' }])
const form = reactive({
  username: 'admin',
  password: 'demo',
})

function submitLogin() {
  alerts.value = [{ level: 'success', message: `已使用 ${form.username} 登录演示环境，正在进入工作台。` }]
  window.setTimeout(() => {
    router.push('/workbench')
  }, 250)
}
</script>

<style scoped>
.demo-login-page__form {
  display: grid;
  gap: 16px;
}
</style>
