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
import { environment } from '../../../../../environments/environment';
import { CategoriesService, Category } from '../../../services/categories.service';
import { StoresService, Store } from '../../../services/stores.service';


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
  templateUrl: './item-form-modal.component.html',
  styles: ``,
})
export class ItemFormModalComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  isOpen$: Observable<boolean>;

  isEditMode = false;
  isLoading = false;
  error: string | null = null;
  success: string | null = null;
  categories: Category[] = [];
  stores: Store[] = [];
  form = {
    _id: '' as string | undefined,
    name: '',
    description: '',
    price: null as number | null,
    quantity: 0 as number,
    type_stock: null as 'LIFO' | 'FIFO' | null,
    category: '' as string | Category,
    store: '' as string | Store,
  };
  selectedPhoto: File | null = null;
  photoPreviewUrl: string | null = null;
  photoError: string | null = null;
  isDragOver = false;
  readonly MAX_PHOTO_SIZE = 5 * 1024 * 1024; // 5MB

  constructor(
    private modalService: ModalService,
    private itemsService: ItemsService,
    private categoriesService: CategoriesService,
    private storesService: StoresService
  ) {
    this.isOpen$ = this.modalService.isOpen$;
  }

  ngOnInit(): void {
    this.categoriesService.getCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.categories = data;
        },
        error: (err) => {
          console.error('Erreur chargement categories', err);
        }
      });
    this.storesService.getStores()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.stores = data;
        },
        error: (err) => {
          console.error('Erreur chargement stores', err);
        }
      });
  }

  resetForm() {
    this.form = {
      _id: '',
      name: '',
      description: '',
      category: '',
      price: null,
      quantity: 0,
      type_stock: null,
      store: '',
    };
    this.error = null;
    this.success = null;
    this.isEditMode = false;
    this.selectedPhoto = null;
    if (this.photoPreviewUrl) {
      URL.revokeObjectURL(this.photoPreviewUrl);
      this.photoPreviewUrl = null;
    }
  }

  setFormData(item?: Item) {
    if (item) {
      const parsedPrice: number | null =
        item.price === null || item.price === undefined
          ? null
          : typeof item.price === 'string'
          ? (() => {
              const n = Number(item.price);
              return Number.isFinite(n) ? n : null;
            })()
          : (item.price as number);

      this.form = {
        _id: item._id,
        name: item.name,
        description: item.description,
        price: parsedPrice,
        quantity: item.quantity,
        type_stock: item.type_stock || null,
        category: item.category,
        store: item.store,
      };
      this.photoPreviewUrl = item.image_url ? this.getImageUrl(item) : null;
      this.isEditMode = true;
    } else {
      this.resetForm();
    }
  }

  getImageUrl(item: Item): string {
    if (item.image_url) {
      return environment.apiBaseUrl.replace(/\/?api\/?/, '') + item.image_url;
    } else {
      return 'assets/placeholder.png'; // Path to your placeholder image
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

    const itemData: Item = {
      name: this.form.name,
      description: this.form.description,
      price: this.form.price!,
      quantity: this.form.quantity,
      category: this.form.category,
      store: this.form.store,
    };
    
    const request$ = this.isEditMode
      ? this.itemsService.updateItem(this.form._id!, itemData, this.selectedPhoto ?? undefined)
      : this.itemsService.createItem(itemData, this.selectedPhoto ?? undefined);

    request$.pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.success = this.isEditMode
          ? 'Item updated successfully!'
          : 'Item created successfully!';
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

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      this.clearSelectedPhoto();
      return;
    }

    const file = input.files[0];
    this.handleNewFile(file);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      this.handleNewFile(file);
      event.dataTransfer.clearData();
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(_event: DragEvent) {
    this.isDragOver = false;
  }

  handleNewFile(file: File) {
    this.photoError = null;
    if (!this.isValidPhoto(file)) {
      return;
    }

    this.selectedPhoto = file;

    if (this.photoPreviewUrl) {
      URL.revokeObjectURL(this.photoPreviewUrl);
    }
    this.photoPreviewUrl = URL.createObjectURL(file);
  }

  isValidPhoto(file: File): boolean {
    if (!file.type.startsWith('image/')) {
      this.photoError = 'Only image files are allowed.';
      return false;
    }
    if (file.size > this.MAX_PHOTO_SIZE) {
      this.photoError = 'Image is too large (max 5MB).';
      return false;
    }
    return true;
  }

  removeSelectedPhoto() {
    this.clearSelectedPhoto();
  }

  private clearSelectedPhoto() {
    this.selectedPhoto = null;
    this.photoError = null;
    if (this.photoPreviewUrl) {
      URL.revokeObjectURL(this.photoPreviewUrl);
      this.photoPreviewUrl = null;
    }
    const input = document.getElementById('photo') as HTMLInputElement | null;
    if (input) input.value = '';
  }

  validateForm(): boolean {
    if (!this.form.name.trim()) {
      this.error = 'Name is required';
      return false;
    }
    if (!this.form.description.trim()) {
      this.error = 'Description is required';
      return false;
    }
    if (!this.form.category) {
      this.error = 'Category is required';
      return false;
    }
    if (this.form.price === null || this.form.price === undefined) {
      this.error = 'Price is required';
      return false;
    }
    if (this.form.price <= 0) {
      this.error = 'Price must be greater than 0';
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
    if (this.photoPreviewUrl) {
      URL.revokeObjectURL(this.photoPreviewUrl);
      this.photoPreviewUrl = null;
    }
  }
}
