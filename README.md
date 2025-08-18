# Dashboard Next.js 15 com Integração DummyJSON

Um aplicativo de dashboard moderno e completo construído com Next.js 15, Material-UI v7, e integrado com a API DummyJSON para autenticação real e operações CRUD.

## Funcionalidades

- 🔐 **Autenticação Real** - Login com credenciais de usuários do DummyJSON
- 👥 **Gerenciamento de Usuários** - Operações CRUD completas para usuários
- 📦 **Gerenciamento de Produtos** - Catálogo completo de produtos com categorias
- 📊 **Dashboard** - Estatísticas e análises em tempo real
- 🎨 **Interface Moderna** - Material-UI v7 com tema claro/escuro
- 📱 **Design Responsivo** - Funciona em todos os tamanhos de dispositivos
- ⚡ **Next.js 15** - Recursos mais recentes com Turbopack
- 🔒 **TypeScript** - Segurança de tipos completa em todo o projeto

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

## Estrutura do Projeto

- **Autenticação** - Autenticação baseada em JWT com DummyJSON
- **Gerenciamento de Usuários** - CRUD completo com busca e filtragem
- **Gerenciamento de Produtos** - Gerenciamento de catálogo com categorias
- **Dashboard** - Análises com dados reais da API
- **Sistema de Temas** - Modo claro/escuro com Material-UI

## Stack Tecnológica

- **Next.js 15** - Framework React com App Router
- **React 19** - React mais recente com novos recursos
- **Material-UI v7** - Componentes React modernos
- **TypeScript** - Desenvolvimento com segurança de tipos
- **API DummyJSON** - Integração com backend real
- **React Hook Form** - Gerenciamento de formulários
- **Zod** - Validação de esquemas
- **Jest** - Framework de testes unitários
- **Cypress** - Testes end-to-end (E2E)

## Integração com API

Este aplicativo está completamente integrado com a API [DummyJSON](https://dummyjson.com):

- **Autenticação** - Login, logout, renovação de token
- **API de Usuários** - Operações CRUD com paginação
- **API de Produtos** - Gerenciamento de produtos com categorias
- **Dados Reais** - Dados ao vivo dos endpoints DummyJSON

Consulte [DUMMYJSON_INTEGRATION.md](./DUMMYJSON_INTEGRATION.md) para documentação detalhada da integração.

## Desenvolvimento

- `pnpm dev` - Servidor de desenvolvimento com Turbopack
- `pnpm build` - Build de produção
- `pnpm start` - Iniciar servidor de produção
- `pnpm lint` - Executar ESLint
- `pnpm test` - Executar testes
- `pnpm cypress:open` - Abrir Cypress para testes E2E

## Implantar na Vercel

A maneira mais fácil de implantar seu aplicativo Next.js é usar a [Plataforma Vercel](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) dos criadores do Next.js.

Consulte nossa [documentação de implantação do Next.js](https://nextjs.org/docs/app/building-your-application/deploying) para mais detalhes.