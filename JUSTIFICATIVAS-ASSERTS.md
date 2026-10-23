# Justificativa dos asserts (tests/asserts.spec.ts)

## Regra geral
- **Web-first** (`await expect(locator)`): re-tenta até passar. Usado para tudo que vem da tela.
- **Genérico** (`expect(valor)`): compara valor JS já lido, sem retry. Usado para status HTTP, arrays e números.

| Assert | Tipo | Onde | Por que foi escolhido |
|---|---|---|---|
| `toHaveURL` | web-first | login | Valida a navegação com retry; `page.url()` + `toBe` não espera a página carregar |
| `toHaveTitle` | web-first | login | Confirma rápido que é a página certa |
| `toBeVisible` | web-first | login, soft | Prova que o usuário enxerga o elemento (existir no DOM não basta) |
| `toBeEnabled` / `toBeDisabled` | web-first | login, controles dinâmicos | Valida estado de interação; espera o fim de carregamentos sem `sleep` |
| `toBeEmpty` | web-first | login | Garante estado inicial limpo do formulário |
| `toHaveAttribute` | web-first | senha | Confirma `type="password"` (mascaramento), requisito de segurança |
| `toBeFocused` | web-first | login | Acessibilidade: foco correto após clique |
| `toBeChecked` / `not.toBeChecked` | web-first | checkboxes | Valida o resultado na tela; a negação mantém o retry |
| `toHaveCount` | web-first | opções, checkboxes, remoção | Valida quantidade; `toHaveCount(0)` prova que o nó saiu do DOM |
| `toHaveValue` | web-first | dropdown | Valida o valor enviado ao servidor, não o texto exibido |
| `toHaveClass` (regex) | web-first | botão Delete | Valida a classe sem quebrar se houver outras |
| `toHaveText` (exato) | web-first | Delete, Hello World | Rótulo fixo: qualquer variação é bug |
| `toContainText` (parcial) | web-first | mensagens | Tolera texto extra e variação de apóstrofo |
| `not.toHaveURL` / `not.toContainText` | web-first | login inválido | Prova que o que NÃO deveria acontecer não aconteceu |
| `expect.poll` | híbrido | dynamic_loading | Valor calculado (não é locator) que muda com o tempo |
| `toEqual` | genérico | cabeçalhos | Compara arrays por valor; `toBe` compararia referência |
| `toHaveLength` | genérico | linhas da tabela | Mais legível que `.length` com `toBe` |
| `toMatch` | genérico | valores "Due" | Valida formato (moeda), não valor fixo |
| `toBeGreaterThan` | genérico | total da tabela | Regra numérica por faixa |
| `toContain` | genérico | opções | Existência de item sem exigir ordem |
| `toBe` | genérico | status 404 | Igualdade exata de primitivo |
| `toBeTruthy` | genérico | `response.ok()` | Regra "sucesso" sem importar qual 2xx |
| `expect.soft` | soft | checklist de login | Mostra todas as falhas de uma vez em checagens independentes |
