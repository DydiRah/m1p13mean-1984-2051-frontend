import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Subject, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ModalService } from '../../../services/modal.service';
import { ItemsService, Item } from '../../../services/items.service';
import { LabelComponent } from '../label/label.component';
import { InputFieldComponent } from '../input/input-field.component';
import { ButtonComponent } from '../../ui/button/button.component';
import { StockMovement, StockMovementService } from '../../../services/stockMovement.service';


@Component({
  selector: 'app-item-form-modal',
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    LabelComponent,
    InputFieldComponent,
    ButtonComponent,
  ],
  templateUrl: './stock-form-modal.component.html',
  styles: ``,
})
export class StockFormModalComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  isOpen$: Observable<boolean>;

  isEditMode = false;
  isLoading = false;
  error: string | null = null;
  success: string | null = null;
  items: Item[] = [];

  form = {
    _id: '' as string | undefined,
    type: 'input' as 'input' | 'output',
    quantity: 0,
    purchasePrice: 0,
    item_id: '', // Item ID
  };
  
  constructor(
    private modalService: ModalService,
    private stockMovementService: StockMovementService,
    private itemsService: ItemsService,
  ) {
    this.isOpen$ = this.modalService.isOpen$;
  }

  ngOnInit(): void {
    this.itemsService.getItems()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.items = data;
        },
        error: (err) => {
          console.error('Erreur chargement items', err);
        }
      });
  }

  resetForm() {
    this.form = {
      _id: '',
      type: 'input',
      quantity: 0,
      purchasePrice: 0,
      item_id: ''
    };
    this.error = null;
    this.success = null;
    this.isEditMode = false;
  }

  setFormData(stockMovement?: StockMovement) {
    if (stockMovement) {
      this.form = {
          _id: stockMovement._id,
          type: stockMovement.type,
          quantity: stockMovement.quantity,
          purchasePrice: stockMovement.purchasePrice || 0,
          item_id: stockMovement.item?._id || ''
      };
      this.isEditMode = true;
    } else {
      this.resetForm();
    }
  }

  onSubmit() {
    if (!this.validateForm()) {
      return;
    }
    if (this.isLoading) {
      return; // évite double submit
    }

    this.isLoading = true;
    this.error = null;
    this.success = null;

    const stockData: StockMovement = {
      _id: this.form._id,
      type: this.form.type,
      quantity: this.form.quantity,
      purchasePrice: this.form.purchasePrice,
      item_id: this.form.item_id
    };
    
    const request$ = this.isEditMode
      ? this.stockMovementService.updateStock(this.form._id!, stockData)
      : this.stockMovementService.createStock(stockData);

    request$.pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.success = this.isEditMode
          ? 'Stock movement updated successfully!'
          : 'Stock movement created successfully!';
        this.isLoading = false;
        setTimeout(() => {
          this.closeModal();
        }, 1000);
      },
      error: (err) => {
        // err is Error thrown from service.handleError, message may contain backend text
        this.error = err?.message || 'An error occurred';
        this.isLoading = false;
      },
    });
    
  }

  validateForm(): boolean {
    if (!this.form.type) {
      this.error = 'Type is required';
      return false;
    }
    if (!this.form.purchasePrice) {
      this.error = 'Purchase price is required';
      return false;
    }
    if (!this.form.quantity || this.form.quantity <= 0) {
      this.error = 'Quantity must be greater than 0';
      return false;
    }
    return true;
  }

  closeModal() {
    this.resetForm();
    this.modalService.closeModal();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}