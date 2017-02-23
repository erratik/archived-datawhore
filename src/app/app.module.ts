import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule, Routes } from '@angular/router';

import { FileSelectDirective, FileDropDirective } from 'ng2-file-upload';

import { SpacesService } from './services/spaces.service';

import { AppComponent } from './app.component';
import { HeaderComponent } from './wrapper/header/header.component';
import { ContainerComponent } from './wrapper/container/container.component';
import { FooterComponent } from './wrapper/footer/footer.component';

import { SettingsViewComponent } from './views/settings/settings.component';
import { ConfigsViewComponent } from './views/configs/configs.component';
import { AddSpaceComponent } from './content/spaces/edit-spaces/add-space/add-space.component';
import { EditSpacesComponent } from './content/spaces/edit-spaces/edit-spaces.component';

import { ValuesPipePipe } from './shared/pipes/values-pipe.pipe';
import { ConnectCallbackComponent } from './views/connect-callback/connect-callback.component';
import { EditSpaceComponent } from './content/spaces/edit-spaces/space/space.component';

const appRoutes: Routes = [
  {
    path: '',
    redirectTo: 'configs',
    pathMatch: 'full'
  },
  {
    path: 'configs',
    component: ConfigsViewComponent
  },
  {
    path: 'oauth/connect/:space/',
    component: ConnectCallbackComponent
  },
  {
    path: 'connect/:space/callback',
    component: ConnectCallbackComponent
  },
  {
    path: 'settings',
    component: SettingsViewComponent
  },
];


@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    // NgSemanticModule,
    RouterModule.forRoot(appRoutes)
  ],
  declarations: [
    AppComponent,
    HeaderComponent,
    ContainerComponent,
    FooterComponent,
    SettingsViewComponent,
    ConfigsViewComponent,
    FileSelectDirective,
    AddSpaceComponent,
    AddSpaceComponent,
    EditSpacesComponent,
    ValuesPipePipe,
    ConnectCallbackComponent,
    EditSpaceComponent
  ],
  providers: [SpacesService],
  bootstrap: [AppComponent]
})
export class AppModule { }
