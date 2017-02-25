import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';
import {RouterModule, Routes} from '@angular/router';
import {MomentModule} from 'angular2-moment';

import {FileSelectDirective, FileDropDirective} from 'ng2-file-upload';

import {SpacesService} from './services/spaces.service';
import {OauthSettingsService} from './services/space/oauth-settings.service';

import {AppComponent} from './app.component';
import {HeaderComponent} from './wrapper/header/header.component';
import {ContainerComponent} from './wrapper/container/container.component';
import {FooterComponent} from './wrapper/footer/footer.component';

import {SettingsViewComponent} from './views/settings/settings.component';
import {AddSpaceComponent} from './views/spaces/edit-spaces/add-space/add-space.component';
import {EditSpacesComponent} from './views/spaces/edit-spaces/edit-spaces.component';

import {ValuesPipePipe} from './shared/pipes/values-pipe.pipe';
import {ConnectCallbackComponent} from './views/connect-callback/connect-callback.component';
import {SpaceViewComponent} from './views/spaces/view-space/view-space.component';
import {SpaceConfigComponent} from './shared/component/space-config/space-config.component';

const appRoutes: Routes = [
    {
        path: '',
        redirectTo: 'spaces',
        pathMatch: 'full'
    },
    {
        path: 'spaces', component: EditSpacesComponent
    },
    {
        path: 'space/:space', component: SpaceViewComponent
    },
    {
        path: 'oauth/connect/:space/', component: ConnectCallbackComponent
    },
    {
        path: 'connect/:space/callback', component: ConnectCallbackComponent
    },
    {
        path: 'settings', component: SettingsViewComponent
    },
];

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        HttpModule,
        MomentModule,
        // NgSemanticModule,
        RouterModule.forRoot(appRoutes)
    ],
    declarations: [
        AppComponent,
        HeaderComponent,
        ContainerComponent,
        FooterComponent,
        SettingsViewComponent,
        FileSelectDirective,
        AddSpaceComponent,
        AddSpaceComponent,
        EditSpacesComponent,
        ValuesPipePipe,
        ConnectCallbackComponent,
        SpaceViewComponent,
        SpaceConfigComponent
    ],
    providers: [SpacesService, OauthSettingsService],
    bootstrap: [AppComponent]
})
export class AppModule {
}
