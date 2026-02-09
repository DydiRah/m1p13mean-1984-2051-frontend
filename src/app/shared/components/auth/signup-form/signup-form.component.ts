import { Component, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { LabelComponent } from "../../form/label/label.component";
import { CheckboxComponent } from "../../form/input/checkbox.component";
import { InputFieldComponent } from "../../form/input/input-field.component";
import { FileInputComponent } from "../../form/input/file-input.component";
import { Router, RouterModule } from "@angular/router";
import { FormsModule } from "@angular/forms";
import {
  HttpClient,
  HttpClientModule,
  HttpErrorResponse,
} from "@angular/common/http";
import { environment } from "../../../../../environments/environment";

@Component({
  selector: "app-signup-form",
  imports: [
    CommonModule,
    LabelComponent,
    CheckboxComponent,
    InputFieldComponent,
    FileInputComponent,
    RouterModule,
    FormsModule,
    HttpClientModule,
  ],
  templateUrl: "./signup-form.component.html",
  styles: ``,
})
export class SignupFormComponent implements OnDestroy {
  showPassword = false;
  isChecked = false;

  fname = "";
  lname = "";
  email = "";
  password = "";
  confirmPassword = "";
  phone = "";
  role: "buyer" | "store" = "buyer";

  selectedFile?: File;
  previewUrl?: string | null = null;

  loading = false;
  error: string | null = null;

  private readonly registerUrl = `${environment.apiBaseUrl}/users/register`;

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      // revoke previous preview
      if (this.previewUrl) {
        URL.revokeObjectURL(this.previewUrl);
      }
      this.selectedFile = input.files[0];
      this.previewUrl = URL.createObjectURL(this.selectedFile);
    } else {
      if (this.previewUrl) {
        URL.revokeObjectURL(this.previewUrl);
      }
      this.selectedFile = undefined;
      this.previewUrl = null;
    }
  }

  onSignUp() {
    this.error = null;

    if (
      !this.fname ||
      !this.lname ||
      !this.email ||
      !this.password ||
      !this.confirmPassword ||
      !this.phone ||
      !this.role
    ) {
      this.error = "Please fill all required fields.";
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.error = "Passwords do not match.";
      return;
    }

    const form = new FormData();
    form.append("email", this.email);
    form.append("password", this.password);
    form.append("confirm_password", this.confirmPassword);
    form.append("first_name", this.fname);
    form.append("last_name", this.lname);
    form.append("phone", this.phone);
    form.append("role", this.role);

    if (this.selectedFile) {
      form.append("pdp", this.selectedFile, this.selectedFile.name);
    }

    this.loading = true;

    this.http.post<{ message?: string }>(this.registerUrl, form).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigateByUrl("/signin");
      },
      error: (err: HttpErrorResponse) => {
        this.loading = false;
        if (err.status === 0) {
          this.error = "Cannot reach server.";
        } else {
          this.error = err.error?.message || "Registration failed.";
        }
        console.error("Signup error", err);
      },
    });
  }

  ngOnDestroy(): void {
    if (this.previewUrl) {
      URL.revokeObjectURL(this.previewUrl);
    }
  }
}
