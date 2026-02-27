
import { Component, Input, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StockMovement } from '../../../services/stockMovement.service';


@Component({
  selector: 'app-item-card',
  imports: [CommonModule],
  templateUrl: 'item-card.component.html',
  styles: ``
})
export class ItemCardComponent {
  @Input() image!: string;
  @Input() name!: string;
  @Input() description!: string;
  @Input() price!: string | number;
  @Input() quantity!: number;
  @Input() category!: string;
  @Input() store!: string;
  @Input() owner!: string;
}
