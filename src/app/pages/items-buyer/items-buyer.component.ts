import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { PageBreadcrumbComponent } from '../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { ConfirmDialogComponent } from '../../shared/components/common/confirm-dialog/confirm-dialog.component';
import { ItemFormModalComponent } from '../../shared/components/form/item-form-modal/item-form-modal.component';
import { BadgeComponent } from '../../shared/components/ui/badge/badge.component';
import { ItemCardComponent } from '../../shared/components/cards/cards-items/item-card.component';

import { ModalService } from '../../shared/services/modal.service';
import { ItemsService, Item } from '../../shared/services/items.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-items-buyer',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule, // ✅ important for ngModel
    PageBreadcrumbComponent,
    ItemFormModalComponent,
    ConfirmDialogComponent,
    ItemCardComponent,
    BadgeComponent,
  ],
  templateUrl: 'items-buyer.component.html',
})
export class ItemsBuyerComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild(ItemFormModalComponent) formModal!: ItemFormModalComponent;
  @ViewChild(ConfirmDialogComponent) confirmDialog!: ConfirmDialogComponent;

  private destroy$ = new Subject<void>();

  // Data
  items: Item[] = [];
  filteredItems: Item[] = [];

  categories: string[] = [];

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
    private modalService: ModalService
  ) {}

  ngOnInit() {
    this.loadItems();
  }

  // ===============================
  // LOAD ITEMS
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
}