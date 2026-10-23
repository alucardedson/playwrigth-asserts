import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { AddRemovePage } from '../pages/AddRemovePage';
import { evidenciar } from '../utils/evidencia';

/**
 * Guia rápido dos DOIS grandes grupos de assert do Playwright:
 *
 * 1) WEB-FIRST (await expect(locator)...): ficam RE-TENTANDO até passar ou
 *    estourar o timeout. Use sempre que o valor vem da TELA, porque o DOM muda
 *    de forma assíncrona (carregamento, animações, requisições).
 *
 * 2) GENÉRICOS (expect(valor)...): comparam um valor JS que JÁ foi lido, sem
 *    retry. Use quando o dado não vem de um locator (status HTTP, arrays,
 *    números, strings já extraídas).
 *
 * Em cada assert abaixo há um comentário "ESCOLHA:" explicando o porquê.
 */

test.describe('Asserts de estado e atributos (web-first)', () => {
  test('Tela de login: visibilidade, habilitado, vazio, atributo, título e URL', async ({ page }, testInfo) => {
    const login = new LoginPage(page);
    await login.visitar();

    // ESCOLHA: toHaveURL valida a navegação inteira com retry; melhor que
    // comparar page.url() com toBe, que não espera a página terminar de navegar.
    await expect(page).toHaveURL(/\/login$/);

    // ESCOLHA: toHaveTitle verifica o <title> com retry; é a forma mais barata
    // de confirmar que carregamos a página certa (e não uma página de erro).
    await expect(page).toHaveTitle('The Internet');

    // ESCOLHA: toBeVisible garante que o usuário REALMENTE enxerga o campo.
    // Só existir no DOM (toBeAttached) não prova que está na tela.
    await expect(login.usuario).toBeVisible();

    // ESCOLHA: toBeEnabled prova que o campo aceita digitação. Se estivesse
    // desabilitado, o fill() falharia depois com uma mensagem menos clara.
    await expect(login.usuario).toBeEnabled();

    // ESCOLHA: toBeEmpty confirma o estado inicial limpo do formulário,
    // evitando que um valor residual contamine o teste.
    await expect(login.usuario).toBeEmpty();

    // ESCOLHA: toHaveAttribute('type','password') garante que a senha é
    // mascarada. É um requisito de segurança, impossível de ver só com texto.
    await expect(login.senha).toHaveAttribute('type', 'password');

    // ESCOLHA: toBeFocused valida acessibilidade/teclado: após o clique, o
    // foco precisa estar no campo (importante para quem navega sem mouse).
    await login.usuario.click();
    await expect(login.usuario).toBeFocused();

    await evidenciar(page, testInfo, 'assert-estado-login');
  });

  test('Checkboxes: toBeChecked e sua negação', async ({ page }) => {
    await page.goto('/checkboxes');
    const caixas = page.locator('#checkboxes input[type="checkbox"]');

    // ESCOLHA: toHaveCount(2) garante que o conjunto está completo ANTES de
    // acessar por índice; evita um erro confuso de "elemento não encontrado".
    await expect(caixas).toHaveCount(2);

    // ESCOLHA: not.toBeChecked para o estado inicial desmarcado. Usar a
    // negação do assert web-first mantém o retry (ao contrário de
    // expect(await isChecked()).toBe(false), que lê uma vez só).
    await expect(caixas.nth(0)).not.toBeChecked();
    await expect(caixas.nth(1)).toBeChecked();

    // ESCOLHA: check() + toBeChecked. O check() já é idempotente, e o assert
    // confirma o RESULTADO na tela, não apenas que o clique ocorreu.
    await caixas.nth(0).check();
    await expect(caixas.nth(0)).toBeChecked();
  });

  test('Dropdown: toHaveValue, toHaveCount e toContain', async ({ page }) => {
    await page.goto('/dropdown');
    const dropdown = page.locator('#dropdown');

    // ESCOLHA: toHaveCount(3) valida a quantidade de opções (placeholder +
    // 2 opções) com retry, sem precisar iterar manualmente.
    await expect(dropdown.locator('option')).toHaveCount(3);

    // ESCOLHA: toContain (assert genérico) em array já extraído. Aqui só
    // queremos saber se o texto existe na lista, sem exigir a ordem completa.
    const textos = await dropdown.locator('option').allTextContents();
    expect(textos).toContain('Option 1');

    // ESCOLHA: toHaveValue valida o VALOR selecionado (o que é enviado ao
    // servidor), mais confiável que o texto exibido, que pode ser traduzido.
    await dropdown.selectOption('1');
    await expect(dropdown).toHaveValue('1');
  });

  test('Adicionar elemento: toHaveClass e toHaveCount', async ({ page }) => {
    const tela = new AddRemovePage(page);
    await tela.visitar();
    await tela.adicionar(1);

    // ESCOLHA: toHaveClass com regex (/added-manually/) valida que a classe
    // existe sem quebrar se o framework acrescentar outras classes ao lado.
    await expect(tela.botoesRemover.first()).toHaveClass(/added-manually/);

    // ESCOLHA: toHaveText com texto exato (string) quando o rótulo é fixo e
    // qualquer variação seria um bug (diferente de toContainText, que é
    // tolerante a texto extra).
    await expect(tela.botoesRemover.first()).toHaveText('Delete');
  });
});

test.describe('Asserts de comportamento dinâmico (retry e negação)', () => {
  test('Controles dinâmicos: toBeDisabled, toBeEnabled e toHaveCount(0)', async ({ page }) => {
    await page.goto('/dynamic_controls');

    // --- Campo de texto que começa desabilitado ---
    const campo = page.locator('#input-example input');
    const mensagem = page.locator('#message');

    // ESCOLHA: toBeDisabled valida o estado inicial. Sem isso, o teste
    // passaria mesmo se o campo já nascesse habilitado (falso positivo).
    await expect(campo).toBeDisabled();

    await page.getByRole('button', { name: 'Enable' }).click();

    // ESCOLHA: toBeEnabled aguarda automaticamente o fim do "loading"
    // assíncrono. Um sleep fixo seria lento e instável; o retry resolve.
    await expect(campo).toBeEnabled();
    await expect(mensagem).toContainText('enabled!');

    // --- Checkbox que é removido do DOM ---
    const checkbox = page.locator('#checkbox-example #checkbox input');
    await page.getByRole('button', { name: 'Remove' }).click();

    // ESCOLHA: toHaveCount(0) é o assert correto para elemento REMOVIDO do
    // DOM. toBeHidden também passaria, mas toHaveCount(0) deixa claro que o
    // nó deixou de existir, que é o comportamento esperado aqui.
    await expect(checkbox).toHaveCount(0);

    // ESCOLHA: toContainText (parcial) na mensagem, pois só o trecho
    // principal importa e o apóstrofo pode variar entre ' e ’.
    await expect(mensagem).toContainText('gone');
  });

  test('Login inválido: asserts de negação (not)', async ({ page }) => {
    const login = new LoginPage(page);
    await login.visitar();
    await login.entrar('tomsmith', 'senha-errada');

    // ESCOLHA: not.toHaveURL garante que NÃO fomos para a área segura.
    // Testa o requisito de segurança "credencial errada não entra".
    await expect(page).not.toHaveURL(/\/secure/);

    // ESCOLHA: not.toContainText confirma que a mensagem de SUCESSO não
    // aparece, complementando a verificação positiva do erro.
    await expect(login.mensagem).not.toContainText('You logged into a secure area!');
    await expect(login.mensagem).toContainText('Your password is invalid!');
  });

  test('expect.poll: valor que muda com o tempo', async ({ page }) => {
    await page.goto('/dynamic_loading/2');
    await page.getByRole('button', { name: 'Start' }).click();

    // ESCOLHA: expect.poll é para quando o valor NÃO é um locator (aqui, uma
    // contagem calculada). Ele repete a função até o valor bater, unindo a
    // flexibilidade do assert genérico com o retry do web-first.
    await expect
      .poll(async () => page.locator('#finish').count(), {
        message: 'o elemento #finish deveria aparecer após o carregamento',
        timeout: 10_000,
      })
      .toBe(1);

    // ESCOLHA: toHaveText exato no resultado final do carregamento.
    await expect(page.locator('#finish h4')).toHaveText('Hello World!');
  });
});

test.describe('Asserts genéricos (valores JS)', () => {
  test('Tabela: toEqual, toHaveLength, toMatch e toBeGreaterThan', async ({ page }) => {
    await page.goto('/tables');

    // ESCOLHA: toEqual compara arrays por VALOR (conteúdo e ordem). Com toBe
    // falharia, pois toBe usa igualdade de referência (Object.is).
    const cabecalhos = await page.locator('#table1 thead th').allTextContents();
    expect(cabecalhos).toEqual(['Last Name', 'First Name', 'Email', 'Due', 'Web Site', 'Action']);

    // ESCOLHA: toHaveLength é mais legível que expect(arr.length).toBe(n) e
    // mostra o array na mensagem de erro.
    const linhas = await page.locator('#table1 tbody tr').allTextContents();
    expect(linhas).toHaveLength(4);

    // ESCOLHA: toMatch valida o FORMATO (moeda "$99.99") sem depender do
    // valor exato, que é dado de exemplo e pode mudar.
    const valores = await page.locator('#table1 tbody tr td:nth-child(4)').allTextContents();
    for (const v of valores) {
      expect(v).toMatch(/^\$\d+\.\d{2}$/);
    }

    // ESCOLHA: toBeGreaterThan para regra numérica de negócio (total > 0).
    // Compara faixa, não valor fixo, então o teste não quebra à toa.
    const total = valores.reduce((soma, v) => soma + parseFloat(v.replace('$', '')), 0);
    expect(total).toBeGreaterThan(0);
  });

  test('Status HTTP: toBe e toBeTruthy', async ({ page }) => {
    // ESCOLHA: toBe(404) para número primitivo: igualdade exata é o que
    // queremos, pois 404 e 403, por exemplo, significam coisas diferentes.
    const naoEncontrado = await page.goto('/status_codes/404');
    expect(naoEncontrado?.status(), 'a rota /status_codes/404 deve responder 404').toBe(404);

    // ESCOLHA: toBeTruthy em response.ok() (true para 200-299). Usamos aqui
    // porque a regra é "deu sucesso", sem importar se foi 200 ou 204.
    const ok = await page.goto('/status_codes/200');
    expect(ok?.ok()).toBeTruthy();
  });
});

test.describe('Soft assertions', () => {
  test('Vários campos da tela de login verificados em uma execução', async ({ page }) => {
    const login = new LoginPage(page);
    await login.visitar();

    // ESCOLHA: expect.soft NÃO interrompe o teste na primeira falha; todas as
    // divergências aparecem no relatório de uma vez. Ideal para checklists de
    // vários itens independentes (rótulos, botões, campos) em uma mesma tela.
    await expect.soft(page.locator('h2')).toHaveText('Login Page');
    await expect.soft(login.usuario).toBeVisible();
    await expect.soft(login.senha).toBeVisible();
    await expect.soft(login.botaoEntrar).toBeEnabled();

    // Em checagens que DEPENDEM de um passo anterior continuamos usando o
    // expect normal (hard), para parar logo se algo fundamental falhar.
    await expect(page).toHaveURL(/\/login/);
  });
});
