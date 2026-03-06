using System.Text;
using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.DataModel;
using Amazon.S3;
using AspNetCoreRateLimit;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using RosaContabilidade.Api.Data;
using RosaContabilidade.Api.Data.Repositories;
using RosaContabilidade.Api.Middleware;
using RosaContabilidade.Api.Models;
using RosaContabilidade.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// ===== Logging estruturado =====
builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.AddDebug();

// ===== AWS DynamoDB =====
var awsRegion = builder.Configuration["Aws:Region"] ?? "us-east-1";
var serviceUrl = builder.Configuration["Aws:DynamoDbServiceUrl"]; // for local DynamoDB

if (!string.IsNullOrEmpty(serviceUrl))
{
    // Local DynamoDB (development)
    builder.Services.AddSingleton<IAmazonDynamoDB>(sp =>
    {
        var config = new AmazonDynamoDBConfig
        {
            ServiceURL = serviceUrl
        };
        return new AmazonDynamoDBClient("fakeAccessKey", "fakeSecretKey", config);
    });
}
else
{
    // AWS credentials from environment/IAM role (production)
    builder.Services.AddDefaultAWSOptions(builder.Configuration.GetAWSOptions("Aws"));
    builder.Services.AddAWSService<IAmazonDynamoDB>();
}

builder.Services.AddSingleton<IDynamoDBContext>(sp =>
{
    var client = sp.GetRequiredService<IAmazonDynamoDB>();
    return new DynamoDBContext(client);
});

// ===== AWS S3 =====
if (!string.IsNullOrEmpty(serviceUrl))
{
    // LocalStack or local S3 mock
    builder.Services.AddSingleton<IAmazonS3>(sp =>
    {
        var s3ServiceUrl = builder.Configuration["Aws:S3ServiceUrl"] ?? serviceUrl;
        var config = new AmazonS3Config
        {
            ServiceURL = s3ServiceUrl,
            ForcePathStyle = true
        };
        return new AmazonS3Client("fakeAccessKey", "fakeSecretKey", config);
    });
}
else
{
    builder.Services.AddAWSService<IAmazonS3>();
}

// ===== DynamoDB Repositories =====
builder.Services.AddSingleton<LeadRepository>();
builder.Services.AddSingleton<PendencyRepository>();
builder.Services.AddSingleton<PaymentLinkRepository>();
builder.Services.AddSingleton<DocumentRepository>();
builder.Services.AddSingleton<S3StorageService>();

// ===== Identity with DynamoDB stores =====
builder.Services.AddSingleton<DynamoUserStore>();
builder.Services.AddSingleton<DynamoRoleStore>();

builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
{
    options.Password.RequireDigit = true;
    options.Password.RequireLowercase = true;
    options.Password.RequireUppercase = true;
    options.Password.RequireNonAlphanumeric = true;
    options.Password.RequiredLength = 6;
    options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(5);
    options.Lockout.MaxFailedAccessAttempts = 5;
    options.User.RequireUniqueEmail = true;
})
.AddUserStore<DynamoUserStore>()
.AddRoleStore<DynamoRoleStore>()
.AddDefaultTokenProviders();

// ===== JWT =====
var jwtKey = builder.Configuration["Jwt:Key"] ?? "RosaContabilidadeSuperSecretKeyQueDeveSerTrocadaEmProducao2024!";
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "RosaContabilidade";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "RosaContabilidadeClients";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization();

// ===== Services =====
builder.Services.AddSingleton<TokenService>();
builder.Services.AddSingleton<CalculatorService>();

// ===== CORS =====
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
    ?? new[] { "http://localhost:4200", "http://localhost:5000", "https://www.rosacontabilidade.com.br" };

builder.Services.AddCors(options =>
{
    options.AddPolicy("Default", policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

// ===== Rate Limiting =====
builder.Services.AddMemoryCache();
builder.Services.Configure<IpRateLimitOptions>(options =>
{
    options.GeneralRules = new List<RateLimitRule>
    {
        new()
        {
            Endpoint = "POST:/api/auth/login",
            Period = "1m",
            Limit = 10
        },
        new()
        {
            Endpoint = "POST:/api/auth/forgot-password",
            Period = "1m",
            Limit = 5
        }
    };
});
builder.Services.AddSingleton<IRateLimitConfiguration, RateLimitConfiguration>();
builder.Services.AddInMemoryRateLimiting();

// ===== Controllers + Swagger =====
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Rosa Contabilidade API",
        Version = "v1",
        Description = "API para o sistema de contabilidade médica Rosa Contabilidade"
    });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header usando Bearer scheme. Exemplo: 'Bearer {token}'",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// ===== Middleware pipeline =====
app.UseMiddleware<CorrelationIdMiddleware>();
app.UseMiddleware<ExceptionMiddleware>();

app.UseIpRateLimiting();

// Swagger
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Rosa Contabilidade API v1");
    c.RoutePrefix = "";
});

app.UseDefaultFiles();
app.UseStaticFiles();

app.UseCors("Default");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// SPA fallback
app.MapFallbackToFile("index.html");

// ===== DynamoDB Tables + Seed =====
try
{
    var dynamoClient = app.Services.GetRequiredService<IAmazonDynamoDB>();
    await DynamoDbSetup.EnsureTablesExistAsync(dynamoClient);

    // S3 bucket
    var s3Service = app.Services.GetRequiredService<S3StorageService>();
    await s3Service.EnsureBucketExistsAsync();

    if (app.Environment.IsDevelopment())
    {
        using var scope = app.Services.CreateScope();
        await SeedData.Initialize(scope.ServiceProvider);
    }
}
catch (Exception ex)
{
    Console.WriteLine($"Erro ao inicializar AWS: {ex.Message}");
    Console.WriteLine($"Stack: {ex.StackTrace}");
}

app.Run();
