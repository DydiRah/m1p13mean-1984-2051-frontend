import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, Observable, takeUntil } from 'rxjs';

import { ModalService } from '../../../services/modal.service';
import { ContractService } from '../../../services/contract.service';
import { StoresService, Store } from '../../../services/stores.service';
import { LabelComponent } from '../label/label.component';
import { ButtonComponent } from '../../ui/button/button.component';

@Component({
  selector: 'app-contract-form-modal',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    LabelComponent,
    ButtonComponent,
  ],
  templateUrl: './contract-form-modal.component.html'
})
export class ContractFormModalComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();

  isOpen$: Observable<boolean>;

  boxId!: string;

  isLoading = false;
  error: string | null = null;
  success: string | null = null;

  selectedFile: File | null = null;
  stores: Store[] = [];

  form = {
    store_id: '',
    startDateLocation: '',
    endDateLocation: ''
  };

  constructor(
    private modalService: ModalService,
    private contractService: ContractService,
    private storesService: StoresService
  ) {
    this.isOpen$ = this.modalService.isOpen$;
  }

  ngOnInit() {
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

  setBoxId(id: string) {
    this.boxId = id;
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    this.selectedFile = input.files[0];
  }

  onSubmit() {

    if (!this.boxId) {
      this.error = "Box required";
      return;
    }

    if (!this.selectedFile) {
      this.error = "Contract file required";
      return;
    }

    this.isLoading = true;
    this.error = null;
    this.success = null;

    const contractData = {
      storeId: this.form.store_id,
      startDateLocation: this.form.startDateLocation,
      endDateLocation: this.form.endDateLocation
    };

    this.contractService.createContract(
      this.boxId,
      contractData,
      this.selectedFile!
    )
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: () => {

        this.success = "Contract created successfully";

        setTimeout(() => {
          this.closeModal();
        }, 1200);

        this.isLoading = false;
      },
      error: (err) => {
        this.error = err?.message || "Error creating contract";
        this.isLoading = false;
      }
    });
  }

  closeModal() {
    this.modalService.closeModal();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}