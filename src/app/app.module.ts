import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule, Routes } from '@angular/router';
import { PostsService } from './services/posts.service';
import { SpacesService } from './services/spaces.service';

// import { NgSemanticModule } from "ng-semantic";

import { AppComponent } from './app.component';
import { HeaderComponent } from './wrapper/header/header.component';
import { ContainerComponent } from './wrapper/container/container.component';
import { FooterComponent } from './wrapper/footer/footer.component';

import { SettingsViewComponent } from './views/settings/settings.component';
import { ConfigsViewComponent } from './views/configs/configs.component';
import { AddSpaceComponent } from './content/spaces/add-space/add-space.component';
import { EditSpacesComponent } from './content/spaces/edit-spaces/edit-spaces.component';

import { PostsComponent } from './content/posts/posts.component';
import { ValuesPipePipe } from './shared/pipes/values-pipe.pipe';

const appRoutes: Routes = [
  {
    path: '',
    redirectTo: 'configs',
    pathMatch: 'full'
  },
  { path: 'configs', component: ConfigsViewComponent },
  { path: 'settings', component: SettingsViewComponent },
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
    PostsComponent,
    AddSpaceComponent,
    AddSpaceComponent,
    EditSpacesComponent,
    ValuesPipePipe
  ],
  providers: [PostsService, SpacesService],
  bootstrap: [AppComponent]
})
export class AppModule { }
