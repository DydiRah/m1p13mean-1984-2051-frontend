import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { PageBreadcrumbComponent } from '../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { ConfirmDialogComponent } from '../../shared/components/common/confirm-dialog/confirm-dialog.component';
import { StoreFormModalComponent } from '../../shared/components/form/store-form-modal/store-form-modal.component';
import { ButtonComponent } from '../../shared/components/ui/button/button.component';

import { ModalService } from '../../shared/services/modal.service';
import { StoresService, Store } from '../../shared/services/stores.service';

@Component({
  selector: 'app-stores',
  standalone: true,
  imports: [
    CommonModule,
    PageBreadcrumbComponent,
    StoreFormModalComponent,
    ConfirmDialogComponent,
    ButtonComponent,
  ],
  templateUrl: './stores.component.html',
})
export class StoresComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild(StoreFormModalComponent) formModal!: StoreFormModalComponent;
  @ViewChild(ConfirmDialogComponent) confirmDialog!: ConfirmDialogComponent;

  private destroy$ = new Subject<void>();

  stores: Store[] = [];
  isLoading = false;
  error: string | null = null;
  success: string | null = null;

  constructor(
    private storesService: StoresService,
    private modalService: ModalService
  ) {}

  ngOnInit() {
    this.loadStores();
  }

  loadStores() {
    this.isLoading = true;
    this.error = null;

    this.storesService.getStores()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (stores) => {
          this.stores = stores;
          this.isLoading = false;
        },
        error: (err) => {
          this.error = err.message || 'Failed to load stores';
          this.isLoading = false;
        },
      });
  }

  getManagerName(manager: any): string {
    if (!manager) return 'No manager';
    if (typeof manager === 'string') return manager;
    return `${manager.first_name} ${manager.last_name}`;
  }

  openAddModal() {
    this.formModal.resetForm();
    this.modalService.openModal();
  }

  openEditModal(store: Store) {
    this.formModal.setFormData(store);
    this.modalService.openModal();
  }

  deleteStore(id?: string) {
    if (!id) return;

    this.confirmDialog
      .open({
        title: 'Delete Store',
        message: 'Are you sure you want to delete this store?',
        confirmText: 'Delete',
        cancelText: 'Cancel',
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe((confirmed) => {
        if (confirmed) {
          this.storesService.deleteStore(id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: () => {
                this.success = 'Store deleted successfully!';
                this.loadStores();
                setTimeout(() => this.success = null, 3000);
              },
              error: (err) => {
                this.error = err.message || 'Failed to delete store';
                setTimeout(() => this.error = null, 3000);
              },
            });
        }
      });
  }

  ngAfterViewInit() {
    this.modalService.isOpen$
      .pipe(takeUntil(this.destroy$))
      .subscribe((isOpen) => {
        if (!isOpen) {
          setTimeout(() => this.loadStores(), 300);
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}