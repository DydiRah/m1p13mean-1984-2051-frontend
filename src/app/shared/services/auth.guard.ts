import { Injectable } from "@angular/core";
import {
  CanActivate,
  CanActivateChild,
  Router,
  UrlTree,
} from "@angular/router";

@Injectable({ providedIn: "root" })
export class AuthGuard implements CanActivate, CanActivateChild {
  constructor(private router: Router) {}

  private hasToken(): boolean {
    return !!localStorage.getItem("token");
  }

  canActivate(): boolean | UrlTree {
    if (this.hasToken()) return true;
    return this.router.createUrlTree(["/signin"]);
  }

  canActivateChild(): boolean | UrlTree {
    return this.canActivate();
  }
}
