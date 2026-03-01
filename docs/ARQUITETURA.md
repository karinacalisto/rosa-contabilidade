# Arquitetura - Rosa Contabilidade

## Visão Geral

Sistema de contabilidade médica composto por:
- **Site institucional** (público) - Angular
- **Calculadora de impostos** (pública) - Angular + API
- **Portal do cliente** (autenticado) - Angular + API
- **Portal administrativo** (autenticado) - Angular + API
- **API REST** - ASP.NET Core 8.0
- **Banco de dados** - MySQL via EF Core

## Stack Tecnológica

### Backend
| Tecnologia | Uso |
|---|---|
| ASP.NET Core 8.0 | Framework web |
| ASP.NET Identity | Autenticação e gerenciamento de usuários |
| JWT (access + refresh) | Tokens de autenticação |
| EF Core + Pomelo MySQL | ORM e acesso a dados |
| Swashbuckle | Documentação Swagger/OpenAPI |
| AspNetCoreRateLimit | Rate limiting |

### Frontend
| Tecnologia | Uso |
|---|---|
| Angular 18 | Framework SPA |
| Angular Material | Componentes UI |
| TypeScript | Linguagem |
| SCSS | Estilos |

### Infraestrutura
| Tecnologia | Uso |
|---|---|
| IIS | Servidor web (Windows) |
| MySQL | Banco de dados |
| FTP/FTPS | Deploy |

## Estrutura de Diretórios

```
rosa-contabilidade/
├── RosaContabilidade.Api/          # Backend ASP.NET Core
│   ├── Controllers/                # Endpoints da API
│   │   ├── AuthController.cs       # Login, refresh, forgot/reset password
│   │   ├── CalculatorController.cs # Calculadora de impostos
│   │   ├── ClientsController.cs    # CRUD de clientes
│   │   ├── DocumentsController.cs  # Upload/download de documentos
│   │   ├── LeadsController.cs      # Leads (contato + calculadora)
│   │   ├── PaymentLinksController.cs # Links de pagamento
│   │   └── PendenciesController.cs # Pendências
│   ├── Data/
│   │   ├── AppDbContext.cs         # Contexto do EF Core
│   │   └── SeedData.cs            # Seed de dados para dev
│   ├── DTOs/                       # Data Transfer Objects
│   ├── Middleware/
│   │   ├── CorrelationIdMiddleware.cs # Correlation ID nos logs
│   │   └── ExceptionMiddleware.cs     # Tratamento global de erros
│   ├── Models/                     # Entidades do domínio
│   ├── Services/
│   │   ├── CalculatorService.cs    # Lógica da calculadora
│   │   └── TokenService.cs         # Geração/validação de JWT
│   ├── Program.cs                  # Entry point e configuração
│   ├── appsettings.json            # Configurações base
│   ├── appsettings.Development.json # Configurações dev
│   ├── appsettings.Production.json  # Template produção
│   ├── web.config                  # Configuração IIS
│   └── wwwroot/                    # Angular build (gerado)
├── client-app/                     # Frontend Angular
│   ├── src/app/
│   │   ├── core/
│   │   │   ├── guards/             # Auth guards (auth, admin, client)
│   │   │   ├── interceptors/       # JWT interceptor com refresh
│   │   │   └── services/           # Auth, API, Theme services
│   │   ├── layouts/
│   │   │   ├── public-layout/      # Layout público (navbar + footer)
│   │   │   └── portal-layout/      # Layout portal (toolbar + sidebar)
│   │   ├── pages/
│   │   │   ├── public/             # Páginas públicas
│   │   │   └── portal/             # Páginas autenticadas
│   │   │       ├── admin/          # Portal administrativo
│   │   │       └── client/         # Portal do cliente
│   │   └── shared/                 # Componentes compartilhados
│   └── proxy.conf.json             # Proxy para dev
├── scripts/                        # Scripts de build e deploy
├── docs/                           # Documentação
└── .env.example                    # Variáveis de ambiente exemplo
```

## Arquitetura de Deploy (IIS)

```
IIS Site (www.rosacontabilidade.com.br)
├── /                    → Angular (site institucional)
├── /login               → Angular (página de login)
├── /app/*               → Angular (portais autenticados)
├── /api/*               → ASP.NET Core (endpoints REST)
└── /api/swagger          → Swagger UI
```

O Angular é buildado e copiado para `wwwroot/` do projeto .NET.
O ASP.NET Core serve os arquivos estáticos e faz fallback para `index.html`.

## Autenticação

```
Cliente                    API
  │                         │
  ├─ POST /api/auth/login ──►│
  │                         │── Valida credenciais (Identity)
  │◄── AccessToken + ───────│── Gera JWT (TokenService)
  │    RefreshToken         │── Salva RefreshToken no user
  │                         │
  ├─ GET /api/clients ──────►│
  │  (Bearer AccessToken)   │── Valida JWT
  │◄── 200 + dados ─────────│── Retorna dados
  │                         │
  ├─ POST /api/auth/refresh ►│
  │  (RefreshToken)         │── Valida RefreshToken
  │◄── Novo AccessToken ────│── Gera novo par de tokens
```

### Perfis (Roles)
- **ADMIN**: Acesso total ao portal administrativo (CRUD de clientes, pendências, pagamentos, documentos, leads)
- **CLIENTE**: Acesso ao portal do cliente (dashboard, meus dados, pagamentos, documentos)

## Banco de Dados

### Entidades Principais
- **ApplicationUser** (herda IdentityUser): Usuário do sistema com campos adicionais
- **Lead**: Contatos do site e resultados da calculadora
- **Pendency**: Pendências/tarefas por cliente
- **PaymentLink**: Links de pagamento por cliente
- **Document**: Metadados de documentos (arquivo no filesystem)

### Auditoria
Todas as entidades possuem: `CreatedAt`, `UpdatedAt`, `CreatedBy`

## Calculadora de Impostos

Simulação educativa com suporte a:
- **PF**: Cálculo simplificado de IRPF com faixas progressivas
- **PJ Simples Nacional**: Alíquotas simplificadas do Anexo III
- **PJ Lucro Presumido**: Base presumida de 32% para serviços médicos

A calculadora é pública e permite enviar o resultado como lead para a contabilidade.
