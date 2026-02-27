import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ModalComponent } from '../../ui/modal/modal.component';
import { ButtonComponent } from '../../ui/button/button.component';
import { Order } from '../../../services/order.service';

@Component({
  selector: 'app-order-details-modal',
  imports: [
    CommonModule,
    ModalComponent,
    ButtonComponent,
  ],
  templateUrl: './order-details-modal.component.html',
  styles: ``
})
export class OrderDetailsModalComponent {
  order: Order = {} as Order;
  isOpen = false;

  openModal(order: Order) {
    this.order = order;
    this.isOpen = true;
  }

  closeModal() {
    this.isOpen = false;
  }

  handleSave() {
    console.log('Saving changes...');
    this.closeModal();
  }
}
