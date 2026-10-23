import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class UploadPage extends BasePage {
  readonly campoArquivo: Locator;
  readonly botaoEnviar: Locator;
  readonly titulo: Locator;
  readonly nomeEnviado: Locator;

  constructor(page: Page) {
    super(page);
    this.campoArquivo = page.locator('#file-upload');
    this.botaoEnviar = page.locator('#file-submit');
    this.titulo = page.locator('h3');
    this.nomeEnviado = page.locator('#uploaded-files');
  }

  async visitar() { await this.abrir('/upload'); }

  async enviar(caminho: string) {
    await this.campoArquivo.setInputFiles(caminho); // UPLOAD
    await this.botaoEnviar.click();                 // SUBMIT
  }
}
