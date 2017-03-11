import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';
import {RouterModule, Routes} from '@angular/router';
import {MomentModule} from 'angular2-moment';

import {FileSelectDirective, FileDropDirective} from 'ng2-file-upload';

import {SpacesService} from './services/spaces.service';
import {OauthSettingsService} from './services/space/oauth-settings.service';
import {ProfileService} from './services/profile/profile.service';
import {SpaceItemService} from './shared/services/space-item/space-item.service';

import {AppComponent} from './app.component';
import {HeaderComponent} from './wrapper/header/header.component';
import {ContainerComponent} from './wrapper/container/container.component';
import {FooterComponent} from './wrapper/footer/footer.component';

import {SettingsViewComponent} from './views/settings/settings.component';
import {EditSpacesComponent} from './views/spaces/edit-spaces/edit-spaces.component';

import {ValuesPipePipe} from './shared/pipes/values-pipe.pipe';
import {SpaceViewComponent} from './views/spaces/view-space/view-space.component';
import {SpaceConfigComponent} from './shared/component/space-config/space-config.component';
import {DimensionListComponent} from './shared/component/dimensions/dimensions-list/dimensions-list.component';
import {DimensionFormComponent} from './shared/component/dimensions/dimensions-form/dimensions-form.component';
import {SpaceItemComponent} from './shared/component/space-item/space-item.component';
import {SchemaValuePipe} from './shared/pipes/schema-value.pipe';
import {ProfileFormComponent} from './views/profile/profile-form/profile-form.component';
import { OrderByPipe } from './shared/pipes/order-by.pipe';
import { AddSpaceComponent } from './views/spaces/add-space/add-space.component';
import { PopulateMatchesPipe } from './shared/pipes/populate-matches.pipe';

const appRoutes: Routes = [
    {
        path: '',
        redirectTo: 'spaces',
        pathMatch: 'full'
    },
    {
        path: 'login', component: EditSpacesComponent
    },
    {
        path: 'spaces', component: EditSpacesComponent
    },
    {
        path: 'space/:space', component: SpaceViewComponent
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
        EditSpacesComponent,
        ValuesPipePipe,
        SpaceViewComponent,
        SpaceConfigComponent,
        DimensionListComponent,
        DimensionFormComponent,
        SpaceItemComponent,
        SchemaValuePipe,
        ProfileFormComponent,
        OrderByPipe,
        AddSpaceComponent,
        PopulateMatchesPipe
    ],
    providers: [SpacesService, OauthSettingsService, SpaceItemService, ProfileService, SchemaValuePipe],
    bootstrap: [AppComponent]
})
export class AppModule {
}
