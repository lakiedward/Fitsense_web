import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Get the auth token from localStorage
  const authToken = localStorage.getItem('authToken');
  const tokenType = localStorage.getItem('tokenType') || 'Bearer';

  console.log('=== FUNCTIONAL AUTH INTERCEPTOR DEBUG ===');
  console.log('Request URL:', req.url);
  console.log('Request Method:', req.method);
  console.log('Auth token exists:', !!authToken);
  console.log('Token type:', tokenType);
  console.log('Token length:', authToken?.length);
  console.log('Token preview:', authToken?.substring(0, 20) + '...');
  console.log('Is logged in:', localStorage.getItem('isLoggedIn'));

  // Clone the request and add the authorization header if token exists
  if (authToken) {
    const authorizationHeader = `${tokenType} ${authToken}`;
    const authReq = req.clone({
      headers: req.headers.set('Authorization', authorizationHeader)
    });
    
    console.log('FUNCTIONAL AUTH - Authorization header added:', authorizationHeader);
    console.log('FUNCTIONAL AUTH - All request headers:', authReq.headers.keys());
    console.log('FUNCTIONAL AUTH - Authorization header value:', authReq.headers.get('Authorization'));
    console.log('=== END FUNCTIONAL AUTH INTERCEPTOR DEBUG ===');
    
    return next(authReq);
  }

  console.log('FUNCTIONAL AUTH - No token found, proceeding without auth');
  console.log('=== END FUNCTIONAL AUTH INTERCEPTOR DEBUG ===');
  // If no token, proceed with the original request
  return next(req);
};
