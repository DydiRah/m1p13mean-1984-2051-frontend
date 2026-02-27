import { Component } from '@angular/core';
import { InputFieldComponent } from './../../form/input/input-field.component';
import { ModalService } from '../../../services/modal.service';

import { ModalComponent } from '../../ui/modal/modal.component';
import { ButtonComponent } from '../../ui/button/button.component';
import { FileInputComponent } from "../../form/input/file-input.component";
import { LabelComponent } from "../../form/label/label.component";

import { User, UserService } from '../../../services/user.service';
import { environment } from "../../../../../environments/environment";
import { FormsModule } from '@angular/forms';



@Component({
  selector: 'app-user-meta-card',
  imports: [
    ModalComponent,
    InputFieldComponent,
    FormsModule,
    ButtonComponent,
    FileInputComponent,
    LabelComponent
],
  templateUrl: './user-meta-card.component.html',
  styles: ``
})
export class UserMetaCardComponent {
  user!: User;

  selectedFile?: File;
  previewUrl?: string | null = null;

  userFormData: User = {
    email: '',
    last_name: '',
    first_name: '',
    pdp_url: '',
    phone: '',
    adress: '',
  };

  constructor(public modal: ModalService, private userService: UserService) {

  }

  ngOnInit() {
    this.userService.currentUser$.subscribe(user => {
      this.user = user || {};
    }); 
  }

  isOpen = false;
  openModal() { 
    this.isOpen = true; 
    this.userFormData = {
      email: this.user.email,
      last_name: this.user.last_name,
      first_name: this.user.first_name,
      pdp_url: this.user.pdp_url,
      phone: this.user.phone,
      adress: this.user.adress,
    }
  }
  closeModal() { this.isOpen = false; }

  getImageUrl(user: any): string {
    if (user.pdp_url) {
      return environment.apiBaseUrl.replace(/\/?api\/?/, '') + user.pdp_url;
    } else {
      return 'assets/placeholder.png'; // Path to your placeholder image
    }
  }
  
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      // revoke previous preview
      if (this.previewUrl) {
        URL.revokeObjectURL(this.previewUrl);
      }
      this.selectedFile = input.files[0];
      this.previewUrl = URL.createObjectURL(this.selectedFile);
    } else {
      if (this.previewUrl) {
        URL.revokeObjectURL(this.previewUrl);
      }
      this.selectedFile = undefined;
      this.previewUrl = null;
    }
  }


  handleSave() {
    if (this.user._id)
    {
      this.userService.updateUser(this.user._id, this.userFormData, this.selectedFile).subscribe({
        next: (updatedUser) => {
          console.log('User updated', updatedUser);
          this.user = updatedUser;
          this.closeModal();
        },
        error: (err) => console.error('Error updating user', err)
      });
    }
  }
}
