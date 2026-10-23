import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class AddRemovePage extends BasePage {
  readonly botaoAdicionar: Locator;
  readonly botoesRemover: Locator;

  constructor(page: Page) {
    super(page);
    this.botaoAdicionar = page.getByRole('button', { name: 'Add Element' });
    this.botoesRemover = page.locator('.added-manually');
  }

  async visitar() { await this.abrir('/add_remove_elements/'); }
  async adicionar(qtd = 1) {
    for (let i = 0; i < qtd; i++) await this.botaoAdicionar.click(); // CLICK
  }
  async removerPrimeiro() { await this.botoesRemover.first().click(); } // CLICK
}
