# Deploy na AWS - Rosa Contabilidade API

## Visão Geral da Arquitetura AWS

```
Frontend (Locaweb)              Backend (AWS)
┌──────────────────┐           ┌──────────────────────────────┐
│  Angular SPA     │  HTTPS    │  Elastic Beanstalk (t2.micro)│
│  rosacontabili-  │ ────────> │  ASP.NET Core 8.0 API        │
│  dade.com.br     │           │                              │
└──────────────────┘           │  ┌────────────┐ ┌─────────┐ │
                               │  │ DynamoDB   │ │   S3    │ │
                               │  │ (5 tabelas)│ │ (docs)  │ │
                               │  └────────────┘ └─────────┘ │
                               └──────────────────────────────┘
```

## Pré-requisitos

1. **Conta AWS** com Free Tier ativo
2. **AWS CLI** instalado e configurado (`aws configure`)
3. **.NET 8 SDK** instalado localmente
4. **IAM User** com permissões para DynamoDB, S3 e Elastic Beanstalk

## 1. Configuração do IAM

### Criar usuário IAM para a aplicação

```bash
aws iam create-user --user-name rosa-contabilidade-api

aws iam create-policy --policy-name RosaContabilidadePolicy --policy-document '{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:CreateTable",
        "dynamodb:DescribeTable",
        "dynamodb:ListTables",
        "dynamodb:PutItem",
        "dynamodb:GetItem",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem",
        "dynamodb:Query",
        "dynamodb:Scan",
        "dynamodb:BatchWriteItem",
        "dynamodb:BatchGetItem"
      ],
      "Resource": "arn:aws:dynamodb:*:*:table/Rosa*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:ListTables"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:CreateBucket",
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::rosa-contabilidade-docs",
        "arn:aws:s3:::rosa-contabilidade-docs/*"
      ]
    }
  ]
}'
```

## 2. Criar Tabelas DynamoDB

As tabelas são criadas automaticamente na inicialização da aplicação. Porém, caso queira criá-las manualmente:

```bash
# Tabela de Usuários
aws dynamodb create-table \
  --table-name RosaUsers \
  --attribute-definitions \
    AttributeName=Id,AttributeType=S \
    AttributeName=NormalizedEmail,AttributeType=S \
  --key-schema AttributeName=Id,KeyType=HASH \
  --global-secondary-indexes '[{
    "IndexName": "Email-index",
    "KeySchema": [{"AttributeName": "NormalizedEmail", "KeyType": "HASH"}],
    "Projection": {"ProjectionType": "ALL"},
    "ProvisionedThroughput": {"ReadCapacityUnits": 5, "WriteCapacityUnits": 5}
  }]' \
  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5

# Tabela de Leads
aws dynamodb create-table \
  --table-name RosaLeads \
  --attribute-definitions \
    AttributeName=Id,AttributeType=S \
    AttributeName=Origem,AttributeType=S \
  --key-schema AttributeName=Id,KeyType=HASH \
  --global-secondary-indexes '[{
    "IndexName": "Origem-index",
    "KeySchema": [{"AttributeName": "Origem", "KeyType": "HASH"}],
    "Projection": {"ProjectionType": "ALL"},
    "ProvisionedThroughput": {"ReadCapacityUnits": 5, "WriteCapacityUnits": 5}
  }]' \
  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5

# Tabelas com índice por ClienteId (Pendencies, PaymentLinks, Documents)
for TABLE in RosaPendencies RosaPaymentLinks RosaDocuments; do
  aws dynamodb create-table \
    --table-name $TABLE \
    --attribute-definitions \
      AttributeName=Id,AttributeType=S \
      AttributeName=ClienteId,AttributeType=S \
    --key-schema AttributeName=Id,KeyType=HASH \
    --global-secondary-indexes "[{
      \"IndexName\": \"ClienteId-index\",
      \"KeySchema\": [{\"AttributeName\": \"ClienteId\", \"KeyType\": \"HASH\"}],
      \"Projection\": {\"ProjectionType\": \"ALL\"},
      \"ProvisionedThroughput\": {\"ReadCapacityUnits\": 5, \"WriteCapacityUnits\": 5}
    }]" \
    --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5
done
```

## 3. Criar Bucket S3

```bash
aws s3 mb s3://rosa-contabilidade-docs --region us-east-1

# Bloquear acesso público (documentos são privados)
aws s3api put-public-access-block \
  --bucket rosa-contabilidade-docs \
  --public-access-block-configuration \
  "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"
```

## 4. Deploy com Elastic Beanstalk

### Instalar EB CLI
```bash
pip install awsebcli
```

### Publicar a aplicação
```bash
cd RosaContabilidade.Api
dotnet publish -c Release -o ./publish
```

### Inicializar Elastic Beanstalk
```bash
cd publish
eb init rosa-contabilidade-api \
  --platform "64bit Amazon Linux 2023 v3.0.0 running .NET 8" \
  --region us-east-1
```

### Criar ambiente (Free Tier: t2.micro)
```bash
eb create rosa-contabilidade-prod \
  --instance_type t2.micro \
  --single \
  --envvars \
    "ASPNETCORE_ENVIRONMENT=Production,\
    Aws__Region=us-east-1,\
    Aws__S3BucketName=rosa-contabilidade-docs,\
    Jwt__Key=SUA_CHAVE_JWT_SEGURA_AQUI,\
    Cors__AllowedOrigins__0=https://www.rosacontabilidade.com.br"
```

### Deploy subsequente
```bash
dotnet publish -c Release -o ./publish
cd publish
eb deploy
```

## 5. Variáveis de Ambiente (Elastic Beanstalk)

Configure no console AWS ou via CLI:

| Variável | Valor | Descrição |
|----------|-------|-----------|
| `ASPNETCORE_ENVIRONMENT` | `Production` | Ambiente ASP.NET |
| `Aws__Region` | `us-east-1` | Região AWS |
| `Aws__S3BucketName` | `rosa-contabilidade-docs` | Bucket S3 |
| `Jwt__Key` | `(chave segura)` | Chave JWT |
| `Jwt__Issuer` | `RosaContabilidade` | Emissor JWT |
| `Jwt__Audience` | `RosaContabilidadeClients` | Audiência JWT |
| `Cors__AllowedOrigins__0` | `https://www.rosacontabilidade.com.br` | CORS |

## 6. Configurar HTTPS

1. No console AWS, vá em **Elastic Beanstalk > Configuração > Load Balancer**
2. Adicione listener HTTPS na porta 443
3. Selecione certificado SSL do ACM (Certificate Manager)
4. Ou use o Cloudflare como proxy DNS para SSL gratuito

## 7. Free Tier - Limites

| Serviço | Limite Free Tier | Uso Estimado |
|---------|-----------------|--------------|
| DynamoDB | 25 GB + 25 WCU/RCU | Bem abaixo |
| S3 | 5 GB + 20.000 GET | Adequado |
| EC2 t2.micro | 750 hrs/mês | 1 instância |
| Data Transfer | 100 GB/mês | Adequado |

## 8. Desenvolvimento Local

### Usando DynamoDB Local
```bash
# Baixar DynamoDB Local
wget https://d1ni2b6xgvw0s0.cloudfront.net/v2.x/dynamodb_local_latest.tar.gz
tar xzf dynamodb_local_latest.tar.gz
java -jar DynamoDBLocal.jar -sharedDb

# Configurar appsettings.Development.json já aponta para localhost:8000
```

### Usando LocalStack para S3
```bash
pip install localstack
localstack start
# S3 disponível em http://localhost:4566
```

### Rodando a API em modo dev
```bash
cd RosaContabilidade.Api
ASPNETCORE_ENVIRONMENT=Development dotnet run
```

As tabelas e seed data são criados automaticamente na inicialização.

## 9. Monitoramento

```bash
# Logs da aplicação
eb logs

# Status do ambiente
eb status

# Health check
eb health
```

## 10. Atualizar frontend na Locaweb

O frontend Angular já está hospedado na Locaweb. Para atualizar a URL da API:

1. No arquivo `environment.prod.ts` do Angular, atualize `apiUrl` para a URL do Elastic Beanstalk
2. Rebuild: `ng build --configuration production`
3. Faça upload via FTP para a Locaweb

```typescript
// environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://SEU-EB-URL.elasticbeanstalk.com/api'
};
```
