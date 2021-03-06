import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NewsMainComponent } from './components/news/news-main/news-main.component';
import { TripsMainComponent } from './components/trips/trips-main/trips-main.component';
import { PlacesMainComponent } from './components/places/places-main/places-main.component';
import { PlaceDetailsComponent } from './components/places/place-details/place-details.component';
import { RegionsMainComponent } from './components/regions/regions-main/regions-main.component';
import { VehiclesMainComponent } from './components/vehicles/vehicles-main/vehicles-main.component';
import { UsersMainComponent } from './components/users/users-main/users-main.component';
import { UserDetailsComponent } from './components/users/user-details/user-details.component';
import { Page404Component } from './components/common/page404/page404.component';
import { UserCreateComponent } from './components/users/user-create/user-create.component';
import { LoginPageComponent } from './components/common/login-page/login-page.component';
import { ServiceComponent } from './components/service/service.component';
import { TripDetailsComponent } from './components/trips/trip-details/trip-details.component';
import { VehicleDetailsComponent } from './components/vehicles/vehicle-details/vehicle-details.component';

import { AuthGuard } from './services/auth.guard';
import { PlacesMapComponent } from './components/places/places-map/places-map.component';
import { PlacesStatsComponent } from './components/places/places-stats/places-stats.component';

const routes: Routes = [
  { path: "news", component: NewsMainComponent },
  { path: "trips", component: TripsMainComponent, canActivate: [AuthGuard] },
  { path: "trip/:id", component: TripDetailsComponent, canActivate: [AuthGuard] },
  { path: "places", canActivate: [AuthGuard],
    children: [
      { path: "list", component: PlacesMainComponent },
      { path: "map", component: PlacesMapComponent },
      { path: "stats", component: PlacesStatsComponent },
      { path: "", redirectTo: "list", pathMatch: "full"},
      { path: "**", component: Page404Component }
    ] },
  { path: "place/:id", component: PlaceDetailsComponent, canActivate: [AuthGuard] },
  { path: "regions", component: RegionsMainComponent, canActivate: [AuthGuard] },
  { path: "vehicles", component: VehiclesMainComponent, canActivate: [AuthGuard] },
  { path: "vehicle/:id", component: VehicleDetailsComponent, canActivate: [AuthGuard] },
  { path: "users", component: UsersMainComponent, canActivate: [AuthGuard] },
  { path: "users/create", component: UserCreateComponent, canActivate: [AuthGuard] },
  { path: "user/:id", component: UserDetailsComponent, canActivate: [AuthGuard] },
  { path: "service", component: ServiceComponent, canActivate: [AuthGuard] },
  { path: "login", component: LoginPageComponent },
  { path: "", redirectTo: "/news", pathMatch: "full" },
  { path: "**", component: Page404Component }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
