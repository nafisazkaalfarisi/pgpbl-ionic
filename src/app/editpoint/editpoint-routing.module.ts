import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EditpointPage } from './editpoint.page';

const routes: Routes = [
  {
    path: ':key',   // wajib ada parameter key
    component: EditpointPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EditpointPageRoutingModule {}
