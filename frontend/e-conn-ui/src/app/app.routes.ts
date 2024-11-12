import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { SignupComponent } from './components/signup/signup.component';
import { SigninComponent } from './components/signin/signin.component';

export const routes: Routes = [
    { path: "", component: HomeComponent },
    { path: "signup", component: SignupComponent },
    { path: "signin", component: SigninComponent },
    { path: "**", redirectTo: "/", pathMatch: "full" },
];
