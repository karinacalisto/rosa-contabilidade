using Microsoft.AspNetCore.Identity;
using RosaContabilidade.Api.Models;
using Amazon.DynamoDBv2.DataModel;

namespace RosaContabilidade.Api.Data;

public static class SeedData
{
    public static async Task Initialize(IServiceProvider serviceProvider)
    {
        var userManager = serviceProvider.GetRequiredService<UserManager<ApplicationUser>>();
        var db = serviceProvider.GetRequiredService<IDynamoDBContext>();

        // Admin
        var adminEmail = "admin@admin.com";
        var existingAdmin = await userManager.FindByEmailAsync(adminEmail);
        if (existingAdmin == null)
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
            {
                await userManager.AddToRoleAsync(admin, "ADMIN");
                await userManager.UpdateAsync(admin);
            }
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
            {
                await userManager.AddToRoleAsync(cliente1, "CLIENTE");
                await userManager.UpdateAsync(cliente1);
            }
            cliente1 = await userManager.FindByEmailAsync(cliente1Email);
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
            {
                await userManager.AddToRoleAsync(cliente2, "CLIENTE");
                await userManager.UpdateAsync(cliente2);
            }
            cliente2 = await userManager.FindByEmailAsync(cliente2Email);
        }

        // Seed pendências
        var existingPendencies = await db.ScanAsync<Pendency>(default(List<Amazon.DynamoDBv2.DataModel.ScanCondition>), null).GetRemainingAsync();
        if (existingPendencies.Count == 0)
        {
            if (cliente1 != null)
            {
                await db.SaveAsync(new Pendency
                {
                    Descricao = "Enviar comprovantes de despesas médicas do mês 01/2026",
                    ClienteId = cliente1.Id,
                    ClienteNome = cliente1.FullName,
                    DataLimite = new DateTime(2026, 2, 15),
                    CreatedBy = "seed"
                });
                await db.SaveAsync(new Pendency
                {
                    Descricao = "Atualizar cadastro no CRM estadual",
                    ClienteId = cliente1.Id,
                    ClienteNome = cliente1.FullName,
                    DataLimite = new DateTime(2026, 3, 30),
                    CreatedBy = "seed"
                });
            }
            if (cliente2 != null)
            {
                await db.SaveAsync(new Pendency
                {
                    Descricao = "Enviar contrato social atualizado",
                    ClienteId = cliente2.Id,
                    ClienteNome = cliente2.FullName,
                    DataLimite = new DateTime(2026, 3, 15),
                    CreatedBy = "seed"
                });
            }
        }

        // Seed payment links
        var existingLinks = await db.ScanAsync<PaymentLink>(default(List<Amazon.DynamoDBv2.DataModel.ScanCondition>), null).GetRemainingAsync();
        if (existingLinks.Count == 0)
        {
            if (cliente1 != null)
            {
                await db.SaveAsync(new PaymentLink
                {
                    Descricao = "Honorários contábeis - Janeiro/2026",
                    Url = "https://pag.exemplo.com/rosa/12345",
                    Valor = 850.00m,
                    ClienteId = cliente1.Id,
                    ClienteNome = cliente1.FullName,
                    CreatedBy = "seed"
                });
            }
            if (cliente2 != null)
            {
                await db.SaveAsync(new PaymentLink
                {
                    Descricao = "Honorários contábeis - Janeiro/2026",
                    Url = "https://pag.exemplo.com/rosa/67890",
                    Valor = 1200.00m,
                    ClienteId = cliente2.Id,
                    ClienteNome = cliente2.FullName,
                    CreatedBy = "seed"
                });
            }
        }

        // Seed leads
        var existingLeads = await db.ScanAsync<Lead>(default(List<Amazon.DynamoDBv2.DataModel.ScanCondition>), null).GetRemainingAsync();
        if (existingLeads.Count == 0)
        {
            await db.SaveAsync(new Lead
            {
                Nome = "Carlos Ferreira",
                Email = "carlos@exemplo.com",
                Telefone = "(11) 99999-1234",
                Mensagem = "Gostaria de saber mais sobre os serviços para médicos.",
                Origem = "contato"
            });
            await db.SaveAsync(new Lead
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
            });
            await db.SaveAsync(new Lead
            {
                Nome = "Roberto Lima",
                Email = "roberto.lima@exemplo.com",
                Origem = "contato",
                Mensagem = "Preciso de ajuda com a declaração de IR médico."
            });
        }
    }
}
