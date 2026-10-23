import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  readonly usuario: Locator;
  readonly senha: Locator;
  readonly botaoEntrar: Locator;
  readonly mensagem: Locator;

  constructor(page: Page) {
    super(page);
    this.usuario = page.locator('#username');
    this.senha = page.locator('#password');
    this.botaoEntrar = page.getByRole('button', { name: /login/i });
    this.mensagem = page.locator('#flash');
  }

  async visitar() { await this.abrir('/login'); }

  async entrar(usuario: string, senha: string) {
    await this.usuario.fill(usuario);   // FILL
    await this.senha.fill(senha);       // FILL
    await this.botaoEntrar.click();     // SUBMIT
  }
}
