# BelezaExpress - Marketplace de Beleza Premium

Este é o frontend do **BelezaExpress**, um marketplace completo para serviços de beleza, desenvolvido com React, TypeScript e Tailwind CSS.

## 🚀 Tecnologias Utilizadas

- **React 19**
- **TypeScript**
- **Tailwind CSS** (Estilização moderna e responsiva)
- **Lucide React** (Ícones)
- **Recharts** (Gráficos e Dashboards)
- **Gemini AI API** (Geração de descrições e insights estratégicos)
- **Vite** (Build tool)

## 📂 Estrutura do Projeto

- `/src`: Código fonte da aplicação.
  - `/components`: Componentes reutilizáveis (Layout, Stats, Feedback, etc).
  - `/pages`: Telas divididas por perfil (Admin, Empresa, Cliente).
  - `/services`: Integração com APIs externas (Gemini).
  - `/utils`: Máscaras, validações e utilitários de storage.
  - `/context`: Gerenciamento de estado global (Feedback).
- `/public`: Ativos estáticos e Service Worker para PWA.

## 🛠️ Como Rodar Localmente

1. **Instale as dependências:**
   ```bash
   npm install
   ```

2. **Configure as variáveis de ambiente:**
   Crie um arquivo `.env` na raiz do projeto baseado no `.env.example`:
   ```env
   GEMINI_API_KEY=sua_chave_aqui
   ```

3. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

## 🔗 Integração com o Backend (Fase 2)

O projeto está preparado para integração. Atualmente, os dados são gerenciados via `localStorage` através do utilitário `utils/storage.ts`.

### Sugestão de Endpoints para Implementar:

- **Auth:** `POST /api/auth/login`, `POST /api/auth/register`
- **Empresas:** `GET /api/companies`, `GET /api/companies/:id`
- **Serviços:** `GET /api/services`, `POST /api/services`
- **Agendamentos:** `GET /api/appointments`, `POST /api/appointments`, `PATCH /api/appointments/:id`

## 📱 PWA

O projeto já conta com um `manifest.json` e `sw.js` básico para suporte a Progressive Web App, permitindo a instalação em dispositivos móveis.

---
Desenvolvido com foco em UX Premium e Performance.
