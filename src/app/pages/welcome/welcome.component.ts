import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OrderService } from '../../shared/services/order.service';
import { User, UserService } from '../../shared/services/user.service';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: []
})
export class WelcomeComponent implements OnInit {
  orderCount: number = 0;
  user: User = {};

  constructor(
    private router: Router,
    private orderService: OrderService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadOrderCount();
  }

  loadOrderCount() {
    // Suppose your backend returns the orders for the logged-in user
    this.orderService.getOrders('paid').subscribe({
      next: (orders) => {
        this.orderCount = orders.length;
      },
      error: (err) => {
        console.error('Failed to load orders', err);
        this.orderCount = 0;
      }
    });
  }

  goToItems() {
    this.router.navigateByUrl('/all-items');
  }
}