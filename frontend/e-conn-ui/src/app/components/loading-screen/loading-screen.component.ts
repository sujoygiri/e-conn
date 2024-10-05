import { NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-loading-screen',
  standalone: true,
  imports: [NgOptimizedImage],
  templateUrl: './loading-screen.component.html',
  styleUrl: './loading-screen.component.scss'
})
export class LoadingScreenComponent {

}
