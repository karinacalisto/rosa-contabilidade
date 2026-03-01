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
    { pergunta: 'Quais serviços a Rosa Contabilidade oferece?', resposta: '[PLACEHOLDER: Lista de serviços oferecidos pela empresa]' },
    { pergunta: 'Vocês atendem apenas médicos?', resposta: '[PLACEHOLDER: Explicar que atende profissionais de saúde em geral, com especialidade em médicos]' },
    { pergunta: 'Qual a vantagem de abrir uma PJ médica?', resposta: '[PLACEHOLDER: Explicar economia tributária e benefícios de PJ para médicos]' },
    { pergunta: 'Como funciona o portal do cliente?', resposta: '[PLACEHOLDER: Explicar funcionalidades do portal - documentos, pagamentos, pendências]' },
    { pergunta: 'Quais documentos preciso enviar mensalmente?', resposta: '[PLACEHOLDER: Lista de documentos necessários para a contabilidade mensal]' },
    { pergunta: 'Como é feito o planejamento tributário?', resposta: '[PLACEHOLDER: Explicar o processo de análise e planejamento tributário]' },
    { pergunta: 'Qual o valor dos honorários?', resposta: '[PLACEHOLDER: Explicar que os valores variam conforme o porte e necessidades, e convidar para contato]' },
    { pergunta: 'A calculadora de impostos do site é precisa?', resposta: 'A calculadora é uma ferramenta educativa para simulação. Os valores são estimativas baseadas em faixas simplificadas e não substituem a análise detalhada de um contador profissional.' },
  ];
}
