import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ConfirmDialogComponent } from '../../shared/components/common/confirm-dialog/confirm-dialog.component';
import { ModalService } from '../../shared/services/modal.service';
import { FormsModule } from '@angular/forms';
import { Order, OrderService } from '../../shared/services/order.service';
import { PageBreadcrumbComponent } from '../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { OrderDetailsModalComponent } from '../../shared/components/details_modal/order-details-modal/order-details-modal.component';


@Component({
  selector: 'app-orders',
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    ConfirmDialogComponent,
    PageBreadcrumbComponent,
    OrderDetailsModalComponent,
  ],
  templateUrl: './orders.component.html',
  styles: ``,
})

export class OrdersComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(OrderDetailsModalComponent) detailsModal!: OrderDetailsModalComponent;
  @ViewChild(ConfirmDialogComponent) confirmDialog!: ConfirmDialogComponent;

  private destroy$ = new Subject<void>();

  orders: Order[] = [];
  selectedStockType: string = '';
  selectedItem: string = '';
  items: any[] = [];

  isLoading = false;
  error: string | null = null;
  success: string | null = null;

  constructor(
    private orderService: OrderService,
    private modalService: ModalService
  ) {}

  ngOnInit() {
    this.orderService.getOrders()
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (data) => {
        this.orders = data;
      },
      error: (err) => {
        this.error = err.message || 'Failed to load orders';
      },
    });
    this.loadOrders();
  }

  loadOrders() {
    this.isLoading = true;
    this.error = null;    
    this.orderService
    .getOrders()
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (orders) => {
        this.orders = orders;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = err.message || 'Failed to load orders';
        this.isLoading = false;
      },
    });
  }

  openDetailsModal(order: Order) {
    this.detailsModal.openModal(order);
  }

  ngAfterViewInit() {
    // Reload items when modal closes after save
    this.modalService.isOpen$
      .pipe(takeUntil(this.destroy$))
      .subscribe((isOpen) => {
        // If modal was open and is now closed, reload
        if (!isOpen) {
          // Small delay to ensure form submitted
          setTimeout(() => {
            this.loadOrders();
          }, 500);
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
