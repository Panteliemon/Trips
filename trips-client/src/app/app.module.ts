import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NewsMainComponent } from './components/news/news-main/news-main.component';
import { PlacesMainComponent } from './components/places/places-main/places-main.component';
import { RegionsMainComponent } from './components/regions/regions-main/regions-main.component';
import { TripsMainComponent } from './components/trips/trips-main/trips-main.component';
import { UsersMainComponent } from './components/users/users-main/users-main.component';
import { VehiclesMainComponent } from './components/vehicles/vehicles-main/vehicles-main.component';
import { UserDetailsComponent } from './components/users/user-details/user-details.component';
import { MessageBoxComponent } from './components/common/message-box/message-box.component';
import { LoginFormComponent } from './components/common/login-form/login-form.component';
import { Page404Component } from './components/common/page404/page404.component';
import { UserCreateComponent } from './components/users/user-create/user-create.component';
import { LoaderComponent } from './components/common/loader/loader.component';
import { AuthInterceptor } from './services/auth.interceptor';
import { LoginPageComponent } from './components/common/login-page/login-page.component';

@NgModule({
  declarations: [
    AppComponent,
    NewsMainComponent,
    PlacesMainComponent,
    RegionsMainComponent,
    TripsMainComponent,
    UsersMainComponent,
    VehiclesMainComponent,
    UserDetailsComponent,
    MessageBoxComponent,
    LoginFormComponent,
    Page404Component,
    UserCreateComponent,
    LoaderComponent,
    LoginPageComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    HttpClientModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
