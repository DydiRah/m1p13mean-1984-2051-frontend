import { Routes } from "@angular/router";
import { EcommerceComponent } from "./pages/dashboard/ecommerce/ecommerce.component";
import { ProfileComponent } from "./pages/profile/profile.component";
import { NotFoundComponent } from "./pages/other-page/not-found/not-found.component";
import { AppLayoutComponent } from "./shared/layout/app-layout/app-layout.component";
import { InvoicesComponent } from "./pages/invoices/invoices.component";
import { SignInComponent } from "./pages/auth-pages/sign-in/sign-in.component";
import { SignUpComponent } from "./pages/auth-pages/sign-up/sign-up.component";
import { BoxesComponent } from "./pages/boxes/boxes.component";
import { StoresComponent } from "./pages/stores/stores.component";
import { StockesComponent } from "./pages/stockes/stockes.component";
import { LandingPageComponent } from "./pages/landing-page/landing-page.component";
import { ItemsComponent } from "./pages/items/items.component";
import { ItemsBuyerComponent } from "./pages/items-buyer/items-buyer.component";
import { OrdersComponent } from "./pages/orders/orders.component";
import { ContractComponent } from "./pages/contract/contract.component";
import { roleGuard } from "./guards/role.guard";

export const routes: Routes = [
  {
    path: "",
    component: LandingPageComponent,
    pathMatch: "full",
    title: "Vendeo"
  },
  {
    path: "",
    component: AppLayoutComponent,
    canActivateChild: [roleGuard],
    children: [
      {
        path: "dashboard",
        component: EcommerceComponent,
        pathMatch: "full",
        title:
          "Dashboard - Vendeo",
        data: { roles: ['admin', 'store', 'buyer'] }
      },
      {
        path: "stores",
        component: StoresComponent,
        title:
          "Stores - Vendeo",
        data: { roles: ['admin', 'store'] }
      },
      {
        path: "contract/:boxId",
        component: ContractComponent,
        title: "Contract - Vendeo",
        data: { roles: ['admin'] }
      },
      {
        path: "boxes",
        component: BoxesComponent,
        title:
          "Boxes - Vendeo",
        data: { roles: ['admin', 'store'] }
      },
      {
        path: "stockes",
        component: StockesComponent,
        title:
          "Stockes - Vendeo",
        data: { roles: ['store'] }
      },
      {
        path: "items",
        component: ItemsComponent,
        title:
          "Items - Vendeo",
        data: { roles: ['store', 'buyer'] }
      },
      {
        path: "orders",
        component: OrdersComponent,
        title:
          "Orders - Vendeo",
        data: { roles: ['store', 'buyer'] }
      },
      {
        path: "all-items",
        component: ItemsBuyerComponent,
        title:
          "Items - Vendeo",
        data: { roles: ['buyer'] }
      },
      {
        path: "profile",
        component: ProfileComponent,
        title:
          "Profile - Vendeo",
        data: { roles: ['buyer', 'admin', 'store'] }
      },
      {
        path: "invoice",
        component: InvoicesComponent,
        title:
          "Invoice - Vendeo",
      },
    ],
  },
  // auth pages
  {
    path: "signin",
    component: SignInComponent,
    title:
      "Login - Vendeo",
  },
  {
    path: "signup",
    component: SignUpComponent,
    title:
      "Create account - Vendeo",
  },
  // error pages
  {
    path: "**",
    component: NotFoundComponent,
    title:
      "Not Found - Vendeo",
  },
];
