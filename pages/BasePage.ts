import { Page } from '@playwright/test';

export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  protected async abrir(caminho: string) {
    await this.page.goto(caminho);
  }
}
