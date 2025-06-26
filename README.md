# 🧠 Rys Cotação Inteligente

Sistema web inteligente para automação de cotações públicas. Desenvolvido para atender a prefeituras e órgãos públicos que precisam consultar preços em plataformas oficiais como PNCP, ComprasGov, Banco de Preços e BNC, de forma rápida, padronizada e eficiente.

---

## 🚀 Funcionalidades

- Cadastro e gestão de usuários e municípios
- Inserção manual ou via planilha de itens
- Busca automatizada de preços em plataformas públicas (via n8n)
- Visualização de resultados organizados por fornecedor, CNPJ, valor e localização
- Geração de relatórios em PDF e Excel
- Armazenamento do histórico de cotações
- Controle de permissões (admin / gestor municipal)
- Logs de acesso para auditoria

---

## 🏗️ Arquitetura

O sistema adota arquitetura **cliente-servidor**, com:

- **Front-end:** React + TypeScript + Tailwind CSS
- **Back-end:** Node.js + Drizzle ORM
- **Automações externas:** n8n (fluxos de integração com plataformas públicas)
- **Banco de dados:** PostgreSQL ou MySQL

---

## 🧰 Tecnologias Utilizadas

### Front-end:
- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vite](https://vitejs.dev/)
- [Wouter](https://github.com/molefrog/wouter)
- [React Query (TanStack)](https://tanstack.com/query)

### Back-end e Integrações:
- [Node.js](https://nodejs.org/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [n8n](https://n8n.io/)

---

## 💻 Como executar localmente

### Pré-requisitos:
- Node.js v18+
- npm ou yarn
- Banco de dados (PostgreSQL ou MySQL)
- (opcional) Docker

### Instruções:

```bash
# Clone o repositório
git clone https://github.com/jfRodrigo/RysCotacao.git
cd RysCotacao

# Instale as dependências
npm install

# Execute o front-end
npm run dev
