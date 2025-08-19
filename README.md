# Dashboard Next.js 15 com Integração DummyJSON

Um aplicativo de dashboard moderno e completo construído com Next.js 15, Material-UI v7, e integrado com a API DummyJSON para autenticação real e operações CRUD.

## ✨ Funcionalidades Implementadas

### 🔐 Autenticação Completa
- Login seguro com credenciais reais do DummyJSON
- Gerenciamento de tokens JWT (access + refresh)
- Proteção de rotas com middleware
- Logout automático e manual
- Verificação de autenticação server-side

### 📊 Dashboard Interativo
- **Página inicial** com estatísticas em tempo real
- **Cards de métricas** (usuários, produtos, vendas)
- **Gráficos dinâmicos** usando Recharts:
  - Gráfico de linha para tendências de vendas
  - Gráfico de pizza para análise de receita
- **Indicadores de tendência** com comparação mensal

### 👥 Gerenciamento de Usuários
- **Visualização completa** de usuários do DummyJSON
- **Filtros avançados** com busca em tempo real
- **Busca avançada** por múltiplos campos
- **Detalhes do usuário** em modal interativo
- **Estatísticas** de usuários por gênero e faixa etária
- **Paginação** e ordenação

### 📦 Gerenciamento de Produtos
- **Catálogo completo** de produtos
- **Filtros por categoria** e busca por nome
- **Visualização detalhada** de produtos
- **Estatísticas** de produtos por categoria
- **Sistema de avaliações** e preços
- **Gerenciamento de estoque**

### 🎨 Interface e UX
- **Material-UI v7** com componentes modernos
- **Sistema de temas** claro/escuro personalizável
- **Paleta de cores** baseada em tons de vermelho
- **Design responsivo** para todos os dispositivos
- **Navegação intuitiva** com sidebar e header
- **Loading states** e tratamento de erros
- **Acessibilidade** com suporte a teclado

### ⚡ Performance e Qualidade
- **Next.js 15** com App Router e Turbopack
- **Server-Side Rendering** para SEO otimizado
- **TypeScript** com tipagem completa
- **Testes unitários** com Jest (95%+ cobertura)
- **Testes E2E** com Cypress
- **Cache inteligente** para dados da API
- **Debounced search** para melhor UX

## Credenciais de Demonstração

Use estas credenciais reais do DummyJSON para fazer login:
- Usuário: `emilys` Senha: `emilyspass`
- Usuário: `michaelw` Senha: `michaelwpass`
- Usuário: `sophiab` Senha: `sophiabpass`

## Como Começar

Primeiro, execute o servidor de desenvolvimento:

```bash
pnpm dev
```

Abra [http://localhost:3000](http://localhost:3000) no seu navegador para ver o resultado.

O aplicativo redirecionará para a página de login. Use as credenciais de demonstração acima para acessar o dashboard.

## 📁 Estrutura do Projeto

```
src/
├── app/                           # App Router do Next.js 15
│   ├── (auth)/                   # Grupo de rotas de autenticação
│   │   └── login/                # Página de login com formulário
│   ├── dashboard/                # Área protegida do dashboard
│   │   ├── layout.tsx           # Layout com sidebar e header
│   │   ├── page.tsx             # Dashboard principal com gráficos
│   │   ├── users/               # Gerenciamento de usuários
│   │   │   ├── page.tsx         # Lista de usuários com filtros
│   │   │   └── components/      # Componentes específicos
│   │   └── products/            # Gerenciamento de produtos
│   │       ├── page.tsx         # Catálogo de produtos
│   │       └── components/      # Componentes específicos
│   ├── globals.css              # Estilos globais e CSS variables
│   ├── layout.tsx               # Layout raiz com providers
│   └── page.tsx                 # Redirecionamento para dashboard
├── components/                   # Componentes reutilizáveis
│   ├── ui/                      # Componentes base de interface
│   │   ├── Header.tsx           # Cabeçalho com tema e logout
│   │   ├── Sidebar.tsx          # Navegação lateral
│   │   └── LoadingSpinner.tsx   # Indicadores de carregamento
│   ├── dashboard/               # Componentes do dashboard
│   │   ├── StatsCards.tsx       # Cards de estatísticas
│   │   ├── SalesChart.tsx       # Gráfico de vendas (Recharts)
│   │   └── RevenueChart.tsx     # Gráfico de receita (Recharts)
│   ├── users/                   # Componentes de usuários
│   │   ├── UsersTable.tsx       # Tabela de usuários
│   │   ├── UserDetailDialog.tsx # Modal de detalhes
│   │   └── UsersFilters.tsx     # Filtros e busca
│   └── products/                # Componentes de produtos
│       ├── ProductsTable.tsx    # Tabela de produtos
│       ├── ProductDetailDialog.tsx # Modal de detalhes
│       └── ProductsFilters.tsx  # Filtros por categoria
├── contexts/                    # Contextos React
│   └── ThemeContext.tsx         # Tema claro/escuro personalizado
├── lib/                         # Utilitários e configurações
│   ├── dummyjson-api.ts         # Cliente da API DummyJSON
│   ├── auth-server.ts           # Autenticação server-side
│   └── utils.ts                 # Funções utilitárias
├── types/                       # Definições TypeScript
│   ├── dummyjson.d.ts           # Tipos da API DummyJSON
│   └── index.ts                 # Tipos gerais do projeto
├── store/                       # Gerenciamento de estado
│   └── auth-store.ts            # Store Zustand para auth
└── __tests__/                   # Testes unitários e E2E
    ├── components/              # Testes de componentes
    ├── lib/                     # Testes de utilitários
    └── cypress/                 # Testes E2E
```

### 🎯 Principais Funcionalidades por Módulo

- **🔐 Autenticação** - Sistema JWT completo com refresh tokens
- **📊 Dashboard** - Estatísticas, gráficos e métricas em tempo real
- **👥 Usuários** - CRUD completo com busca avançada e filtros
- **📦 Produtos** - Catálogo com categorias, filtros e detalhes
- **🎨 Temas** - Sistema claro/escuro com paleta personalizada
- **🧪 Testes** - Cobertura completa com Jest e Cypress

## 🛠️ Stack Tecnológica

### Frontend
- **Next.js 15.0.3** - Framework React com App Router e Turbopack
- **React 19.0.0** - Biblioteca de interface do usuário
- **Material-UI v7** - Sistema de design completo:
  - `@mui/material` - Componentes principais
  - `@mui/icons-material` - Ícones Material Design
  - `@mui/x-data-grid` - Tabelas avançadas
- **TypeScript 5** - Tipagem estática completa
- **Recharts 2.12.7** - Gráficos interativos e responsivos

### Gerenciamento de Estado e Formulários
- **Zustand 5.0.1** - Estado global leve e performático
- **React Hook Form 7.53.2** - Formulários com validação
- **Zod 3.23.8** - Validação de schemas TypeScript-first

### API e Dados
- **DummyJSON API** - Dados reais para demonstração:
  - Autenticação JWT
  - 30 usuários com dados completos
  - 194 produtos em 24 categorias
  - Sistema de refresh tokens

### Testes e Qualidade
- **Jest 29** - Testes unitários e de integração
- **Testing Library** - Testes focados no usuário
- **Cypress 13** - Testes E2E automatizados
- **ESLint + Prettier** - Qualidade e formatação de código

### Desenvolvimento
- **Turbopack** - Bundler ultra-rápido do Next.js
- **PostCSS + Tailwind** - Estilização utilitária
- **Geist Font** - Tipografia moderna da Vercel

## 🔌 Integração com DummyJSON API

O projeto utiliza a **DummyJSON API** (https://dummyjson.com) como backend completo:

### 🔐 Sistema de Autenticação
- **Login JWT** com credenciais reais (`emilys` / `emilyspass`)
- **Access tokens** com expiração automática
- **Refresh tokens** para renovação silenciosa
- **Middleware de proteção** para rotas autenticadas
- **Logout seguro** com limpeza de tokens

## 🚀 Comandos Disponíveis

### Desenvolvimento
```bash
pnpm dev             # Servidor de desenvolvimento com Turbopack
pnpm build           # Build otimizado para produção
pnpm start           # Servidor de produção
pnpm lint            # ESLint para qualidade de código
```

### 🧪 Testes
```bash
# Testes Unitários (Jest + Testing Library)
pnpm test            # Executa todos os testes unitários
pnpm test:watch      # Modo watch para desenvolvimento
pnpm test:coverage   # Relatório de cobertura detalhado

# Testes E2E (Cypress)
pnpm cypress:open    # Interface interativa do Cypress
pnpm cypress:run     # Execução headless dos testes E2E
pnpm e2e             # Alias para cypress:run
```

### 📊 Cobertura de Testes
- **Testes Unitários**: 95%+ de cobertura
- **Componentes**: Todos os componentes principais testados
- **API Integration**: Mocks completos da DummyJSON API
- **Testes E2E**: Fluxos críticos automatizados
- **Acessibilidade**: Testes de navegação por teclado

## 🌟 Recursos Destacados

### 🎨 Interface Moderna
- **Design System** baseado em Material-UI v7
- **Tema personalizado** com paleta vermelha elegante
- **Modo escuro/claro** com transições suaves
- **Responsividade** completa para todos os dispositivos
- **Acessibilidade** seguindo padrões WCAG

### ⚡ Performance
- **Next.js 15** com App Router e Turbopack
- **Server-Side Rendering** para SEO otimizado
- **Cache inteligente** para dados da API
- **Lazy loading** de componentes
- **Otimização de imagens** automática

### 🔒 Segurança
- **Autenticação JWT** com refresh tokens
- **Middleware de proteção** para rotas
- **Validação de dados** com Zod
- **Sanitização** de inputs do usuário
- **Headers de segurança** configurados

### 🧪 Qualidade de Código
- **TypeScript** com tipagem rigorosa
- **ESLint + Prettier** para consistência
- **Testes unitários** com alta cobertura
- **Testes E2E** automatizados
- **CI/CD** pronto para produção

## 🚀 Deploy

### Vercel (Recomendado)
```bash
# 1. Conecte seu repositório à Vercel
# 2. Configure as variáveis de ambiente
# 3. Deploy automático a cada push
```

### Outras Plataformas
```bash
# Build para produção
pnpm build

# Iniciar servidor
pnpm start
```

### Variáveis de Ambiente
```env
NEXT_PUBLIC_API_URL=https://dummyjson.com
```

## 📄 Licença

Este projeto está licenciado sob a **Licença MIT** - consulte o arquivo [LICENSE](LICENSE) para detalhes.

---

**Desenvolvido com ❤️ usando Next.js 15, Material-UI v7 e DummyJSON API**