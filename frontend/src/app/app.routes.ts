import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Characters } from './characters/characters';
import { Episodes } from './episodes/episodes';
import { Locations } from './locations/locations';
import { SignUp } from './sign-up/sign-up';
import { Admin } from './admin/admin';

export const routes: Routes = [
    {
        path: '',
        component: Home
    },
    {
        path: 'home',
        component: Home
    },
    {
        path: 'characters',
        component: Characters
    },
    {
        path: 'episodes',
        component: Episodes
    },
    {
        path: 'locations',
        component: Locations
    },
    {
        path: 'sign-up',
        component: SignUp
    },
    {
        path: 'admin',
        component: Admin
    }
];
