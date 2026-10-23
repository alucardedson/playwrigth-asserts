import { Page, TestInfo } from '@playwright/test';

/** Tira um screenshot e anexa ao relatório HTML como evidência nomeada. */
export async function evidenciar(page: Page, testInfo: TestInfo, nome: string) {
  const caminho = testInfo.outputPath(`${nome}.png`);
  await page.screenshot({ path: caminho, fullPage: true });
  await testInfo.attach(nome, { path: caminho, contentType: 'image/png' });
}
