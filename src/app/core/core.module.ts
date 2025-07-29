import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { httpInterceptorProviders } from './http-interceptors';

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule
  ],
  providers: [
    httpInterceptorProviders
  ],
  exports: [
    HttpClientModule
  ]
})
export class CoreModule { }
