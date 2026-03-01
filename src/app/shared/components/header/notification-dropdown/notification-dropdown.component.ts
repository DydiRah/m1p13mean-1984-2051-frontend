import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DropdownComponent } from '../../ui/dropdown/dropdown.component';
import { DropdownItemComponent } from '../../ui/dropdown/dropdown-item/dropdown-item.component';
import { Subscription } from 'rxjs';
import { Notification, NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-notification-dropdown',
  templateUrl: './notification-dropdown.component.html',
  imports:[CommonModule,RouterModule,DropdownComponent]
})
export class NotificationDropdownComponent implements OnInit, OnDestroy {
  isOpen = false;
  notifying = true;
  notifications?: Notification[] = [];
  hasNew: boolean = false;
  private sub!: Subscription;

  constructor(private notificationService: NotificationService) {}

  async ngOnInit() {
    this.notificationService.getNotifications().subscribe(notifs => {      
      this.notifications = notifs;
    }); 
    this.sub = this.notificationService.connect()
      .subscribe((notif: any) => {
        this.hasNew = true;
        if (this.notifications) {
          this.notifications.unshift(notif);
        }
      });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  toggleDropdown() {
    this.isOpen = !this.isOpen;
    this.notifying = false;

    this.notificationService.viewAll().subscribe((notifs) => this.notifications = notifs);
  }

  closeDropdown() {
    this.isOpen = false;
  }

  getTimeAgo(date: string): string {
    const now = new Date();
    const notifDate = new Date(date);
    const seconds = Math.floor((now.getTime() - notifDate.getTime()) / 1000);

    const intervals: any = {
      year: 31536000,
      month: 2592000,
      day: 86400,
      hour: 3600,
      minute: 60
    };

    for (let key in intervals) {
      const interval = Math.floor(seconds / intervals[key]);
      if (interval > 1) return `${interval} ${key}s ago`;
      if (interval === 1) return `1 ${key} ago`;
    }

    return "Just now";
  }

  markAsViewed(notif: Notification) {
    this.closeDropdown();
  }
}