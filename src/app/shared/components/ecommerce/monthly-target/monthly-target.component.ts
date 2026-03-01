
import { Component } from '@angular/core';
import {
  ApexNonAxisChartSeries,
  ApexChart,
  ApexPlotOptions,
  ApexFill,
  ApexStroke,
  ApexOptions,
  NgApexchartsModule,
} from 'ng-apexcharts';
import { DropdownComponent } from '../../ui/dropdown/dropdown.component';
import { DropdownItemComponent } from '../../ui/dropdown/dropdown-item/dropdown-item.component';
import { StockMovementService } from '../../../services/stockMovement.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-monthly-target',
  imports: [
    NgApexchartsModule,
    DropdownComponent,
    DropdownItemComponent
],
  templateUrl: './monthly-target.component.html',
})
export class MonthlyTargetComponent {
  public series: ApexNonAxisChartSeries = [0];
  public chart: ApexChart = {
    fontFamily: 'Outfit, sans-serif',
    type: 'radialBar',
    height: 330,
    sparkline: { enabled: true },
  };
  public plotOptions: ApexPlotOptions = {
    radialBar: {
      startAngle: -85,
      endAngle: 85,
      hollow: { size: '80%' },
      track: {
        background: '#E4E7EC',
        strokeWidth: '100%',
        margin: 5,
      },
      dataLabels: {
        name: { show: false },
        value: {
          fontSize: '36px',
          fontWeight: '600',
          offsetY: -40,
          color: '#1D2939',
          formatter: (val: number) => `${val}%`,
        },
      },
    },
  };
  public fill: ApexFill = {
    type: 'solid',
    colors: ['#465FFF'],
  };
  public stroke: ApexStroke = {
    lineCap: 'round',
  };
  public labels: string[] = ['Progress'];
  public colors: string[] = ['#465FFF'];

  isOpen = false;

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  closeDropdown() {
    this.isOpen = false;
  }

  ins: number = 0;
  outs: number = 0;

  constructor(private stockMovementService: StockMovementService, private router: Router){}

  async ngOnInit(){
    await this.loadNumber();
  }

  goToStock(){
    this.router.navigateByUrl('/stockes');
    this.closeDropdown();
  }

  async loadNumber(){
    await this.stockMovementService.getStockMovements('input').subscribe({
      next: (orders) => {
        this.ins = orders.length;
      },
      error: (err) => {
        console.error('Failed to load orders', err);
      }
    });
    await this.stockMovementService.getStockMovements('output').subscribe({
      next: (orders) => {
        this.outs = orders.length;
      },
      error: (err) => {
        console.error('Failed to load orders', err);
      }
    });
    if(this.ins === 0) this.series = [this.outs];
    else this.series = [this.outs / this.ins];
    this.closeDropdown();
  }
}
