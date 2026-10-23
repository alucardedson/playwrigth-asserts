import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { AddRemovePage } from '../pages/AddRemovePage';
import { LoginPage } from '../pages/LoginPage';
import { UploadPage } from '../pages/UploadPage';
import { DownloadPage } from '../pages/DownloadPage';
import { evidenciar } from '../utils/evidencia';

test.describe('Interações básicas', () => {
  test('CLICK: adicionar e remover elementos', async ({ page }, testInfo) => {
    const tela = new AddRemovePage(page);
    await tela.visitar();

    await tela.adicionar(3);
    await expect(tela.botoesRemover).toHaveCount(3);
    await evidenciar(page, testInfo, '01-tres-elementos-adicionados');

    await tela.removerPrimeiro();
    await expect(tela.botoesRemover).toHaveCount(2);
    await evidenciar(page, testInfo, '02-um-elemento-removido');
  });

  test('FILL + SUBMIT: login com credenciais válidas', async ({ page }, testInfo) => {
    const login = new LoginPage(page);
    await login.visitar();
    await login.entrar('tomsmith', 'SuperSecretPassword!');

    await expect(page).toHaveURL(/\/secure/);
    await expect(login.mensagem).toContainText('You logged into a secure area!');
    await evidenciar(page, testInfo, 'login-sucesso');
  });

  test('FILL + SUBMIT: login com senha inválida exibe erro', async ({ page }, testInfo) => {
    const login = new LoginPage(page);
    await login.visitar();
    await login.entrar('tomsmith', 'senha-errada');

    await expect(page).toHaveURL(/\/login/);
    await expect(login.mensagem).toContainText('Your password is invalid!');
    await evidenciar(page, testInfo, 'login-erro-esperado');
  });

  test('UPLOAD: enviar arquivo e validar nome na tela', async ({ page }, testInfo) => {
    const upload = new UploadPage(page);
    const arquivo = path.resolve(__dirname, '../fixtures/arquivo-teste.txt');

    await upload.visitar();
    await upload.enviar(arquivo);

    await expect(upload.titulo).toHaveText('File Uploaded!');
    await expect(upload.nomeEnviado).toHaveText('arquivo-teste.txt');
    await evidenciar(page, testInfo, 'upload-sucesso');
  });

  test('DOWNLOAD: baixar arquivo e validar que foi salvo', async ({ page }, testInfo) => {
    const tela = new DownloadPage(page);
    await tela.visitar();

    const download = await tela.baixarPrimeiro();
    const destino = testInfo.outputPath(download.suggestedFilename());
    await download.saveAs(destino);

    expect(download.suggestedFilename()).not.toBe('');
    expect(fs.existsSync(destino)).toBeTruthy();
    expect(fs.statSync(destino).size).toBeGreaterThan(0);

    await testInfo.attach('arquivo-baixado', { path: destino });
    await evidenciar(page, testInfo, 'download-sucesso');
  });
});
