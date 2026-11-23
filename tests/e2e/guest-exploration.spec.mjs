import { expect, test } from '@playwright/test';

test('guest visit explores protected areas without account data or writes', async ({ page }) => {
  const writes = [];
  page.on('request', (request) => {
    if (request.method() !== 'GET' && /\/v1\/(?:tool-submissions|tool-ratings|billing\/checkout-sessions)/.test(request.url())) {
      writes.push(request.url());
    }
  });

  await page.goto('/');
  await page.getByRole('button', { name: 'Português' }).click();
  await page.getByRole('link', { name: 'Entrar sem conta' }).click();
  await expect(page.locator('.guestModeBanner')).toBeVisible();

  await page.goto('/favoritas');
  await expect(page.getByTestId('guest-pro-preview')).toBeVisible();
  await page.getByRole('button', { name: '♡ Adicionar ao exemplo' }).click();
  await expect(page.getByRole('button', { name: '♥ Remover do exemplo' })).toBeVisible();

  await page.goto('/reviews');
  await page.getByLabel('A tua avaliação de exemplo').selectOption('4');
  await page.getByLabel('Nota de exemplo').fill('Nota temporária');
  await expect(page.getByLabel('Nota de exemplo')).toHaveValue('Nota temporária');

  await page.goto('/conta');
  await expect(page.getByTestId('guest-account-preview')).toBeVisible();
  await expect(page.getByText('Visitante de exemplo')).toBeVisible();

  await page.goto('/submeter');
  await page.getByLabel('Nome *').fill('Ferramenta de exemplo');
  await page.getByLabel('Site *').fill('https://example.com');
  await page.getByRole('button', { name: 'Submeter', exact: true }).click();
  await expect(page.getByText('Pré-visualização concluída. Esta ferramenta não foi enviada nem guardada.')).toBeVisible();
  expect(writes).toEqual([]);

  await page.reload();
  await expect(page.locator('.guestModeBanner')).toBeVisible();
  await page.goto('/favoritas');
  await expect(page.getByRole('button', { name: '♡ Adicionar ao exemplo' })).toBeVisible();
});
