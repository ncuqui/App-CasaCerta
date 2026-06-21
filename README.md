# 🏠 CasaCerta — Simulador Comparativo de Financiamento vs. Consórcio

Projeto acadêmico desenvolvido como **Certificadora de Competência Específica** no curso de Análise e Desenvolvimento de Sistemas da **UTFPR-CP**, sob orientação do Prof. Francisco Pereira Junior.

> 📄 [Documentação no Google Docs](https://docs.google.com/document/d/15NBZdFeqs7tKUhBLr_yfHc0_uiupBTbXF8tcNEgLIV8/edit?usp=sharing)

---

## 📑 Contexto e Problema

O cliente enfrentava dificuldades na tomada de decisão ao adquirir um imóvel, pela falta de clareza e organização nas informações disponíveis:

| Problema | Impacto |
|---|---|
| ❌ Dificuldade em comparar financiamento e consórcio | Decisões baseadas em dados incompletos |
| ❌ Falta de transparência sobre custos totais e taxas | Surpresas financeiras no longo prazo |
| ❌ Simulações isoladas, sem visão consolidada | Impossibilidade de comparação objetiva |
| ❌ Processo manual e demorado | Perda de tempo e oportunidades |

## ✅ Solução Proposta

Aplicação web que permite ao usuário simular, comparar e decidir entre **financiamento imobiliário** (SAC ou PRICE) e **consórcio**, com:

- Cálculo automático de custo total, parcelas e encargos
- Comparativo lado a lado com recomendação automática
- Gráficos interativos de amortização e evolução de parcelas
- Histórico de simulações por usuário

---

## 🗂️ Estrutura do Repositório

```
App-CasaCerta/
├── casacerta-web/          # Front-end (React 19 + Vite + Tailwind)
├── casacerta-api/          # Back-end (Spring Boot 4 + Java 17)
└── prototipos/             # Mockups das telas (Tela1–5.png)
```

---

## 🛠️ Stack Tecnológica

### Front-end — `casacerta-web`

| Tecnologia | Versão | Papel |
|---|---|---|
| React | 19 | Framework de interface |
| React Router | 7 | Roteamento SPA |
| Tailwind CSS | 3 | Estilização utilitária |
| Recharts | — | Gráficos interativos |
| Vite | 8 | Build e dev server |

### Back-end — `casacerta-api`

| Tecnologia | Versão | Papel |
|---|---|---|
| Java | 17 | Linguagem principal |
| Spring Boot | 4.0.6 | Framework REST API |
| Spring Data JPA | — | ORM e acesso ao banco |
| Hibernate | — | Implementação JPA |
| H2 Database | — | Banco de dados local (arquivo) |
| Gradle | 9.4 | Gerenciamento de build |
| Lombok | — | Redução de boilerplate |

---

## 🏗️ Arquitetura da Solução

```
┌─────────────────────────────────────────┐
│           Usuário (Navegador)           │
└──────────────────┬──────────────────────┘
                   │ HTTP
┌──────────────────▼──────────────────────┐
│     casacerta-web  (React 19 + Vite)    │
│                                         │
│  React Router → Pages → Context API     │
│  Recharts · Tailwind CSS                │
└──────────────────┬──────────────────────┘
                   │ REST JSON
                   │ localhost:8080/api
┌──────────────────▼──────────────────────┐
│   casacerta-api  (Spring Boot / Java)   │
│                                         │
│  Controllers → Services → Repositories │
│  DTOs · Entities · Enums               │
└──────────────────┬──────────────────────┘
                   │ JPA / Hibernate
┌──────────────────▼──────────────────────┐
│     H2 (arquivo local) · casacerta      │
│                                         │
│  users · simulations                   │
│  financing_simulations                  │
│  consortium_simulations                 │
└─────────────────────────────────────────┘
```

---

## 🗄️ Banco de Dados

### Diagrama de Entidades

```
users
├── id (PK)
├── name
├── email (unique)
├── monthly_income
└── down_payment

simulations
├── id (PK)
├── user_id (FK → users)
├── property_value
├── down_payment
├── recommendation (FINANCING | CONSORTIUM)
└── created_at

financing_simulations
├── id (PK)
├── simulation_id (FK → simulations)
├── term_months
├── annual_interest_rate
├── amortization_type (SAC | PRICE)
├── installment_value
├── total_interest
└── total_cost

consortium_simulations
├── id (PK)
├── simulation_id (FK → simulations)
├── term_months
├── annual_admin_fee
├── reserve_fund
├── bid_percentage
├── monthly_contribution
├── total_admin_fee
└── total_cost
```

---

## 🔌 API REST

Base URL: `http://localhost:8080/api`

### Usuários

| Método | Endpoint | Descrição |
|---|---|---|
| `POST` | `/users` | Cadastrar novo usuário |
| `GET` | `/users/email?email=` | Buscar usuário por e-mail |

### Simulações

| Método | Endpoint | Descrição |
|---|---|---|
| `POST` | `/simulations` | Executar nova simulação |
| `GET` | `/simulations/{id}` | Buscar simulação por ID |
| `GET` | `/simulations?userId=` | Listar simulações do usuário |
| `DELETE` | `/simulations/{id}` | Excluir simulação |

### Exemplo de payload — Simulação completa

```json
{
  "userId": 1,
  "propertyValue": 420000,
  "downPayment": 84000,
  "financing": {
    "termMonths": 360,
    "annualInterestRate": 10.5,
    "amortizationType": "SAC"
  },
  "consortium": {
    "termMonths": 180,
    "annualAdminFee": 1.8,
    "reserveFund": 2.0,
    "bidPercentage": 15.0
  }
}
```

---

## 🖥️ Funcionalidades Implementadas

### Autenticação e Cadastro
- Login por e-mail e senha com autenticação JWT
- Sessão salva em `sessionStorage`
- Cadastro com nome, e-mail, senha, renda mensal e valor disponível para entrada

### Simulação de Financiamento
- Campos: valor do imóvel, entrada, prazo (meses ou anos), taxa anual, tipo de amortização
- Exibe taxa mensal equivalente em tempo real
- Descrição contextual do tipo de amortização (SAC / PRICE)
- **Gráfico SAC × PRICE**: evolução das parcelas ao longo do prazo, atualizado em tempo real

### Simulação de Consórcio
- Campos: carta de crédito, prazo (meses ou anos), taxa adm., fundo de reserva
- **Lance variável**: slider de 0 a 50% com exibição do valor equivalente em R$
- **Lance fixo**: campo monetário com cálculo automático do percentual equivalente

### Resultados
- **Hero de métricas**: custo total, parcela mensal e prazo em destaque no topo
- Comparação: card verde (recomendado) · card central com economia · card laranja (maior custo)
- **Breakdown visual** da composição da parcela/contribuição (barra de progresso)
  - Financiamento SAC: amortização × juros (1ª e última parcela)
  - Financiamento PRICE: composição média
  - Consórcio: carta de crédito × taxa adm. × fundo de reserva
- **Gráfico de composição do custo total**: BarChart empilhado comparando encargos
- **Gráfico de evolução das parcelas**: LineChart mês a mês (financiamento × consórcio)

### Histórico
- Listagem de todas as simulações do usuário
- Exclusão individual com confirmação
- Informações resumidas: valor do imóvel, recomendação, data, custos totais

---

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+
- Java 17+
- Nenhum banco de dados externo necessário (H2 embutido)

### Back-end

```bash
cd casacerta-api
./gradlew bootRun
# API disponível em http://localhost:8080
# Console H2 disponível em http://localhost:8080/h2-console
# (JDBC URL: jdbc:h2:file:./data/casacerta)
```

### Front-end

```bash
cd casacerta-web
npm install
npm run dev
# App disponível em http://localhost:5173
```

---

## 📅 Histórico de Desenvolvimento

| Data | Versão | Descrição |
|---|---|---|
| 29/03/2026 | — | Criação do repositório, README, protótipos das 5 telas |
| 05/04/2026 | — | Atualização de links e documentação |
| 16/05/2026 | Back-end v1.0 | API REST completa com todos os endpoints e motor de simulação |
| 17/05/2026 | Front-end v1.0 | Aplicação React completa + melhorias UX (prazo aberto, taxa mensal, lance fixo/variável) |
| 30/05/2026 | v1.1 | Resultados enriquecidos: hero de métricas, breakdown de taxas nas parcelas |
| 30/05/2026 | v1.2 | Gráficos interativos com Recharts (SAC×PRICE, composição de custo, evolução de parcelas) |
| 31/05/2026 | v1.3 | Diagramas de entidades (DER) e diagrama de classes adicionados à documentação |
| 19/06/2026 | v1.4 | Autenticação segura com senha, tokens JWT e histórico de simulações por usuário |
| 20/06/2026 | v1.5 | Gráficos, dados gerais do usuário e breakdown de taxas (requisitos parciais) |
| 20/06/2026 | v1.6 | Organização do repositório: .gitignore e remoção de arquivos de build |
| 21/06/2026 | v1.7 | Banco H2 local (arquivo), CORS corrigido, handler global de erros, validações, melhorias de qualidade no front e back |

---

## 👥 Equipe

**Orientador:** Prof. Francisco Pereira Junior — UTFPR-CP

| Integrante | GitHub | Contribuições principais |
|---|---|---|
| Natália Cuqui Barbosa | [@ncuqui](https://github.com/ncuqui) | Repositório, documentação, protótipos, README |
| Débora Batista Pereira de Almeida | [@deborabat](https://github.com/deborabat) | — |
| Davi Leme de Castro Nascimento Batista | [@devdvi](https://github.com/devdvi) | Back-end completo, front-end React, gráficos, melhorias UX |

---

## 📄 Licença

Projeto acadêmico — UTFPR-CP · Análise e Desenvolvimento de Sistemas · 2026
