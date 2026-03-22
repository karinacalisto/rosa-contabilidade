import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule, MatExpansionModule],
  template: `
    <div class="page-container">
      <section class="page-header">
        <h1>Perguntas Frequentes</h1>
        <p>Tire suas dúvidas sobre nossos serviços</p>
      </section>

      <mat-accordion>
        @for (faq of faqs; track faq.pergunta) {
          <mat-expansion-panel>
            <mat-expansion-panel-header>
              <mat-panel-title>{{ faq.pergunta }}</mat-panel-title>
            </mat-expansion-panel-header>
            <p>{{ faq.resposta }}</p>
          </mat-expansion-panel>
        }
      </mat-accordion>
    </div>
  `,
  styles: [`
    .page-container { max-width: 800px; margin: 0 auto; padding: 40px 20px; }
    .page-header { text-align: center; margin-bottom: 40px; }
    .page-header h1 { font-size: 2rem; margin-bottom: 12px; }
    mat-expansion-panel { margin-bottom: 8px; }
  `]
})
export class FaqComponent {
  faqs = [
    { pergunta: 'Quais serviços a Rosa Contabilidade oferece?', resposta: 'Oferecemos contabilidade geral, declaração de Imposto de Renda PF, abertura e regularização de empresas, planejamento tributário, entrega de obrigações acessórias (DMED, DIRF, SPED) e consultoria fiscal especializada para profissionais da saúde.' },
    { pergunta: 'Vocês atendem apenas médicos?', resposta: 'Não! Atendemos empresas e profissionais de diversos segmentos. Porém, temos uma especialização em profissionais da saúde — médicos, dentistas, fisioterapeutas, psicólogos e outros — pois entendemos as particularidades tributárias desse setor.' },
    { pergunta: 'Qual a vantagem de abrir uma PJ médica?', resposta: 'A principal vantagem é a economia tributária. Enquanto a alíquota de IRPF pode chegar a 27,5%, uma PJ no Simples Nacional pode pagar a partir de 6% de impostos. Além disso, você pode deduzir despesas operacionais e ter maior proteção patrimonial.' },
    { pergunta: 'Como funciona o portal do cliente?', resposta: 'Nosso portal online permite que você envie e receba documentos, acompanhe pendências contábeis, visualize links de pagamento e tenha acesso a um painel com a situação atualizada da sua empresa — tudo de forma segura e prática.' },
    { pergunta: 'Quais documentos preciso enviar mensalmente?', resposta: 'Geralmente são necessários: extratos bancários, notas fiscais emitidas e recebidas, comprovantes de despesas, folha de pagamento (se houver funcionários) e recibos de pagamento de impostos. Pelo portal, o envio é rápido e organizado.' },
    { pergunta: 'Como é feito o planejamento tributário?', resposta: 'Analisamos seu faturamento, despesas e estrutura societária para simular cenários nos diferentes regimes tributários (Simples Nacional, Lucro Presumido e Lucro Real). Com base nisso, recomendamos a opção mais econômica e segura para o seu perfil.' },
    { pergunta: 'Qual o valor dos honorários?', resposta: 'Os honorários variam conforme o porte da empresa, volume de movimentações e serviços contratados. Entre em contato pelo telefone (11) 99162-3225 ou pelo formulário de contato para receber uma proposta personalizada.' },
    { pergunta: 'A calculadora de impostos do site é precisa?', resposta: 'A calculadora é uma ferramenta educativa para simulação. Os valores são estimativas baseadas em faixas simplificadas e não substituem a análise detalhada de um contador profissional.' },
  ];
}
