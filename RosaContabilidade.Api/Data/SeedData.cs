using Microsoft.AspNetCore.Identity;
using RosaContabilidade.Api.Models;

namespace RosaContabilidade.Api.Data;

public static class SeedData
{
    public static async Task Initialize(IServiceProvider serviceProvider)
    {
        var roleManager = serviceProvider.GetRequiredService<RoleManager<IdentityRole>>();
        var userManager = serviceProvider.GetRequiredService<UserManager<ApplicationUser>>();
        var db = serviceProvider.GetRequiredService<AppDbContext>();

        // Criar roles
        string[] roles = { "ADMIN", "CLIENTE" };
        foreach (var role in roles)
        {
            if (!await roleManager.RoleExistsAsync(role))
                await roleManager.CreateAsync(new IdentityRole(role));
        }

        // Admin
        var adminEmail = "admin@admin.com";
        if (await userManager.FindByEmailAsync(adminEmail) == null)
        {
            var admin = new ApplicationUser
            {
                UserName = adminEmail,
                Email = adminEmail,
                FullName = "Administrador Rosa",
                EmailConfirmed = true
            };
            var result = await userManager.CreateAsync(admin, "TrocarNaPrimeiraSenha123!");
            if (result.Succeeded)
                await userManager.AddToRoleAsync(admin, "ADMIN");
        }

        // Cliente 1
        var cliente1Email = "maria.silva@exemplo.com";
        ApplicationUser? cliente1 = await userManager.FindByEmailAsync(cliente1Email);
        if (cliente1 == null)
        {
            cliente1 = new ApplicationUser
            {
                UserName = cliente1Email,
                Email = cliente1Email,
                FullName = "Dra. Maria Silva",
                CpfCnpj = "123.456.789-00",
                RegimeObservacoes = "Pessoa Física - Médica Cardiologista",
                EmailConfirmed = true
            };
            var result = await userManager.CreateAsync(cliente1, "Cliente123!");
            if (result.Succeeded)
                await userManager.AddToRoleAsync(cliente1, "CLIENTE");
        }

        // Cliente 2
        var cliente2Email = "joao.santos@exemplo.com";
        ApplicationUser? cliente2 = await userManager.FindByEmailAsync(cliente2Email);
        if (cliente2 == null)
        {
            cliente2 = new ApplicationUser
            {
                UserName = cliente2Email,
                Email = cliente2Email,
                FullName = "Dr. João Santos",
                CpfCnpj = "12.345.678/0001-90",
                RegimeObservacoes = "Pessoa Jurídica - Clínica Ortopédica - Simples Nacional",
                EmailConfirmed = true
            };
            var result = await userManager.CreateAsync(cliente2, "Cliente123!");
            if (result.Succeeded)
                await userManager.AddToRoleAsync(cliente2, "CLIENTE");
        }

        // Seed pendências, pagamentos, leads (somente se não existirem)
        if (!db.Pendencies.Any())
        {
            if (cliente1 != null)
            {
                db.Pendencies.AddRange(
                    new Pendency
                    {
                        Descricao = "Enviar comprovantes de despesas médicas do mês 01/2026",
                        ClienteId = cliente1.Id,
                        DataLimite = new DateTime(2026, 2, 15),
                        CreatedBy = "seed"
                    },
                    new Pendency
                    {
                        Descricao = "Atualizar cadastro no CRM estadual",
                        ClienteId = cliente1.Id,
                        DataLimite = new DateTime(2026, 3, 30),
                        CreatedBy = "seed"
                    }
                );
            }

            if (cliente2 != null)
            {
                db.Pendencies.Add(new Pendency
                {
                    Descricao = "Enviar contrato social atualizado",
                    ClienteId = cliente2.Id,
                    DataLimite = new DateTime(2026, 3, 15),
                    CreatedBy = "seed"
                });
            }
        }

        if (!db.PaymentLinks.Any())
        {
            if (cliente1 != null)
            {
                db.PaymentLinks.Add(new PaymentLink
                {
                    Descricao = "Honorários contábeis - Janeiro/2026",
                    Url = "https://pag.exemplo.com/rosa/12345",
                    Valor = 850.00m,
                    ClienteId = cliente1.Id,
                    CreatedBy = "seed"
                });
            }

            if (cliente2 != null)
            {
                db.PaymentLinks.Add(new PaymentLink
                {
                    Descricao = "Honorários contábeis - Janeiro/2026",
                    Url = "https://pag.exemplo.com/rosa/67890",
                    Valor = 1200.00m,
                    ClienteId = cliente2.Id,
                    CreatedBy = "seed"
                });
            }
        }

        if (!db.Leads.Any())
        {
            db.Leads.AddRange(
                new Lead
                {
                    Nome = "Carlos Ferreira",
                    Email = "carlos@exemplo.com",
                    Telefone = "(11) 99999-1234",
                    Mensagem = "Gostaria de saber mais sobre os serviços para médicos.",
                    Origem = "contato"
                },
                new Lead
                {
                    Nome = "Ana Paula Mendes",
                    Email = "ana.mendes@exemplo.com",
                    Telefone = "(21) 98888-5678",
                    Origem = "calculadora",
                    TipoPessoa = "PJ",
                    ReceitaMensal = 25000m,
                    DespesasDedutiveis = 5000m,
                    OpcaoRegime = "simples",
                    ImpostoEstimado = 2800m,
                    PercentualEfetivo = 0.112m
                },
                new Lead
                {
                    Nome = "Roberto Lima",
                    Email = "roberto.lima@exemplo.com",
                    Origem = "contato",
                    Mensagem = "Preciso de ajuda com a declaração de IR médico."
                }
            );
        }

        await db.SaveChangesAsync();
    }
}
