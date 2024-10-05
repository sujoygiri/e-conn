import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  let authService = inject(AuthService);
  let router = inject(Router);
  authService.verifyUser().subscribe({
    next: (response) => {
      if (response.status === "success" && response.statusCode === 200) {
        router.navigateByUrl("/");
        return false;
      } else {
        return true;
      }
    },
    error: (err) => {
      return true;
    }
  });
  return true;
};
