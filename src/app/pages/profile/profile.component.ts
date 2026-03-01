
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageBreadcrumbComponent } from '../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { UserMetaCardComponent } from '../../shared/components/user-profile/user-meta-card/user-meta-card.component';
import { UserInfoCardComponent } from '../../shared/components/user-profile/user-info-card/user-info-card.component';
import { UserAddressCardComponent } from '../../shared/components/user-profile/user-address-card/user-address-card.component';
import { User, UserService } from '../../shared/services/user.service';

@Component({
  selector: 'app-profile',
  imports: [
    PageBreadcrumbComponent,
    UserMetaCardComponent,
    UserInfoCardComponent,
    UserAddressCardComponent,
    CommonModule
],
  templateUrl: './profile.component.html',
  styles: ``
})
export class ProfileComponent {
  user!: User;

  constructor(private userService: UserService){}

  ngOnInit() {
    this.userService.currentUser$.subscribe(user => {
      this.user = user || {};
    }); 
  }
}
