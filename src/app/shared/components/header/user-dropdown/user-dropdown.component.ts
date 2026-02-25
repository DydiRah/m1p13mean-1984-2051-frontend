import { Component } from "@angular/core";
import { DropdownComponent } from "../../ui/dropdown/dropdown.component";
import { CommonModule } from "@angular/common";
import { Router, RouterModule } from "@angular/router";
import { DropdownItemTwoComponent } from "../../ui/dropdown/dropdown-item/dropdown-item.component-two";
import { UserService, User } from "../../../services/user.service";
import { environment } from "../../../../../environments/environment";

@Component({
  selector: "app-user-dropdown",
  templateUrl: "./user-dropdown.component.html",
  imports: [
    CommonModule,
    RouterModule,
    DropdownComponent,
    DropdownItemTwoComponent,
  ],
})
export class UserDropdownComponent {
  isOpen = false;
  user: User = {};

  constructor(private router: Router, private userService: UserService) {
  }

  ngOnInit() {
    this.userService.getCurrentUser().subscribe({
      next: (user) => {
        this.user = user;
      },
      error: (err) => {
        console.error('Failed to fetch user info:', err);
      }
    });  
  }

  getImageUrl(user: any): string {
    if (user.pdp_url) {
      return environment.apiBaseUrl.replace(/\/?api\/?/, '') + user.pdp_url;
    } else {
      return 'assets/placeholder.png'; // Path to your placeholder image
    }
  }

  toggleDropdown() {    
    this.isOpen = !this.isOpen;
  }

  closeDropdown() {
    this.isOpen = false;
  }

  onSignOut(event?: Event) {
    if (event) event.preventDefault();
    localStorage.removeItem("token");
    this.closeDropdown();
    this.router.navigateByUrl("/signin");
  }
}
