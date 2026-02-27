import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Subject, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ModalService } from '../../../services/modal.service';
import { BoxesService, Box } from '../../../services/box.service';
import { ShoppingCenterService } from '../../../services/shoppingCenter.service';

import { LabelComponent } from '../label/label.component';
import { InputFieldComponent } from '../input/input-field.component';
import { ButtonComponent } from '../../ui/button/button.component';

@Component({
  selector: 'app-box-form-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    LabelComponent,
    InputFieldComponent,
    ButtonComponent,
  ],
  templateUrl: './box-form-modal.component.html',
})
export class BoxFormModalComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();
  isOpen$: Observable<boolean>;

  isEditMode = false;
  isLoading = false;
  error: string | null = null;
  success: string | null = null;

  form = {
    _id: '' as string | undefined,
    size: 0 as number,
    price: 0 as number | null,
    status: 'available' as 'available' | 'occupied', 
    shopping_center: '' as string | null,
    price_history: [] as number[]
  };

  constructor(
    private shoppingCenterService: ShoppingCenterService,
    private boxesService: BoxesService,
    private modalService: ModalService,
  ) {
    this.isOpen$ = this.modalService.isOpen$;
  }

  private loadDefaultShoppingCenter(): void {
    this.shoppingCenterService.getSingleShoppingCenter()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (center) => {
          if (center?._id) {
            this.form.shopping_center = center._id;
          }
        },
        error: (err) => {
          console.error(err);
          this.error = 'Impossible de charger le Shopping Center';
        }
      });
  }

  ngOnInit(): void {
    this.loadDefaultShoppingCenter();
  }

  // Reset du formulaire
  resetForm() {
    this.form = {
      _id: '',
      size: 0,
      price: 0,
      status: 'available', // 🔥 toujours available à la création
      shopping_center: null,
      price_history: []
    };

    this.error = null;
    this.success = null;
    this.isEditMode = false;

    this.loadDefaultShoppingCenter();
  }

  // Remplir le form en mode édition
  setFormData(box?: Box) {
    if (box) {
      this.form = {
        _id: box._id,
        size: box.size,
        price: box.price,
        status: box.status, 
        shopping_center: box.shopping_center,
        price_history: box.price_history || []
      };
      this.isEditMode = true;
    } else {
      this.resetForm();
    }
  }

  // Validation
  validateForm(): boolean {
    if (!this.form.size || this.form.size <= 0) {
      this.error = 'Size must be greater than 0';
      return false;
    }

    if (this.form.price === null || this.form.price <= 0) {
      this.error = 'Price must be greater than 0';
      return false;
    }

    return true; 
  }

  // Submit
  onSubmit() {
    if (!this.validateForm() || this.isLoading) {
      return;
    }

    this.isLoading = true;
    this.error = null;
    this.success = null;

    const boxData: Box = {
      size: this.form.size,
      price: this.form.price!,
      status: this.isEditMode
        ? this.form.status   
        : 'available',       
      shopping_center: this.form.shopping_center,
      price_history: this.form.price_history
    };

    const request$ = this.isEditMode
      ? this.boxesService.updateBox(this.form._id!, boxData)
      : this.boxesService.createBox(boxData);

    request$.pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.success = this.isEditMode
          ? 'Box updated successfully!'
          : 'Box created successfully!';

        this.isLoading = false;

        setTimeout(() => {
          this.closeModal();
        }, 1000);
      },
      error: (err) => {
        this.error = err?.message || 'An error occurred';
        this.isLoading = false;
      },
    });
  }

  // Fermer modal
  closeModal() {
    this.resetForm();
    this.modalService.closeModal();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}