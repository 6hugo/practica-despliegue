import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

    // Detectamos si la petición va a la API externa de los Simpsons
    const isExternalApi = req.url.includes('thesimpsonsapi.com');

    // Si tenemos token y NO es una petición externa, añadimos el token
    if (token && !isExternalApi) {
        console.log('Interceptor: Enviando token a:', req.url);
        
        const authReq = req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });
        return next(authReq); 
    } 

    return next(req);
};
