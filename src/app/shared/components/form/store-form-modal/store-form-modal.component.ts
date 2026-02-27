import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ModalService } from '../../../services/modal.service';
import { StoresService, Store } from '../../../services/stores.service';
import { UserService, User } from '../../../services/user.service'; // pour charger managers

import { LabelComponent } from '../label/label.component';
import { InputFieldComponent } from '../input/input-field.component';
import { ButtonComponent } from '../../ui/button/button.component';

@Component({
  selector: 'app-store-form-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LabelComponent,
    InputFieldComponent,
    ButtonComponent,
  ],
  templateUrl: './store-form-modal.component.html',
})
export class StoreFormModalComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();
  isOpen$: Observable<boolean>;

  isEditMode = false;
  isLoading = false;
  error: string | null = null;
  success: string | null = null;

  managers: User[] = []; // liste des users role=store

  form = {
    _id: '' as string | undefined,
    name: '',
    description: '',
    manager: null as string | User | null,
  };

  constructor(
    private storesService: StoresService,
    private userService: UserService,
    private modalService: ModalService,
  ) {
    this.isOpen$ = this.modalService.isOpen$;
  }

  ngOnInit(): void {
    this.loadManagers();
  }

  loadManagers() {
    this.userService.getStoreUsers()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (users) => {
          console.log('Managers:', users);
          this.managers = users;
        },
        error: (err) => {
          console.error(err);
          this.error = 'Failed to load managers';
        }
      });
  }

  resetForm() {
    this.form = {
      _id: '',
      name: '',
      description: '',
      manager: null
    };

    this.error = null;
    this.success = null;
    this.isEditMode = false;
  }

  setFormData(store?: Store) {
    if (store) {
      this.form = {
        _id: store._id,
        name: store.name,
        description: store.description,
        manager: store.manager
      };
      this.isEditMode = true;
    } else {
      this.resetForm();
    }
  }

  validateForm(): boolean {
    if (!this.form.name.trim()) {
      this.error = 'Store name is required';
      return false;
    }

    if (!this.form.manager) {
      this.error = 'Manager is required';
      return false;
    }

    return true;
  }

  onSubmit() {
    if (!this.validateForm() || this.isLoading) return;

    this.isLoading = true;
    this.error = null;

    const storeData: Store = {
      name: this.form.name,
      description: this.form.description,
      manager: this.form.manager!
    };

    const request$ = this.isEditMode
      ? this.storesService.updateStore(this.form._id!, storeData)
      : this.storesService.createStore(storeData);

    request$.pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.success = this.isEditMode
          ? 'Store updated successfully!'
          : 'Store created successfully!';

        this.isLoading = false;

        setTimeout(() => this.closeModal(), 1000);
      },
      error: (err) => {
        this.error = err?.message || 'An error occurred';
        this.isLoading = false;
      }
    });
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