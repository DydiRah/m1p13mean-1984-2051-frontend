
import { Component, Input, Output, EventEmitter  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Item } from '../../../services/items.service';
import { environment } from '../../../../../environments/environment.prod';
import { OrderService } from '../../../services/order.service';


@Component({
  selector: 'app-item-card',
  imports: [CommonModule],
  templateUrl: 'item-card.component.html',
  styles: ``
})
export class ItemCardComponent {
  @Input() item!: Item;
  @Output() cartUpdated = new EventEmitter<void>();

  constructor(private orderService: OrderService) {}

  get imageUrl(): string {
    return this.item?.image_url ? environment.apiBaseUrl.replace(/\/?api\/?/, '') + this.item.image_url : 'assets/placeholder.png';
  }

  showQuantityFocus = false;
  selectedQuantity = 1;

  toggleQuantityFocus() {
    this.showQuantityFocus = !this.showQuantityFocus;
    this.selectedQuantity = 1; // reset chaque fois qu'on ouvre le focus
  }

  increaseQuantity() {
    if (this.selectedQuantity < this.item.quantity) {
      this.selectedQuantity++;
    }
  }

  decreaseQuantity() {
    if (this.selectedQuantity > 1) {
      this.selectedQuantity--;
    }
  }

  addToCart() {
    const details = [
      { item: this.item._id, quantity: this.selectedQuantity }
    ]
    this.orderService.addToCart(details)
      .subscribe({
        next: (data) => { 
          this.cartUpdated.emit() 
        },
        error: (err) => {
          console.error("Error updating store:", err);
        }
      });

    this.showQuantityFocus = false; 
  }


}
