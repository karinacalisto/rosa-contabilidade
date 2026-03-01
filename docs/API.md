# API - Rosa Contabilidade

Base URL: `/api`

## Autenticação

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| POST | `/api/auth/login` | Público | Login com email/senha |
| POST | `/api/auth/refresh` | Público | Renovar access token |
| POST | `/api/auth/forgot-password` | Público | Solicitar token de reset |
| POST | `/api/auth/reset-password` | Público | Redefinir senha com token |
| POST | `/api/auth/change-password` | Bearer | Alterar senha (logado) |
| GET | `/api/auth/me` | Bearer | Dados do usuário atual |

### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@admin.com",
  "password": "TrocarNaPrimeiraSenha123!"
}

Response 200:
{
  "accessToken": "eyJhbG...",
  "refreshToken": "abc123...",
  "expiresAt": "2024-01-01T00:00:00Z",
  "role": "ADMIN",
  "userId": "guid...",
  "fullName": "Administrador"
}
```

## Calculadora (Pública)

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| POST | `/api/calculator` | Público | Simular impostos |

### Calcular
```
POST /api/calculator
Content-Type: application/json

{
  "tipoPessoa": "PJ",
  "receitaMensal": 30000,
  "despesasDedutiveis": 5000,
  "aliquotaEstimada": null,
  "opcaoRegime": "simples"
}
```

## Leads (Contatos)

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| POST | `/api/leads/contato` | Público | Criar lead via formulário de contato |
| POST | `/api/leads/calculadora` | Público | Criar lead via calculadora |
| GET | `/api/leads` | ADMIN | Listar todos os leads |
| GET | `/api/leads/{id}` | ADMIN | Detalhes de um lead |
| DELETE | `/api/leads/{id}` | ADMIN | Excluir lead |

### Filtros
- `GET /api/leads?origem=contato` - Filtrar por origem (contato/calculadora)

## Clientes

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/api/clients` | ADMIN | Listar todos os clientes |
| GET | `/api/clients/{id}` | ADMIN | Detalhes de um cliente |
| POST | `/api/clients` | ADMIN | Criar novo cliente |
| PUT | `/api/clients/{id}` | ADMIN/Self | Atualizar cliente |
| DELETE | `/api/clients/{id}` | ADMIN | Excluir cliente |
| GET | `/api/clients/dashboard` | CLIENTE | Dashboard do cliente logado |

## Pendências

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/api/pendencies` | ADMIN | Listar todas pendências |
| GET | `/api/pendencies/minhas` | CLIENTE | Minhas pendências |
| POST | `/api/pendencies` | ADMIN | Criar pendência |
| PUT | `/api/pendencies/{id}` | ADMIN | Atualizar pendência |
| DELETE | `/api/pendencies/{id}` | ADMIN | Excluir pendência |

### Filtros
- `GET /api/pendencies?clienteId=guid` - Filtrar por cliente

## Links de Pagamento

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/api/paymentlinks` | ADMIN | Listar todos os links |
| GET | `/api/paymentlinks/meus` | CLIENTE | Meus links de pagamento |
| POST | `/api/paymentlinks` | ADMIN | Criar link |
| PUT | `/api/paymentlinks/{id}` | ADMIN | Atualizar link |
| DELETE | `/api/paymentlinks/{id}` | ADMIN | Excluir link |

### Filtros
- `GET /api/paymentlinks?clienteId=guid` - Filtrar por cliente

## Documentos

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| POST | `/api/documents/upload` | ADMIN | Upload de documento para cliente |
| POST | `/api/documents/upload-meu` | CLIENTE | Upload do próprio documento |
| GET | `/api/documents/meus` | CLIENTE | Meus documentos |
| GET | `/api/documents/{id}/download` | Bearer | Download de documento |
| DELETE | `/api/documents/{id}` | ADMIN | Excluir documento |

### Filtros
- `GET /api/documents?clienteId=guid` - Filtrar por cliente (ADMIN)

### Upload
```
POST /api/documents/upload
Content-Type: multipart/form-data

file: (arquivo binário)
clienteId: guid-do-cliente
descricao: "Descrição do documento" (opcional)
```

## Swagger

Documentação interativa disponível em:
- **Dev**: `http://localhost:5000/api/swagger`
- **Prod**: `https://www.rosacontabilidade.com.br/api/swagger`

## Códigos de Status

| Código | Significado |
|--------|-------------|
| 200 | Sucesso |
| 201 | Criado |
| 400 | Dados inválidos (ProblemDetails) |
| 401 | Não autenticado |
| 403 | Sem permissão |
| 404 | Não encontrado |
| 429 | Rate limit excedido |
| 500 | Erro interno (ProblemDetails) |

## Headers

| Header | Descrição |
|--------|-----------|
| Authorization | `Bearer {accessToken}` |
| X-Correlation-Id | ID de correlação (gerado automaticamente) |
