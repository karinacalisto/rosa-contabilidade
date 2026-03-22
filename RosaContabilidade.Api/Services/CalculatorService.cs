using RosaContabilidade.Api.DTOs;

namespace RosaContabilidade.Api.Services;

public class CalculatorService
{
    public CalculatorResponse Calcular(CalculatorRequest request)
    {
        var receita = request.ReceitaMensal;
        var despesas = request.DespesasDedutiveis ?? 0;
        var baseCalculo = receita - despesas;
        if (baseCalculo < 0) baseCalculo = 0;

        decimal aliquota;
        var detalhes = new List<string>();
        var regime = request.OpcaoRegime?.ToLower() ?? "simples";

        if (request.TipoPessoa?.ToUpper() == "PF")
        {
            // Simulação simplificada IRPF
            if (request.AliquotaEstimada.HasValue && request.AliquotaEstimada > 0)
            {
                aliquota = request.AliquotaEstimada.Value;
                detalhes.Add($"Alíquota informada manualmente: {aliquota:P2}");
            }
            else
            {
                aliquota = CalcularAliquotaIRPF(baseCalculo);
                detalhes.Add($"Alíquota estimada IRPF (simplificada): {aliquota:P2}");
            }
            detalhes.Add("Simulação baseada em faixas simplificadas do IRPF.");
        }
        else // PJ
        {
            if (request.AliquotaEstimada.HasValue && request.AliquotaEstimada > 0)
            {
                aliquota = request.AliquotaEstimada.Value;
                detalhes.Add($"Alíquota informada manualmente: {aliquota:P2}");
            }
            else if (regime == "simples")
            {
                aliquota = CalcularAliquotaSimplesNacional(receita);
                detalhes.Add($"Alíquota estimada Simples Nacional: {aliquota:P2}");
                detalhes.Add("Baseado na faixa de faturamento mensal (Anexo III simplificado).");
            }
            else
            {
                aliquota = 0.15m + 0.09m + 0.0065m + 0.03m; // IRPJ + CSLL + PIS + COFINS
                detalhes.Add($"Alíquota estimada Lucro Presumido: {aliquota:P2}");
                detalhes.Add("Soma simplificada: IRPJ 15% + CSLL 9% + PIS 0,65% + COFINS 3%");
            }
        }

        var imposto = baseCalculo * aliquota;
        var percentualEfetivo = receita > 0 ? imposto / receita : 0;

        return new CalculatorResponse
        {
            ImpostoEstimadoMensal = Math.Round(imposto, 2),
            PercentualEfetivo = Math.Round(percentualEfetivo, 4),
            Regime = regime,
            TipoPessoa = request.TipoPessoa?.ToUpper() ?? "PJ",
            BaseCalculo = Math.Round(baseCalculo, 2),
            Detalhes = detalhes
        };
    }

    private static decimal CalcularAliquotaIRPF(decimal baseCalculo)
    {
        // Faixas simplificadas (valores mensais aproximados 2024)
        if (baseCalculo <= 2259.20m) return 0m;
        if (baseCalculo <= 2826.65m) return 0.075m;
        if (baseCalculo <= 3751.05m) return 0.15m;
        if (baseCalculo <= 4664.68m) return 0.225m;
        return 0.275m;
    }

    private static decimal CalcularAliquotaSimplesNacional(decimal receitaMensal)
    {
        var anual = receitaMensal * 12;
        if (anual <= 180000m) return 0.06m;
        if (anual <= 360000m) return 0.112m;
        if (anual <= 720000m) return 0.135m;
        if (anual <= 1800000m) return 0.16m;
        if (anual <= 3600000m) return 0.21m;
        return 0.33m;
    }
}
