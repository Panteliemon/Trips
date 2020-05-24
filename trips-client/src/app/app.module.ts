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
import { GalleryComponent } from './components/common/gallery/gallery.component';
import { PlaceDetailsComponent } from './components/places/place-details/place-details.component';
import { AdaptiveDatePipe } from './services/adaptive-date.pipe';
import { UserLinkComponent } from './components/common/user-link/user-link.component';
import { SelectorEngineComponent } from './components/common/selectors/selector-engine/selector-engine.component';
import { PlaceKindSelectorComponent } from './components/common/selectors/place-kind-selector/place-kind-selector.component';
import { PlaceAccessibilitySelectorComponent } from './components/common/selectors/place-accessibility-selector/place-accessibility-selector.component';
import { PlacePopularitySelectorComponent } from './components/common/selectors/place-popularity-selector/place-popularity-selector.component';
import { PlaceCapacitySelectorComponent } from './components/common/selectors/place-capacity-selector/place-capacity-selector.component';
import { FromGalleryPickerComponent } from './components/common/selectors/from-gallery-picker/from-gallery-picker.component';
import { PlacesOrderingSelectorComponent } from './components/common/selectors/places-ordering-selector/places-ordering-selector.component';
import { CheckboxComponent } from './components/common/checkbox/checkbox.component';
import { MultiSelectorEngineComponent } from './components/common/selectors/multi-selector-engine/multi-selector-engine.component';
import { PlaceKindMultiSelectorComponent } from './components/common/selectors/place-kind-multi-selector/place-kind-multi-selector.component';
import { ExpanderComponent } from './components/common/expander/expander.component';

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
    LoginPageComponent,
    GalleryComponent,
    PlaceDetailsComponent,
    AdaptiveDatePipe,
    UserLinkComponent,
    SelectorEngineComponent,
    PlaceKindSelectorComponent,
    PlaceAccessibilitySelectorComponent,
    PlacePopularitySelectorComponent,
    PlaceCapacitySelectorComponent,
    FromGalleryPickerComponent,
    PlacesOrderingSelectorComponent,
    CheckboxComponent,
    MultiSelectorEngineComponent,
    PlaceKindMultiSelectorComponent,
    ExpanderComponent
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
