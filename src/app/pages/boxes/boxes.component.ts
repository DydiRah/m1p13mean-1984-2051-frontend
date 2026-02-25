import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PageBreadcrumbComponent } from '../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { ConfirmDialogComponent } from '../../shared/components/common/confirm-dialog/confirm-dialog.component';
import { BoxFormModalComponent } from '../../shared/components/form/box-form-modal/box-form-modal.component';
import { ButtonComponent } from '../../shared/components/ui/button/button.component';
import { ModalService } from '../../shared/services/modal.service';
import { BoxesService, Box } from '../../shared/services/box.service';


@Component({
  selector: 'app-boxes',
  imports: [
    CommonModule,
    HttpClientModule,
    PageBreadcrumbComponent,
    BoxFormModalComponent,
    ConfirmDialogComponent,
    ButtonComponent,
  ],
  templateUrl: './boxes.component.html',
  styles: ``,
})
export class BoxesComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(BoxFormModalComponent) formModal!: BoxFormModalComponent;
  @ViewChild(ConfirmDialogComponent) confirmDialog!: ConfirmDialogComponent;

  private destroy$ = new Subject<void>();

  boxes: Box[] = [];
  isLoading = false;
  error: string | null = null;
  success: string | null = null;

  constructor(
    private boxesService: BoxesService,
    private modalService: ModalService
  ) {}

  ngOnInit() {
    this.loadBoxes();
  }

  loadBoxes() {
    this.isLoading = true;
    this.error = null;    
    this.boxesService
    .getBoxes()
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (boxes) => {
        this.boxes = boxes;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = err.message || 'Failed to load boxes';
        this.isLoading = false;
      },
    });
  }

  openAddModal() {
    this.formModal.resetForm();
    this.modalService.openModal();
  }

  openEditModal(box: Box) {
    this.formModal.setFormData(box);
    this.modalService.openModal();
  }

  deleteBox(id: string | undefined) {
    if (!id) return;

    this.confirmDialog
      .open({
        title: 'Delete Box',
        message: 'Are you sure you want to delete this box? This action cannot be undone.',
        confirmText: 'Delete',
        cancelText: 'Cancel',
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe((confirmed) => {
        if (confirmed) {
          this.boxesService
            .deleteBox(id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: () => {
                this.success = 'Box deleted successfully!';
                this.loadBoxes();
                setTimeout(() => {
                  this.success = null;
                }, 3000);
              },
              error: (err) => {
                this.error = err.message || 'Failed to delete box';
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
            this.loadBoxes();
          }, 500);
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
