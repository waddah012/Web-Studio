import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFile } from 'node:fs/promises';

async function openEditor(page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Open website editor' }).first().click();
  await expect(page.getByRole('dialog', { name: 'Personal portfolio' })).toBeVisible();
}
const preview = page => page.frameLocator('#website-preview');
const section = page => page.locator('.section-control');

test('edit, add, reorder, undo and save website across reload', async ({ page }) => {
  await openEditor(page);
  await page.getByLabel('Headline', { exact: true }).fill('A website built for people.');
  await expect(preview(page).getByRole('heading', { level: 1 })).toHaveText('A website built for people.');
  await page.getByLabel('Section type', { exact: true }).selectOption('text');
  await page.getByRole('button', { name: 'Add section', exact: true }).click();
  await section(page).last().getByLabel('Section title', { exact: true }).fill('Our story');
  await section(page).last().getByRole('button', { name: /Move up/ }).click();
  await expect(section(page).first().getByLabel('Section title', { exact: true })).toHaveValue('Our story');
  await page.getByRole('button', { name: 'Undo', exact: true }).click();
  await expect(section(page).last().getByLabel('Section title', { exact: true })).toHaveValue('Our story');
  await page.getByRole('button', { name: 'Redo', exact: true }).click();
  await page.getByRole('button', { name: 'Save website', exact: true }).click();
  await expect(page.locator('#editor-status')).toHaveText('All changes saved');
  await page.reload();
  await page.getByRole('button', { name: 'Open website editor' }).first().click();
  await expect(page.getByLabel('Headline', { exact: true })).toHaveValue('A website built for people.');
  await expect(section(page).first().getByLabel('Section title', { exact: true })).toHaveValue('Our story');
});

test('close protection, draft recovery, and discarding an unsaved draft', async ({ page }) => {
  await openEditor(page);
  const original = await page.getByLabel('Headline', { exact: true }).inputValue();
  await page.getByLabel('Headline', { exact: true }).fill('Recovered draft');
  page.once('dialog', dialog => dialog.dismiss());
  await page.getByRole('button', { name: 'Close website editor' }).click();
  await expect(page.locator('#website-editor')).toBeVisible();
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: 'Close website editor' }).click();
  await page.reload();
  await page.getByRole('button', { name: 'Open website editor' }).first().click();
  await expect(page.getByLabel('Headline', { exact: true })).toHaveValue('Recovered draft');
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: 'Discard draft' }).click();
  await expect(page.getByLabel('Headline', { exact: true })).toHaveValue(original);
  await expect(page.locator('#editor-status')).toHaveText('All changes saved');
});

test('section removal is undoable and standalone export contains edited navigation and footer', async ({ page }) => {
  await openEditor(page);
  await page.getByLabel('Brand name', { exact: true }).fill('North Studio');
  await page.getByLabel('Navigation contact label', { exact: true }).fill('Say hello');
  await page.getByLabel('Footer text', { exact: true }).fill('North Studio · Independent design');
  await section(page).first().getByRole('button', { name: /Remove/ }).click();
  await expect(section(page)).toHaveCount(0);
  await page.getByRole('button', { name: 'Undo', exact: true }).click();
  await expect(section(page)).toHaveCount(1);
  const downloading = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export HTML' }).click();
  const file = await downloading;
  const html = await readFile(await file.path(), 'utf8');
  const exported = await page.context().newPage();
  await exported.setContent(html);
  await expect(exported.getByRole('navigation')).toContainText('Say hello');
  await expect(exported.locator('footer')).toContainText('North Studio · Independent design');
  await expect(exported.getByRole('heading', { name: 'Our approach' })).toBeVisible();
  const audit = await new AxeBuilder({ page: exported }).setLegacyMode().analyze();
  expect(audit.violations).toEqual([]);
});

test('keyboard controls and editor accessibility pass automated checks', async ({ page }) => {
  await openEditor(page);
  await page.getByRole('button', { name: 'Mobile', exact: true }).click();
  await expect(page.locator('#mobile-preview')).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Close website editor' }).focus();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('combobox', { name: 'Starting template', exact: true })).toBeFocused();
  const results = await new AxeBuilder({ page }).include('#website-editor').options({ iframes: false }).setLegacyMode().analyze();
  expect(results.violations).toEqual([]);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  expect(overflow).toBe(false);
});

test('image uploads are embedded and have descriptive alternative text', async ({ page }, testInfo) => {
  await openEditor(page);
  await page.getByLabel('Section type', { exact: true }).selectOption('image');
  await page.getByRole('button', { name: 'Add section', exact: true }).click();
  await section(page).last().getByLabel('Image description', { exact: true }).fill('A sample project image');
  await section(page).last().getByLabel('Upload image', { exact: true }).setInputFiles({
    name: 'sample.png', mimeType: 'image/png',
    buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/n1sAAAAASUVORK5CYII=', 'base64'),
  });
  await expect(preview(page).getByRole('img', { name: 'A sample project image' })).toHaveAttribute('src', /^data:image\/png;base64,/);
  await page.getByRole('button', { name: 'Save website', exact: true }).click();
  await page.reload();
  await page.getByRole('button', { name: 'Open website editor' }).first().click();
  await expect(preview(page).getByRole('img', { name: 'A sample project image' })).toBeVisible();
  if (testInfo.project.name === 'desktop') await page.screenshot({ path: testInfo.outputPath('editor.png') });
});

test('failed persistent saves stay dirty and show recovery guidance', async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => { throw new DOMException('Storage full', 'QuotaExceededError'); };
  });
  await openEditor(page);
  await page.getByLabel('Headline', { exact: true }).fill('Keep my changes');
  await expect(page.locator('#editor-status')).toContainText('recovery unavailable');
  await page.getByRole('button', { name: 'Save website', exact: true }).click();
  await expect(page.locator('#editor-status')).toContainText('Unsaved changes');
  await expect(page.locator('#toast')).toContainText('could not be saved');
  await expect(preview(page).getByRole('heading', { level: 1 })).toHaveText('Keep my changes');
});

test('Escape keeps a dirty editor open when leaving is cancelled', async ({ page }) => {
  await openEditor(page);
  await page.getByLabel('Headline', { exact: true }).fill('Do not lose this draft');
  page.once('dialog', dialog => dialog.dismiss());
  await page.keyboard.press('Escape');
  await expect(page.locator('#website-editor')).toBeVisible();
  await expect(page.getByLabel('Headline', { exact: true })).toHaveValue('Do not lose this draft');
});
