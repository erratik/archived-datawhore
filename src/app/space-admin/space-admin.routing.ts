import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SpaceAdminModule } from './space-admin.module';

import { EditSpacesComponent } from '../space-admin/views/spaces/edit-spaces/edit-spaces.component';
import { SpaceViewComponent } from '../space-admin/views/spaces/view-space/view-space.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'spaces' },
  { path: 'spaces', component: EditSpacesComponent },
  { path: 'space/:space', component: SpaceViewComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule, SpaceAdminModule],
})
export class SpaceAdminRoutingModule { }


export const routingComponents = [
  EditSpacesComponent,
  SpaceViewComponent
];
// const appRoutes: Routes = [
//   {
//       path: 'login', component: EditSpacesComponent
//   },
//   {
//       path: 'cloud', component: DayViewerComponent
//   },
//   {
//       path: 'settings', component: SettingsViewComponent
//   },
//   {
//       path: 'threejs', component: MapComponent
//   },
// ];
