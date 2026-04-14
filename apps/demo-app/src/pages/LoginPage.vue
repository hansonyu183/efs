<template>
  <AuthPage
    title="欢迎登录"
    subtitle="使用标准 AuthPage + 标准 switcher 的登录页示例"
    app-name="EFS Demo"
    layout="split"
    :locale="locale"
    :theme="theme"
    :show-locale-switcher="true"
    :show-theme-switcher="true"
    hero-title="企业认证页必须优先使用统一 Auth Page"
    hero-subtitle="品牌区、hero 区、底部辅助区和 theme/locale 切换能力，都应由标准组件承载，而不是在业务项目里再拼第二套。"
    footer-text="演示账号：admin / demo"
    support-text="如需开通真实账号，请联系平台管理员。"
    @update:locale="locale = $event"
    @update:theme="theme = $event"
  >
    <form class="demo-login-page__form" @submit.prevent="submitLogin">
      <AppField label="用户名">
        <AppInput v-model="form.username" placeholder="请输入用户名" autocomplete="username" />
      </AppField>
      <AppField label="密码">
        <AppInput v-model="form.password" placeholder="请输入密码" type="password" autocomplete="current-password" />
      </AppField>
      <AppButton variant="primary" block type="submit">登录</AppButton>
    </form>
  </AuthPage>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import AuthPage from '../../../../packages/vue/src/components/pages/AuthPage.vue'
import AppButton from '../../../../packages/vue/src/components/controls/AppButton.vue'
import AppField from '../../../../packages/vue/src/components/controls/AppField.vue'
import AppInput from '../../../../packages/vue/src/components/controls/AppInput.vue'

const router = useRouter()
const locale = ref('zh-CN')
const theme = ref<'light' | 'dark'>('light')
const form = reactive({
  username: 'admin',
  password: 'demo',
})

function submitLogin() {
  window.setTimeout(() => {
    router.push('/admin/user')
  }, 250)
}
</script>

<style scoped>
.demo-login-page__form {
  display: grid;
  gap: 16px;
}
</style>
