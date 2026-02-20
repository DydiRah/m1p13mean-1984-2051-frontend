import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PageBreadcrumbComponent } from '../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { ConfirmDialogComponent } from '../../shared/components/common/confirm-dialog/confirm-dialog.component';
import { ItemFormModalComponent } from '../../shared/components/form/item-form-modal/item-form-modal.component';
import { ButtonComponent } from '../../shared/components/ui/button/button.component';
import { BadgeComponent } from '../../shared/components/ui/badge/badge.component';
import { ModalService } from '../../shared/services/modal.service';
import { ItemsService, Item } from '../../shared/services/items.service';
import { environment } from '../../../environments/environment';


@Component({
  selector: 'app-items',
  imports: [
    CommonModule,
    HttpClientModule,
    PageBreadcrumbComponent,
    ItemFormModalComponent,
    ConfirmDialogComponent,
    ButtonComponent,
    BadgeComponent,
  ],
  templateUrl: './items.component.html',
  styles: ``,
})
export class ItemsComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(ItemFormModalComponent) formModal!: ItemFormModalComponent;
  @ViewChild(ConfirmDialogComponent) confirmDialog!: ConfirmDialogComponent;

  private destroy$ = new Subject<void>();

  items: Item[] = [];
  isLoading = false;
  error: string | null = null;
  success: string | null = null;

  constructor(
    private itemsService: ItemsService,
    private modalService: ModalService
  ) {}

  ngOnInit() {
    this.loadItems();
  }

  loadItems() {
    this.isLoading = true;
    this.error = null;    
    this.itemsService
    .getItems()
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (items) => {
        this.items = items;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = err.message || 'Failed to load items';
        this.isLoading = false;
      },
    });
  }

  getImageUrl(item: Item): string {
    if (item.image_url) {
      return environment.apiBaseUrl.replace(/\/?api\/?/, '') + item.image_url;
    } else {
      return 'assets/placeholder.png'; // Path to your placeholder image
    }
  }

  openAddModal() {
    this.formModal.resetForm();
    this.modalService.openModal();
  }

  openEditModal(item: Item) {
    this.formModal.setFormData(item);
    this.modalService.openModal();
  }

  deleteItem(id: string | undefined) {
    if (!id) return;

    this.confirmDialog
      .open({
        title: 'Delete Item',
        message: 'Are you sure you want to delete this item? This action cannot be undone.',
        confirmText: 'Delete',
        cancelText: 'Cancel',
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe((confirmed) => {
        if (confirmed) {
          this.itemsService
            .deleteItem(id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: () => {
                this.success = 'Item deleted successfully!';
                this.loadItems();
                setTimeout(() => {
                  this.success = null;
                }, 3000);
              },
              error: (err) => {
                this.error = err.message || 'Failed to delete item';
                setTimeout(() => {
                  this.error = null;
                }, 3000);
              },
            });
        }
      });
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
