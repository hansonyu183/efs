import { test, expect } from '@playwright/test'

const username = process.env.PLAYWRIGHT_AGENTOS_USERNAME
const password = process.env.PLAYWRIGHT_AGENTOS_PASSWORD

test.describe('agentos auth smoke', () => {
  test.skip(!username || !password, 'Set PLAYWRIGHT_AGENTOS_USERNAME and PLAYWRIGHT_AGENTOS_PASSWORD to run the real backend smoke test.')

  test('can login and logout with the local backend', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('button', { name: '登录' })).toBeVisible()

    await page.getByPlaceholder('请输入用户名').fill(username!)
    await page.getByPlaceholder('请输入密码').fill(password!)
    await page.getByRole('button', { name: '登录' }).click()

    await expect(page.getByTitle('更多')).toBeVisible()
    await page.getByTitle('更多').click()
    await page.getByTitle('退出登录').click()

    await expect(page.getByRole('button', { name: '登录' })).toBeVisible()
  })
})
