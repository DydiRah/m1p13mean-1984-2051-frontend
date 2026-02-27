import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { UserService } from './shared/services/user.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'Angular Ecommerce Dashboard | TailAdmin';
  constructor(private userService: UserService) {}

  ngOnInit() {
    if (localStorage.getItem('token')) {
      this.userService.getCurrentUser();
    }
  }
}
