using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using RosaContabilidade.Api.Models;

namespace RosaContabilidade.Api.Data;

public class AppDbContext : IdentityDbContext<ApplicationUser>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Lead> Leads => Set<Lead>();
    public DbSet<Pendency> Pendencies => Set<Pendency>();
    public DbSet<PaymentLink> PaymentLinks => Set<PaymentLink>();
    public DbSet<Document> Documents => Set<Document>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<ApplicationUser>(e =>
        {
            e.Property(u => u.FullName).HasMaxLength(200).IsRequired();
            e.Property(u => u.CpfCnpj).HasMaxLength(20);
            e.Property(u => u.RegimeObservacoes).HasMaxLength(500);
            e.Property(u => u.RefreshToken).HasMaxLength(500);
        });

        builder.Entity<Lead>(e =>
        {
            e.Property(l => l.Nome).HasMaxLength(200).IsRequired();
            e.Property(l => l.Email).HasMaxLength(200).IsRequired();
            e.Property(l => l.Telefone).HasMaxLength(30);
            e.Property(l => l.Mensagem).HasMaxLength(2000);
            e.Property(l => l.Origem).HasMaxLength(50);
            e.Property(l => l.TipoPessoa).HasMaxLength(10);
            e.Property(l => l.OpcaoRegime).HasMaxLength(20);
            e.Property(l => l.ReceitaMensal).HasColumnType("decimal(18,2)");
            e.Property(l => l.DespesasDedutiveis).HasColumnType("decimal(18,2)");
            e.Property(l => l.AliquotaEstimada).HasColumnType("decimal(18,4)");
            e.Property(l => l.ImpostoEstimado).HasColumnType("decimal(18,2)");
            e.Property(l => l.PercentualEfetivo).HasColumnType("decimal(18,4)");
        });

        builder.Entity<Pendency>(e =>
        {
            e.Property(p => p.Descricao).HasMaxLength(500).IsRequired();
            e.HasOne(p => p.Cliente).WithMany(c => c.Pendencies).HasForeignKey(p => p.ClienteId).OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<PaymentLink>(e =>
        {
            e.Property(p => p.Descricao).HasMaxLength(300).IsRequired();
            e.Property(p => p.Url).HasMaxLength(1000).IsRequired();
            e.Property(p => p.Valor).HasColumnType("decimal(18,2)");
            e.HasOne(p => p.Cliente).WithMany(c => c.PaymentLinks).HasForeignKey(p => p.ClienteId).OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<Document>(e =>
        {
            e.Property(d => d.NomeOriginal).HasMaxLength(300).IsRequired();
            e.Property(d => d.NomeArquivo).HasMaxLength(300).IsRequired();
            e.Property(d => d.CaminhoRelativo).HasMaxLength(500).IsRequired();
            e.Property(d => d.TipoMime).HasMaxLength(100);
            e.Property(d => d.Descricao).HasMaxLength(500);
            e.HasOne(d => d.Cliente).WithMany(c => c.Documents).HasForeignKey(d => d.ClienteId).OnDelete(DeleteBehavior.Cascade);
        });
    }
}
