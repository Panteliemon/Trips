import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-page404',
  templateUrl: './page404.component.html',
  styleUrls: ['./page404.component.css']
})
export class Page404Component implements OnInit {
  requestedUrl: string;

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.requestedUrl = this.router.url;
  }

}
