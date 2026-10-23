# Testes Playwright — click, fill, submit, upload/download

## Como rodar
```bash
npm install
npx playwright install chromium
npm test
npm run report   # abre o relatório HTML com evidências
```

## Evidências geradas
- Screenshots nomeados anexados a cada teste (relatório HTML)
- Vídeo e trace de toda execução (`test-results/`)
- Arquivo baixado anexado no teste de download
- Saída `list` no terminal com 5 testes passando

## Estrutura
- `pages/` Page Objects reutilizáveis (um por tela)
- `utils/evidencia.ts` helper de screenshot anexado
- `tests/interacoes.spec.ts` os 5 casos de click/fill/submit/upload/download
- `tests/asserts.spec.ts` 10 testes com tipos variados de assert, comentados
- `JUSTIFICATIVAS-ASSERTS.md` tabela com a justificativa de cada assert
- `fixtures/` arquivo usado no upload

Aplicação alvo: https://the-internet.herokuapp.com (site público de práticas).
Para usar na sua aplicação, troque o `baseURL` e os seletores nos Page Objects.
