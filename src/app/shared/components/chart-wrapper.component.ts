import {
  Component,
  Input,
  signal,
  computed,
  OnChanges,
  SimpleChanges,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartConfiguration, ChartType, Chart } from 'chart.js';
import { CardComponent } from './card.component';

@Component({
  selector: 'app-chart-wrapper',
  standalone: true,
  imports: [CommonModule, CardComponent],
  template: `
    <app-card [title]="title" [subtitle]="subtitle">
      <div [class]="containerClasses()" [style.height]="height">
        <canvas #chartCanvas></canvas>
      </div>
      @if (footer) {
        <div footer>
          <ng-content select="[footer]" />
        </div>
      }
    </app-card>
  `,
  styles: [],
})
export class ChartWrapperComponent
  implements OnChanges, AfterViewInit, OnDestroy
{
  @Input() title?: string;
  @Input() subtitle?: string;
  @Input() chartData!: ChartConfiguration['data'];
  @Input() chartOptions?: ChartConfiguration['options'];
  @Input() chartType: ChartType = 'line';
  @Input() height = '400px';
  @Input() showLegend = false;
  @Input() footer = false;
  @Input() responsive = true;
  @Input() maintainAspectRatio = false;

  @ViewChild('chartCanvas', { static: false }) chartCanvas!: ElementRef<HTMLCanvasElement>;

  private chart?: Chart;

  mergedOptions = computed(() => ({
    ...this.chartOptions,
    responsive: this.responsive,
    maintainAspectRatio: this.maintainAspectRatio,
    plugins: {
      ...this.chartOptions?.plugins,
      legend: {
        ...this.chartOptions?.plugins?.legend,
        display: this.showLegend,
      },
    },
  }));

  constructor() {
    // Update chart when data or options change reactively
    effect(() => {
      if (this.chart && this.chartData) {
        this.updateChartData();
        this.updateChartOptions();
      }
    });
  }

  containerClasses() {
    return `relative ${this.responsive ? 'w-full' : ''}`;
  }

  ngAfterViewInit() {
    if (this.chartCanvas && this.chartData) {
      this.createChart();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.chart) {
      if (changes['chartType']) {
        // Type change requires recreating the chart
        this.destroyChart();
        this.createChart();
      } else if (changes['chartData']) {
        this.updateChartData();
      } else if (changes['chartOptions']) {
        this.updateChartOptions();
      }
    }
  }

  ngOnDestroy() {
    this.destroyChart();
  }

  private createChart() {
    if (!this.chartCanvas || !this.chartData) {
      return;
    }

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) {
      return;
    }

    const config: ChartConfiguration = {
      type: this.chartType,
      data: this.chartData,
      options: this.mergedOptions(),
    };

    this.chart = new Chart(ctx, config);
  }

  private updateChartData() {
    if (!this.chart || !this.chartData) {
      return;
    }

    // Update chart data
    this.chart.data = this.chartData;
    this.chart.update();
  }

  private updateChartOptions() {
    if (!this.chart) {
      return;
    }

    // Update chart options
    this.chart.options = this.mergedOptions() as any;
    this.chart.update();
  }

  private destroyChart() {
    if (this.chart) {
      this.chart.destroy();
      this.chart = undefined;
    }
  }
}

