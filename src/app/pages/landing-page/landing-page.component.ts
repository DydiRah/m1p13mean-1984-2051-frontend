import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterModule], // 👈 IMPORTANT  
  templateUrl: 'landing-page.component.html'
})
export class LandingPageComponent {

  currentYear: number = new Date().getFullYear();

  constructor() {}

}