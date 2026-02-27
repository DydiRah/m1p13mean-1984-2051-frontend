import { Component } from '@angular/core';
import { ModalService } from '../../../services/modal.service';

import { User, UserService } from '../../../services/user.service';

@Component({
  selector: 'app-user-info-card',
  imports: [
  ],
  templateUrl: './user-info-card.component.html',
  styles: ``
})
export class UserInfoCardComponent {
  user: User = {};

  constructor(public modal: ModalService, private userService: UserService) {

  }

  ngOnInit() {
    this.userService.currentUser$.subscribe(user => {
      this.user = user || {};
    }); 
  }

  isOpen = false;
  openModal() { this.isOpen = true; }
  closeModal() { this.isOpen = false; }

  handleSave() {
    // Handle save logic here
    console.log('Saving changes...');
    this.modal.closeModal();
  }
}
