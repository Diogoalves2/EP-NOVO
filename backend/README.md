# Backend da Aplicação

## Requisitos

- Node.js (versão 14 ou superior)
- PostgreSQL (versão 13 ou superior)
- Docker e Docker Compose (opcional, para rodar o PostgreSQL em container)

## Configuração

1. Instale as dependências:
```bash
npm install
```

2. Configure as variáveis de ambiente copiando o arquivo `.env.example` para `.env`:
```bash
cp .env.example .env
```

3. Configure as seguintes variáveis no arquivo `.env`:
```
# Configurações do Banco de Dados
DB_USER=postgres
DB_HOST=localhost
DB_NAME=camaras_db
DB_PASSWORD=postgres
DB_PORT=5432

# Configurações do Servidor
PORT=3001
JWT_SECRET=sua-chave-secreta-aqui

# Configurações de Upload
UPLOAD_DIR=uploads
```

## Executando com Docker (Recomendado)

1. Inicie os containers do PostgreSQL e pgAdmin:
```bash
docker-compose up -d
```

2. Acesse o pgAdmin em http://localhost:5050
   - Email: admin@admin.com
   - Senha: admin

3. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

## Executando sem Docker

1. Instale e configure o PostgreSQL localmente
2. Crie um banco de dados chamado `camaras_db`
3. Execute o script SQL em `src/database/init.sql`
4. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

## Estrutura do Projeto

- `src/` - Código fonte da aplicação
  - `controllers/` - Controladores da aplicação
  - `models/` - Modelos de dados
  - `routes/` - Rotas da API
  - `database/` - Configurações e scripts do banco de dados
  - `middlewares/` - Middlewares da aplicação
  - `utils/` - Utilitários e funções auxiliares
  - `server.ts` - Arquivo principal do servidor

## API Endpoints

### Câmaras

- `GET /api/camaras` - Lista todas as câmaras
- `GET /api/camaras/:id` - Obtém uma câmara específica
- `POST /api/camaras` - Cria uma nova câmara
- `PUT /api/camaras/:id` - Atualiza uma câmara
- `DELETE /api/camaras/:id` - Remove uma câmara

### Autenticação

- `POST /api/auth/login` - Login de usuário
- `POST /api/auth/register` - Registro de novo usuário

## Segurança

- Todas as senhas são hasheadas antes de serem armazenadas
- Autenticação via JWT
- Validação de dados em todas as requisições
- Proteção contra criação duplicada de Super Admin
- Verificação de variáveis de ambiente 