<template>
  <div class="demo-app">
    <nav class="demo-nav">
      <RouterLink to="/workbench">工作台</RouterLink>
      <RouterLink to="/customers">客户列表</RouterLink>
      <RouterLink to="/runtime">运行时页</RouterLink>
    </nav>
    <RouterView />
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.demo-app { font-family: Arial, sans-serif; padding: 16px; }
.demo-nav { display: flex; gap: 16px; margin-bottom: 16px; }
</style>
