import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PageBreadcrumbComponent } from '../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { ConfirmDialogComponent } from '../../shared/components/common/confirm-dialog/confirm-dialog.component';
import { StockFormModalComponent } from '../../shared/components/form/stock-form-modal/stock-form-modal.component';
import { ButtonComponent } from '../../shared/components/ui/button/button.component';
import { BadgeComponent } from '../../shared/components/ui/badge/badge.component';
import { ModalService } from '../../shared/services/modal.service';
import { environment } from '../../../environments/environment';
import { StockMovement, StockMovementService } from '../../shared/services/stockMovement.service';
import { FormsModule } from '@angular/forms';
import { ItemsService } from '../../shared/services/items.service';



@Component({
  selector: 'app-items',
  imports: [
    CommonModule,
    HttpClientModule,
    PageBreadcrumbComponent,
    StockFormModalComponent,
    ConfirmDialogComponent,
    ButtonComponent,
    FormsModule,
  ],
  templateUrl: './stockes.component.html',
  styles: ``,
})
export class StockesComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(StockFormModalComponent) formModal!: StockFormModalComponent;
  @ViewChild(ConfirmDialogComponent) confirmDialog!: ConfirmDialogComponent;

  private destroy$ = new Subject<void>();

  stockMovement: StockMovement[] = [];
  selectedStockType: string = '';
  selectedItem: string = '';
  items: any[] = [];

  isLoading = false;
  error: string | null = null;
  success: string | null = null;

  constructor(
    private stockMovementService: StockMovementService,
    private modalService: ModalService,
    private itemsService: ItemsService
  ) {}

  ngOnInit() {
    this.itemsService.getItems()
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (data) => {
        this.items = data;
      },
      error: (err) => {
        this.error = err.message || 'Failed to load items';
      },
    });
    this.loadStocks();
  }

  loadStocks() {
    this.isLoading = true;
    this.error = null;    
    this.stockMovementService
    .getStockMovements()
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (stocks) => {
        this.stockMovement = stocks;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = err.message || 'Failed to load stock movements';
        this.isLoading = false;
      },
    });
  }


  openAddModal() {
    this.formModal.resetForm();
    this.modalService.openModal();
  }

  openEditModal(stockMovement: StockMovement) {
    this.formModal.setFormData(stockMovement);
    this.modalService.openModal();
  }

  deleteItem(id: string | undefined) {
    if (!id) return;

    this.confirmDialog
      .open({
        title: 'Delete Stock Movement',
        message: 'Are you sure you want to delete this stock movement? This action cannot be undone.',
        confirmText: 'Delete',
        cancelText: 'Cancel',
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe((confirmed) => {
        if (confirmed) {
          this.stockMovementService
            .deleteStockMovement(id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: () => {
                this.success = 'Stock movement deleted successfully!';
                this.loadStocks();
                setTimeout(() => {
                  this.success = null;
                }, 3000);
              },
              error: (err) => {
                this.error = err.message || 'Failed to delete stock movement';
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
            this.loadStocks();
          }, 500);
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
