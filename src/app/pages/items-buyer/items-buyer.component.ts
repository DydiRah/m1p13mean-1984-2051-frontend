import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { PageBreadcrumbComponent } from '../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { ConfirmDialogComponent } from '../../shared/components/common/confirm-dialog/confirm-dialog.component';
import { ItemFormModalComponent } from '../../shared/components/form/item-form-modal/item-form-modal.component';
import { ItemCardComponent } from '../../shared/components/cards/cards-items/item-card.component';

import { ModalService } from '../../shared/services/modal.service';
import { ItemsService, Item } from '../../shared/services/items.service';
import { environment } from '../../../environments/environment';
import { Order, OrderService } from '../../shared/services/order.service';

@Component({
  selector: 'app-items-buyer',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule, // ✅ important for ngModel
    PageBreadcrumbComponent,
    ItemCardComponent,
  ],
  templateUrl: 'items-buyer.component.html',
})
export class ItemsBuyerComponent implements OnInit, OnDestroy, AfterViewInit {
  showCart = false;
  upToDate = true;

  @ViewChild(ItemFormModalComponent) formModal!: ItemFormModalComponent;
  @ViewChild(ConfirmDialogComponent) confirmDialog!: ConfirmDialogComponent;

  private destroy$ = new Subject<void>();

  // Data
  items: Item[] = [];
  filteredItems: Item[] = [];

  categories: string[] = [];
  order!: Order;
  details: any[] = [];

  // UI States
  isLoading = false;
  error: string | null = null;
  success: string | null = null;

  // Filters
  searchTerm: string = '';
  selectedCategory: string = '';
  sortOption: string = '';

  // Cart
  cartCount: number = 0;

  constructor(
    private itemsService: ItemsService,
    private modalService: ModalService,
    private orderService: OrderService
  ) {}

  ngOnInit() {
    this.loadItems();
    this.loadOrder();
  }

  // ===============================
  // LOAD ITEMS and ORDER
  // ===============================

  loadItems() {
    this.isLoading = true;
    this.error = null;

    this.itemsService
      .getItems()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (items) => {
          this.items = items;
          this.extractCategories();
          this.applyFilters();
          this.isLoading = false;
        },
        error: (err) => {
          this.error = err.message || 'Failed to load products';
          this.isLoading = false;
        },
      });
  }

  loadOrder(){
    this.orderService.getOrders().pipe().subscribe({
      next: (orders) => {
        if(orders.length > 0) this.order = orders[0];
        if(orders.length > 0) this.details = orders[0].items;
      },
      error: (err) => {
          this.error = err.message || 'Failed to load products';
      }
    });
  }

  // ===============================
  // FILTER LOGIC
  // ===============================

  applyFilters() {
    let data = [...this.items];

    // Search
    if (this.searchTerm) {
      data = data.filter(item =>
        item.name.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    // Category
    if (this.selectedCategory) {
      data = data.filter(item =>
        item.category?.name === this.selectedCategory
      );
    }

    // Sorting
    // if (this.sortOption === 'priceAsc') {
    //   data.sort((a, b) => a.price - b.price);
    // }

    // if (this.sortOption === 'priceDesc') {
    //   data.sort((a, b) => b.price - a.price);
    // }

    this.filteredItems = data;
  }

  extractCategories() {
    const unique = new Set(
      this.items
        .map(i => i.category?.name)
        .filter(Boolean)
    );

    this.categories = Array.from(unique) as string[];
  }

  // ===============================
  // CART
  // ===============================

  addToCart() {
    this.cartCount++;
  }

  // ===============================
  // IMAGE
  // ===============================

  getImageUrl(item: Item): string {
    if (item.image_url) {
      return environment.apiBaseUrl.replace(/\/?api\/?/, '') + item.image_url;
    }
    return 'assets/placeholder.png';
  }

  // ===============================
  // MODAL RELOAD
  // ===============================

  ngAfterViewInit() {
    this.modalService.isOpen$
      .pipe(takeUntil(this.destroy$))
      .subscribe((isOpen) => {
        if (!isOpen) {
          setTimeout(() => {
            this.loadItems();
          }, 500);
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // MOVE CART
  toggleCart() {
    if(this.details.length <= 0) this.showCart = false;
    else this.showCart = !this.showCart;
  }



  increaseQuantity(index: number) {
    if (this.details[index].quantity < 99) { // max quantity
      this.details[index].quantity++;
      this.upToDate = false;
    }
  }

  decreaseQuantity(index: number) {
    if (this.details[index].quantity > 1) {
      this.details[index].quantity--;
      this.upToDate = false;
    }
  }


  updateCartItem() {
    this.orderService.addToCart(this.details)
      .subscribe({
        next: (data) => {  
          this.upToDate = true;
          this.loadOrder();
        },
        error: (err) => {
          console.error("Error updating store:", err);
        }
      });
  }

  payItems() {
    if (!this.upToDate){
      this.updateCartItem();
    }else{

    }
  }



}






