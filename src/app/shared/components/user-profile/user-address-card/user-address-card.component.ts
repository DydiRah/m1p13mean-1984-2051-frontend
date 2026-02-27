import { Component } from '@angular/core';
import { ModalService } from '../../../services/modal.service';

import { InputFieldComponent } from '../../form/input/input-field.component';
import { ButtonComponent } from '../../ui/button/button.component';
import { LabelComponent } from '../../form/label/label.component';
import { ModalComponent } from '../../ui/modal/modal.component';
import { FormsModule } from '@angular/forms';
import { Store, StoresService } from '../../../services/stores.service';
import { takeUntil } from 'rxjs/operators';
import { Subject, Observable } from 'rxjs';
import { UserService, User } from '../../../services/user.service';


@Component({
  selector: 'app-user-address-card',
  imports: [
    InputFieldComponent,
    ButtonComponent,
    LabelComponent,
    ModalComponent,
    FormsModule
],
  templateUrl: './user-address-card.component.html',
  styles: ``
})
export class UserAddressCardComponent {
  private destroy$ = new Subject<void>();
  user: User = {};
  store: Store = {
  } as Store;

  storeForm: Store = {
    name: '',
    description: '',
    manager: ''
  };

  constructor(public modal: ModalService, private storesService: StoresService, private userService: UserService) {

  }

  ngOnInit(){
    this.loadStore();
    this.userService.currentUser$.subscribe(user => {
      this.user = user || {};
    }); 
  }

  loadStore(){
    this.storesService.getStores()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.store = data[0];
        },
        error: (err) => {
          console.error('Erreur chargement categories', err);
        }
      });
  }

  isOpen = false;
  openModal() { 
    this.isOpen = true;
    this.storeForm = {
      name: this.store?.name,
      description: this.store?.description,
      manager: this.user
    }
  }

  closeModal() { this.isOpen = false; }


  handleSave() {
    if (!this.store._id) return;

    this.storesService.updateStore(this.store._id, this.storeForm)
      .subscribe({
        next: (updatedStore) => {
          this.store = updatedStore;                  // Met à jour le store local
          this.loadStore();                           // Recharge les données si besoin
          this.closeModal();                          // Ferme le modal
        },
        error: (err) => {
          console.error("Error updating store:", err);
        }
      });
  }
}
