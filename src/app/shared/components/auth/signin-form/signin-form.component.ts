import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { LabelComponent } from "../../form/label/label.component";
import { CheckboxComponent } from "../../form/input/checkbox.component";
import { ButtonComponent } from "../../ui/button/button.component";
import { InputFieldComponent } from "../../form/input/input-field.component";
import { Router, RouterModule } from "@angular/router";
import { FormsModule } from "@angular/forms";
import {
  HttpClient,
  HttpClientModule,
  HttpErrorResponse,
} from "@angular/common/http";
import { environment } from "../../../../../environments/environment";

@Component({
  selector: "app-signin-form",
  imports: [
    CommonModule,
    LabelComponent,
    CheckboxComponent,
    ButtonComponent,
    InputFieldComponent,
    RouterModule,
    FormsModule,
    HttpClientModule,
  ],
  templateUrl: "./signin-form.component.html",
  styles: ``,
})
export class SigninFormComponent {
  showPassword = false;
  isChecked = false;

  email = "";
  password = "";

  loading = false;
  error: string | null = null;

  private readonly loginUrl = `${environment.apiBaseUrl}/users/login`;

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSignIn() {
    if (!this.email || !this.password) {
      this.error = "Please provide both email and password.";
      return;
    }

    this.loading = true;
    this.error = null;

    this.http
      .post<{ token?: string; message?: string }>(this.loginUrl, {
        email: this.email,
        password: this.password,
      })
      .subscribe({
        next: (res) => {
          const token = res && (res.token as string | undefined);
          if (token) {
            localStorage.setItem("token", token);
            this.router.navigateByUrl("/");
          } else {
            this.error =
              res.message || "Login successful but no token returned.";
          }
          this.loading = false;
        },
        error: (err: HttpErrorResponse) => {
          if (err.status === 0) {
            this.error = "Cannot reach authentication server.";
          } else if (err.status === 400 || err.status === 401) {
            this.error = err.error?.message || "Invalid email or password.";
          } else {
            this.error = err.error?.message || "An unexpected error occurred.";
          }
          console.error("Sign-in error", err);
          this.loading = false;
        },
      });
  }
}
