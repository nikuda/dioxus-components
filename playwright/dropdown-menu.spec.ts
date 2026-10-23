import { test, expect } from '@playwright/test';

test('dropdown menu supports pointer and keyboard focus lifecycle', async ({ page }) => {
  await page.goto('http://127.0.0.1:8080/component/?name=dropdown_menu&');
  const menuTrigger = page.getByRole('button', { name: 'Open Menu' });
  const parentEscapes = page.getByText(/Parent Escapes:/);

  await test.step('pointer interaction opens the menu', async () => {
    await expect(menuTrigger).toHaveAttribute('data-state', 'closed');
    await menuTrigger.click();
    await expect(menuTrigger).toHaveAttribute('data-state', 'open');
  });

  await test.step('keyboard navigation skips disabled items and selection restores focus', async () => {
    await page.keyboard.press('ArrowDown');
    await expect(page.getByRole('menuitem', { name: 'Edit' })).toBeFocused();
    await expect(page.getByRole('menuitem', { name: 'Undo' })).toHaveAttribute(
      'data-disabled',
      'true',
    );
    await page.keyboard.press('ArrowDown');
    await expect(page.getByRole('menuitem', { name: 'Duplicate' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(menuTrigger).toHaveAttribute('data-state', 'closed');
    await expect(menuTrigger).toBeFocused();
    await expect(page.getByText('Selected: Duplicate')).toBeVisible();
  });

  await test.step('ArrowDown opens a closed menu at its first enabled item', async () => {
    await page.keyboard.press('ArrowDown');
    await expect(menuTrigger).toHaveAttribute('data-state', 'open');
    await expect(page.getByRole('menuitem', { name: 'Edit' })).toBeFocused();
  });

  await test.step('Escape closes the menu and restores trigger focus', async () => {
    await page.keyboard.press('Escape');
    await expect(menuTrigger).toHaveAttribute('data-state', 'closed');
    await expect(menuTrigger).toBeFocused();
    await expect(parentEscapes).toHaveText('Parent Escapes: 0');
  });

  await test.step('Escape from a closed menu remains available to its parent', async () => {
    await page.keyboard.press('Escape');
    await expect(parentEscapes).toHaveText('Parent Escapes: 1');
  });

  await test.step('Enter opens a closed menu at its first enabled item', async () => {
    await page.keyboard.press('Enter');
    await expect(menuTrigger).toHaveAttribute('data-state', 'open');
    await expect(page.getByRole('menuitem', { name: 'Edit' })).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(menuTrigger).toBeFocused();
  });

  await test.step('Space opens a closed menu at its first enabled item', async () => {
    await page.keyboard.press('Space');
    await expect(menuTrigger).toHaveAttribute('data-state', 'open');
    await expect(page.getByRole('menuitem', { name: 'Edit' })).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(menuTrigger).toBeFocused();
  });

  await test.step('ArrowUp opens a closed menu at its last enabled item', async () => {
    await page.keyboard.press('ArrowUp');
    await expect(menuTrigger).toHaveAttribute('data-state', 'open');
    await expect(page.getByRole('menuitem', { name: 'Show details' })).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(menuTrigger).toBeFocused();
  });

  await test.step('Tab closes the menu', async () => {
    await menuTrigger.click();
    await expect(menuTrigger).toHaveAttribute('data-state', 'open');
    await page.keyboard.press('Tab');
    await expect(menuTrigger).toHaveAttribute('data-state', 'closed');
  });

  await test.step('outside pointer interaction closes the menu', async () => {
    await menuTrigger.click();
    await expect(menuTrigger).toHaveAttribute('data-state', 'open');
    await page.locator('body').click({ position: { x: 0, y: 0 } });
    await expect(menuTrigger).toHaveAttribute('data-state', 'closed');
  });

  await test.step('pointer selection closes the menu and restores trigger focus', async () => {
    await menuTrigger.click();
    await expect(menuTrigger).toHaveAttribute('data-state', 'open');
    await page.getByRole('menuitem', { name: 'Edit' }).click();
    await expect(menuTrigger).toHaveAttribute('data-state', 'closed');
    await expect(menuTrigger).toBeFocused();
    await expect(page.getByText('Selected: Edit')).toBeVisible();
  });

  await test.step('a pointer action can open a focus-owning surface without menu interference', async () => {
    await menuTrigger.click();
    await page.getByRole('menuitem', { name: 'Show details' }).click();
    await expect(menuTrigger).toHaveAttribute('data-state', 'closed');

    const dialog = page.getByRole('dialog', { name: 'Action details' });
    const closeDialog = dialog.getByRole('button', { name: 'Close dialog' });
    await expect(dialog).toBeVisible();
    await expect(closeDialog).toBeFocused();

    await closeDialog.click();
    await expect(dialog).toBeHidden();
    await expect(menuTrigger).toBeFocused();
  });

  await test.step('a keyboard action has the same focus ownership', async () => {
    await page.keyboard.press('ArrowUp');
    await expect(page.getByRole('menuitem', { name: 'Show details' })).toBeFocused();
    await page.keyboard.press('Enter');

    const dialog = page.getByRole('dialog', { name: 'Action details' });
    const closeDialog = dialog.getByRole('button', { name: 'Close dialog' });
    await expect(dialog).toBeVisible();
    await expect(closeDialog).toBeFocused();

    await closeDialog.click();
    await expect(dialog).toBeHidden();
    await expect(menuTrigger).toBeFocused();
  });
});
