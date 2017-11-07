
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule, Routes } from '@angular/router';
import { MomentModule } from 'angular2-moment';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { ChartsModule } from 'ng2-charts';
import { ColorPickerModule } from 'ngx-color-picker';
import * as _ from 'lodash';

import { FileSelectDirective, FileDropDirective } from 'ng2-file-upload';

import { SpacesService } from './services/spaces.service';
import { OauthSettingsService } from './services/space/oauth-settings.service';
import { ProfileService } from './services/profile/profile.service';
import { SpaceItemService } from './shared/services/space-item/space-item.service';
import { RainService } from './services/rain/rain.service';

import { AppComponent } from './app.component';
import { HeaderComponent } from './wrapper/header/header.component';
import { ContainerComponent } from './wrapper/container/container.component';
import { FooterComponent } from './wrapper/footer/footer.component';

import { SettingsViewComponent } from './views/settings/settings.component';
import { EditSpacesComponent } from './views/spaces/edit-spaces/edit-spaces.component';

import { ValuesPipe } from './shared/pipes/values-pipe.pipe';
import { SpaceViewComponent } from './views/spaces/view-space/view-space.component';
import { SpaceConfigComponent } from './shared/component/space-config/space-config.component';
import { DimensionListComponent } from './shared/component/dimensions/dimensions-list/dimensions-list.component';
import { DimensionFormComponent } from './shared/component/dimensions/dimensions-form/dimensions-form.component';
import { SpaceItemComponent } from './shared/component/space-item/space-item.component';
import { SchemaValuePipe } from './shared/pipes/schema-value.pipe';
import { ProfileFormComponent } from './views/profile/profile-form/profile-form.component';
import { OrderByPipe } from './shared/pipes/order-by.pipe';
import { AddSpaceComponent } from './views/spaces/add-space/add-space.component';
import { PopulateMatchesPipe } from './shared/pipes/populate-matches.pipe';
import { RainFormComponent } from './views/rain/rain-form/rain-form.component';
import { RainConfigsComponent } from './views/rain/rain-configs/rain-configs/rain-configs.component';
import { DropsComponent } from './views/drops/drops/drops.component';
import { DropAtomicComponent } from './views/drops/drop-atomic/drop-atomic.component';
import { KeyPipe } from './shared/pipes/key-pipe.pipe';
import { OrderDropByPipe } from './shared/pipes/order-drop-by.pipe';
import { ImageFigureComponent } from './shared/directives/image-figure/image-figure.component';
import { ProfileConfigComponent } from './views/profile/profile-config/profile-config.component';
import { DropImageComponent } from './shared/directives/drop-image/drop-image.component';
import { CloudComponent } from './views/cloud/cloud/cloud.component';
import { DropCloudComponent } from './views/cloud/drop-cloud/drop-cloud.component';
import { SpaceIconComponent } from './shared/directives/space-icon/space-icon.component';
import { LineChartComponent } from './shared/ui/charts/line-chart/line-chart.component';
import { PieChartAdvancedComponent } from './shared/ui/charts/pie-chart--advanced/pie-chart--advanced.component';
import { DonutChartComponent } from './shared/ui/charts/donut-chart/donut-chart.component';
import { BaseChartComponent } from './shared/ui/charts/base-chart/base-chart.component';
import { ColorPickerComponent } from './shared/ui/tools/color-picker/color-picker.component';
import { DayViewerComponent } from './views/cloud/day-viewer/day-viewer.component';

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
        path: 'cloud', component: CloudComponent
    },
    {
        path: 'cloud/viewer', component: DayViewerComponent
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
        BrowserAnimationsModule,
        NgxChartsModule,
        ChartsModule,
        ColorPickerModule,
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
        SpaceViewComponent,
        SpaceConfigComponent,
        DimensionListComponent,
        DimensionFormComponent,
        SpaceItemComponent,
        SchemaValuePipe,
        ProfileFormComponent,
        OrderByPipe,
        AddSpaceComponent,
        PopulateMatchesPipe,
        RainFormComponent,
        RainConfigsComponent,
        DropsComponent,
        DropAtomicComponent,
        ValuesPipe,
        KeyPipe,
        OrderDropByPipe,
        ImageFigureComponent,
        ProfileConfigComponent,
        DropImageComponent,
        CloudComponent,
        DropCloudComponent,
        SpaceIconComponent,
        LineChartComponent,
        PieChartAdvancedComponent,
        DonutChartComponent,
        BaseChartComponent,
        ColorPickerComponent,
        DayViewerComponent
    ],
    providers: [
        SpacesService,
        OauthSettingsService,
        SpaceItemService,
        ProfileService,
        RainService,
        SchemaValuePipe
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
