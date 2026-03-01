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
import { ItemsComponent } from "./pages/items/items.component";
import { ItemsBuyerComponent } from "./pages/items-buyer/items-buyer.component";
import { OrdersComponent } from "./pages/orders/orders.component";
import { ContractComponent } from "./pages/contract/contract.component";
import { roleGuard } from "./guards/role.guard";

export const routes: Routes = [
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
        data: { roles: ['admin', 'store'] }
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
          "Angular Profile Dashboard | TailAdmin - Angular Admin Dashboard Template",
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
      "Angular Sign In Dashboard | TailAdmin - Angular Admin Dashboard Template",
  },
  {
    path: "signup",
    component: SignUpComponent,
    title:
      "Angular Sign Up Dashboard | TailAdmin - Angular Admin Dashboard Template",
  },
  // error pages
  {
    path: "**",
    component: NotFoundComponent,
    title:
      "Angular NotFound Dashboard | TailAdmin - Angular Admin Dashboard Template",
  },
];
