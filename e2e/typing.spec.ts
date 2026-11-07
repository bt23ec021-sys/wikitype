import { expect, test } from '@playwright/test'
const sample = Array(8).fill('Wikipedia articles contain useful facts and interesting stories about the world.').join(' ')
test.beforeEach(async ({ page }) => {
  await page.route('https://en.wikipedia.org/w/api.php**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ query: { pages: [{ pageid: Math.floor(Math.random() * 100000) + 1, ns: 0, title: 'E2E Article', fullurl: 'https://en.wikipedia.org/wiki/Example', extract: sample }] } }) })
  })
})
test('loads an attributed article and completes a custom typing session', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('E2E Article')).toBeVisible()
  await page.getByRole('button', { name: 'Custom' }).click()
  await page.getByLabel('Your practice text').fill('The rain in the city brings quiet streets.')
  await page.getByRole('button', { name: 'Start custom test' }).click()
  await page.getByRole('textbox', { name: /type the passage/i }).fill('The rain in the city brings quiet streets.')
  await expect(page.getByText('Well typed.')).toBeVisible()
  await page.getByRole('button', { name: 'History' }).first().click()
  await expect(page.getByText('Recent sessions')).toBeVisible()
})
test('can restart the typing interface and switch themes', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('E2E Article')).toBeVisible()
  await page.getByRole('textbox', { name: /type the passage/i }).fill('Wiki')
  await page.getByRole('button', { name: 'Restart', exact: true }).click()
  await expect(page.getByText('READY WHEN YOU ARE')).toBeVisible()
  await page.getByRole('button', { name: /theme/i }).click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', /dark|light/)
})
