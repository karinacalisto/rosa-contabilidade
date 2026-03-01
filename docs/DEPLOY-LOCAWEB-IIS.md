# Deploy na Locaweb / IIS - Rosa Contabilidade

## Pré-requisitos

### No servidor (Locaweb Windows/IIS)
- Windows Server com IIS habilitado
- ASP.NET Core Runtime 8.0 (Hosting Bundle) instalado
- MySQL 5.7+ ou 8.0 disponível (Locaweb oferece MySQL no painel)
- Acesso FTP/FTPS ao servidor

### Na máquina de desenvolvimento
- .NET SDK 8.0+
- Node.js 18+ e npm
- Angular CLI (`npm install -g @angular/cli`)

## Passo 1: Criar banco de dados MySQL

### No painel da Locaweb:
1. Acesse **Painel de Controle** > **Banco de Dados** > **MySQL**
2. Crie um novo banco de dados (ex: `rosa_contabilidade`)
3. Crie um usuário com permissões completas nesse banco
4. Anote: host, porta, nome do banco, usuário e senha

### String de conexão:
```
Server=SEU_HOST_MYSQL;Port=3306;Database=rosa_contabilidade;User=SEU_USUARIO;Password=SUA_SENHA;
```

## Passo 2: Configurar appsettings.Production.json

Edite o arquivo `appsettings.Production.json` com os dados reais:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=SEU_HOST;Port=3306;Database=rosa_contabilidade;User=SEU_USER;Password=SUA_SENHA;"
  },
  "Jwt": {
    "Key": "GERE_UMA_CHAVE_SEGURA_COM_PELO_MENOS_32_CARACTERES_AQUI",
    "Issuer": "RosaContabilidade",
    "Audience": "RosaContabilidadeClients",
    "ExpireMinutes": 60
  },
  "Cors": {
    "AllowedOrigins": ["https://www.rosacontabilidade.com.br"]
  },
  "Uploads": {
    "Path": "C:\\inetpub\\wwwroot\\rosa-contabilidade\\App_Data\\uploads"
  }
}
```

**IMPORTANTE**: Gere uma chave JWT segura para produção! Exemplo:
```bash
openssl rand -base64 48
```

## Passo 3: Build e Publish

### Opção A: Script automático (Linux/Mac)
```bash
chmod +x scripts/publish.sh
./scripts/publish.sh
```

### Opção B: Script automático (Windows PowerShell)
```powershell
.\scripts\publish.ps1
```

### Opção C: Manual
```bash
# 1. Build Angular
cd client-app
npm ci
npx ng build --configuration=production

# 2. Copiar para wwwroot
rm -rf ../RosaContabilidade.Api/wwwroot
mkdir -p ../RosaContabilidade.Api/wwwroot
cp -r dist/client-app/browser/* ../RosaContabilidade.Api/wwwroot/

# 3. Publish .NET
cd ../RosaContabilidade.Api
dotnet publish -c Release -o ../publish
```

Os artefatos estarão na pasta `publish/`.

## Passo 4: Upload via FTP/FTPS

1. Conecte ao servidor via FTP/FTPS (dados no painel Locaweb)
2. Navegue até a pasta do site (ex: `wwwroot/rosa-contabilidade/`)
3. Envie TODO o conteúdo da pasta `publish/`
4. Certifique-se de que o `web.config` foi enviado

### Usando FileZilla:
- Host: `ftp.seudominio.com.br`
- Porta: 21 (FTP) ou 990 (FTPS)
- Protocolo: FTPS (recomendado)

## Passo 5: Configurar pasta de uploads

1. Crie a pasta de uploads no servidor:
   ```
   C:\inetpub\wwwroot\rosa-contabilidade\App_Data\uploads
   ```
2. Dê permissões de escrita para o pool de aplicação do IIS:
   - Abra o Gerenciador do IIS
   - Clique com botão direito na pasta > Propriedades > Segurança
   - Adicione `IIS AppPool\SeuPoolDeAplicacao` com permissão de Escrita

## Passo 6: Configurar IIS

### Se tiver acesso ao Gerenciador do IIS:
1. Crie um novo site ou use o existente
2. Aponte o caminho físico para a pasta onde fez upload
3. Configure o binding para o domínio `www.rosacontabilidade.com.br`
4. O `web.config` já está incluso e configurado

### web.config (já incluso no projeto):
O arquivo `web.config` configura:
- ASP.NET Core Module para hospedar a aplicação
- Variável `ASPNETCORE_ENVIRONMENT = Production`
- Limite de upload de 50MB
- Log stdout habilitado (pasta `logs/`)

## Passo 7: Primeira execução

Na primeira execução em produção, o sistema irá:
1. Aplicar todas as migrations pendentes automaticamente
2. Criar as tabelas no banco MySQL

**IMPORTANTE**: O seed de dados (admin, clientes exemplo) só roda em ambiente Development.
Para criar o admin em produção, use o endpoint de registro ou insira diretamente no banco.

### Criando admin manualmente via SQL:
Após a primeira execução (tabelas criadas), você pode usar a API para registrar o primeiro admin,
ou inserir diretamente via SQL no painel phpMyAdmin da Locaweb.

## Verificação

Após o deploy, verifique:
1. Acesse `https://www.rosacontabilidade.com.br` - deve mostrar o site institucional
2. Acesse `https://www.rosacontabilidade.com.br/api/swagger` - deve mostrar o Swagger
3. Teste o login em `https://www.rosacontabilidade.com.br/login`

## Troubleshooting

### Erro 500 / Página em branco
- Verifique os logs em `logs/stdout*`
- Verifique se o ASP.NET Core Hosting Bundle está instalado
- Verifique a connection string do MySQL

### Erro de conexão com MySQL
- Confirme host, porta, usuário e senha
- Verifique se o firewall permite conexão na porta 3306
- Teste a conexão via MySQL Workbench ou phpMyAdmin

### Upload não funciona
- Verifique permissões da pasta de uploads
- Verifique o caminho configurado em `Uploads:Path`

### Site Angular não carrega rotas
- Verifique se o `web.config` está presente
- O fallback para `index.html` é tratado pelo ASP.NET Core
