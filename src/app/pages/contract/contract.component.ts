import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Subject, takeUntil } from 'rxjs';

import { PageBreadcrumbComponent } from '../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { ButtonComponent } from '../../shared/components/ui/button/button.component';
import { ContractFormModalComponent } from '../../shared/components/form/contract-form-modal/contract-form-modal.component';

import { ModalService } from '../../shared/services/modal.service';
import { BoxesService, Box } from '../../shared/services/box.service';
import { ContractService, Contract } from '../../shared/services/contract.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-contract',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    PageBreadcrumbComponent,
    ButtonComponent,
    ContractFormModalComponent
  ],
  templateUrl: './contract.component.html'
})
export class ContractComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild(ContractFormModalComponent)
  contractModal!: ContractFormModalComponent;

  private destroy$ = new Subject<void>();

  boxes: Box[] = [];

  confirmActionType: 'terminate' | 'pay' | null = null;
  selectedContractId: string | null = null;
  showConfirmModal = false;

  contractsHistory: Contract[] = [];
  isLoadingHistory = false;
  success: string | null = null;
  error: string | null = null;

  selectedBoxId: string | null = null;

  currentContract: any = null;
  isLoadingCurrent = false;
  selectedBox: any;

  constructor(
    private modalService: ModalService,
    private boxService: BoxesService,
    private route: ActivatedRoute,
    private contractService: ContractService,
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('boxId');

      if (id) {
        this.selectedBoxId = id;
        console.log("Box ID received:", this.selectedBoxId);
      }
    });
    this.loadBox();
    this.loadContractsHistory();
  }

  openConfirmModal(contractId: string, action: 'terminate' | 'pay') {
    this.selectedContractId = contractId;
    this.confirmActionType = action;
    this.showConfirmModal = true;
  }

  confirmAction() {

  if (!this.selectedContractId) return;

  if (this.confirmActionType === 'terminate') {

    const date = new Date();

    this.contractService.terminateContract(
      this.selectedContractId,
      date
    ).subscribe(() => {
      this.loadContractsHistory();
    });

  }

  if (this.confirmActionType === 'pay') {
      this.contractService.payNextPeriod(
        this.selectedContractId
      ).subscribe(() => {
        this.loadContractsHistory();
      });
    }
    this.closeConfirmModal();
  }

  loadBox() {
    if (!this.selectedBoxId) return;
    this.boxService.getBox(this.selectedBoxId)
      .subscribe(box => {
        this.selectedBox = box;
      });
  }

  closeConfirmModal() {
    this.showConfirmModal = false;
    this.selectedContractId = null;
    this.confirmActionType = null;
  }

  getContractPeriodRange(contract: any): string {

    if (!contract?.periods?.length) return "";

    const first = contract.periods[0].startDate;
    const last = contract.periods[contract.periods.length - 1].endDate;

    return `${new Date(first).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            →
            ${new Date(last).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;
  }

  getStoreName(contract: Contract): string {
    if (!contract.store) return "";

    return typeof contract.store === "object"
      ? contract.store.name || ""
      : contract.store;
  }

  loadContractsHistory() {
    if (!this.selectedBoxId) return;
    this.isLoadingHistory = true;
    this.contractService.getContractsHistory(this.selectedBoxId)
      .subscribe({
        next: (data) => {
          this.contractsHistory = data;
          this.isLoadingHistory = false;
        },
        error: (err) => {
          console.error(err);
          this.isLoadingHistory = false;
        }
      });
  }

  openContractModal() {
    if (!this.selectedBoxId) return;
    this.contractModal.setBoxId(this.selectedBoxId);
    this.modalService.openModal();
  }

  ngAfterViewInit() {
    this.modalService.isOpen$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isOpen => {
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  terminate(contractId: string) {
    const date = new Date();
    this.contractService.terminateContract(contractId, date)
      .subscribe({
        next: () => {
          this.loadContractsHistory();
        },
        error: err => console.error(err)
      });
  }

  pay(contractId: string) {
    this.contractService.payNextPeriod(contractId)
      .subscribe({
        next: () => {
          this.loadContractsHistory();
        },
        error: err => console.error(err)
      });
  }

  countPendingPeriods(contract: any): number {
    if (!contract?.periods) return 0;
    return contract.periods.filter(
      (p: any) => p.payment_status === "pending"
    ).length;
  }

  countPaidPeriods(contract: any): number {
    if (!contract?.periods) return 0;

    return contract.periods.filter(
      (p: any) => p.payment_status === "paid"
    ).length;
  }

  hasPendingPeriods(contract: any): boolean {
    if (!contract?.periods) return false;

    return contract.periods.some(
      (p: any) => p.payment_status === "pending"
    );
  }

  isTerminateAllowed(index: number): boolean {
    return (
      index === 0 &&
      this.selectedBox?.box?.status === 'occupied'
    );

  }
}