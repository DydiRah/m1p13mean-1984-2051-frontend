import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ButtonComponent } from '../../ui/button/button.component';

export interface ConfirmDialogConfig {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center" [class.hidden]="!isOpen">
      <!-- Overlay -->
      <div class="absolute inset-0 bg-black/50" (click)="cancel()"></div>

      <!-- Dialog Content -->
      <div class="relative z-10 w-full max-w-sm rounded-lg bg-white p-6 dark:bg-gray-800 shadow-lg">
        <!-- Title -->
        <h2 class="text-lg font-semibold text-gray-800 dark:text-white mb-3">{{ config.title }}</h2>

        <!-- Message -->
        <p class="text-sm text-gray-600 dark:text-gray-300 mb-6">{{ config.message }}</p>

        <!-- Buttons -->
        <div class="flex gap-3 justify-end">
          <app-button
            [disabled]="isLoading"
            variant="outline"
            (btnClick)="cancel()"
          >
            {{ config.cancelText || 'Cancel' }}
          </app-button>
          <button
            (click)="confirm()"
            [disabled]="isLoading"
            class="inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium bg-red-600 text-white hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed transition-colors"
          >
            {{ config.confirmText || 'Confirm' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class ConfirmDialogComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private confirmSubject = new Subject<boolean>();

  isOpen = false;
  isLoading = false;
  config: ConfirmDialogConfig = {
    title: 'Confirm',
    message: 'Are you sure?',
  };

  ngOnInit() {}

  open(config: ConfirmDialogConfig): Observable<boolean> {
    this.config = { ...config };
    this.isOpen = true;
    this.isLoading = false;
    return this.confirmSubject.asObservable();
  }

  confirm() {
    this.isLoading = true;
    setTimeout(() => {
      this.confirmSubject.next(true);
      this.close();
    }, 300);
  }

  cancel() {
    this.confirmSubject.next(false);
    this.close();
  }

  private close() {
    this.isOpen = false;
    this.isLoading = false;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
