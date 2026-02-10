import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavBar } from "./nav-bar/nav-bar";
import { ScrollToTop } from "./shared/scroll-to-top/scroll-to-top";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavBar, ScrollToTop],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('proyecto-simpsons');
}
