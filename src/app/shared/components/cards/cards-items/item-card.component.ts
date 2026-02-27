
import { Component, Input, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Item } from '../../../services/items.service';
import { environment } from '../../../../../environments/environment.prod';


@Component({
  selector: 'app-item-card',
  imports: [CommonModule],
  templateUrl: 'item-card.component.html',
  styles: ``
})
export class ItemCardComponent {
  @Input() item!: Item;

  get imageUrl(): string {
    return this.item?.image_url ? environment.apiBaseUrl.replace(/\/?api\/?/, '') + this.item.image_url : 'assets/placeholder.png';
  }
}
