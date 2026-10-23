import { Download, Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class DownloadPage extends BasePage {
  readonly links: Locator;

  constructor(page: Page) {
    super(page);
    this.links = page.locator('.example a');
  }

  async visitar() { await this.abrir('/download'); }

  /** Clica no primeiro link e devolve o download capturado. */
  async baixarPrimeiro(): Promise<Download> {
    const [download] = await Promise.all([
      this.page.waitForEvent('download'), // DOWNLOAD
      this.links.first().click(),         // CLICK
    ]);
    return download;
  }
}
