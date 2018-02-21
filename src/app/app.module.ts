
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { SpaceAdminRoutingModule, routingComponents } from './space-admin/space-admin.routing';

// MOVE THIS MODULES
// import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
// import { FormsModule } from '@angular/forms';
// import { Logger } from './shared/ui/ng2-threejs/src/common/log.service';

import { MomentModule } from 'angular2-moment';
// import * as _ from 'lodash';

// import { FileSelectDirective, FileDropDirective } from 'ng2-file-upload';
// import { NgxChartsModule } from '@swimlane/ngx-charts';
// import { ChartsModule } from 'ng2-charts';
// import { ColorPickerModule } from 'ngx-color-picker';
// import { NgDatepickerModule } from 'ng2-datepicker';

// import { ThreeJSComponentsModule } from './shared/ui/ng2-threejs/src';

// import { SpacesService } from './shared/services/spaces.service';
// import { ProfileService } from './shared/services/profile.service';
// import { SpaceItemService } from './shared/services/space-item.service';
// import { RainService } from './shared/services/rain.service';
// import { StoryService } from './shared/services/story.service';

// import { HeaderComponent } from './wrapper/header/header.component';
// import { ContainerComponent } from './wrapper/container/container.component';
// import { FooterComponent } from './wrapper/footer/footer.component';


// import { SpaceConfigComponent } from './shared/component/space-config/space-config.component';
// import { DimensionListComponent } from './shared/component/dimensions/dimensions-list/dimensions-list.component';
// import { DimensionFormComponent } from './shared/component/dimensions/dimensions-form/dimensions-form.component';
// import { SpaceItemComponent } from './shared/component/space-item/space-item.component';

// import { SchemaValuePipe } from './shared/pipes/schema-value.pipe';
// import { ValuesPipe } from './shared/pipes/values-pipe.pipe';
// import { OrderByPipe } from './shared/pipes/order-by.pipe';
// import { PopulateMatchesPipe } from './shared/pipes/populate-matches.pipe';
// import { KeyPipe } from './shared/pipes/key-pipe.pipe';
// import { OrderDropByPipe } from './shared/pipes/order-drop-by.pipe';
// import { SegmentFilterPipe } from './shared/pipes/segment-filter.pipe';
// import { RenderJsonPipe } from './shared/pipes/render-json.pipe';



// import { ImageFigureComponent } from './shared/directives/image-figure/image-figure.component';
// import { DropImageComponent } from './shared/directives/drop-image/drop-image.component';
// import { SpaceIconComponent } from './shared/directives/space-icon/space-icon.component';
// import { LineChartComponent } from './shared/ui/charts/line-chart/line-chart.component';
// import { PieChartAdvancedComponent } from './shared/ui/charts/pie-chart--advanced/pie-chart--advanced.component';
// import { StackedBarHorizontalComponent } from './shared/ui/charts/stacked-bar-horizontal/stacked-bar-horizontal.component';
// import { DonutChartComponent } from './shared/ui/charts/donut-chart/donut-chart.component';
// import { BaseChartComponent } from './shared/ui/charts/base-chart/base-chart.component';

// import { ColorPickerComponent } from './shared/ui/tools/color-picker/color-picker.component';
// import { DatePickerComponent } from './shared/ui/tools/date-picker/date-picker.component';

// import { RainFormComponent } from './views/rain/rain-form/rain-form.component';
// import { SettingsViewComponent } from './views/settings/settings.component';

// import { AddSpaceComponent } from './views/spaces/add-space/add-space.component';
// import { SpaceViewComponent } from './views/spaces/view-space/view-space.component';
// import { ProfileFormComponent } from './views/profile/profile-form/profile-form.component';
// import { RainConfigsComponent } from './views/rain/rain-configs/rain-configs/rain-configs.component';
// import { DropAtomicComponent } from './views/drops/drop-atomic/drop-atomic.component';
// import { ProfileConfigComponent } from './views/profile/profile-config/profile-config.component';
// import { DropsComponent } from './views/drops/drops/drops.component';
// import { DropCloudComponent } from './views/cloud/drop-cloud/drop-cloud.component';
// import { CloudComponent } from './views/cloud/cloud/cloud.component';
// import { DayViewerComponent } from './views/cloud/day-viewer/day-viewer.component';
// import { MapComponent } from './views/cloud/map/map.component';
// import { InTimeframePipe } from './shared/pipes/in-timeframe.pipe';
// import { SegmentComponent } from './views/cloud/segment/segment.component';
// import { SimpleMessageComponent } from './shared/ui/messages/simple-message/simple-message.component';

// import { SpaceAdminModule } from './space-admin/space-admin.module';

import { HeaderComponent } from './shared/ui/wrapper/header/header.component';
import { ContainerComponent } from './shared/ui/wrapper/container/container.component';
import { FooterComponent } from './shared/ui/wrapper/footer/footer.component';

import { DropsComponent } from './shared/component/drops/drops/drops.component';
import { SpaceItemComponent } from './shared/component/space-item/space-item.component';
import { DropAtomicComponent } from './shared/component/drops/drop-atomic/drop-atomic.component';
import { ImageFigureComponent } from './shared/directives/image-figure/image-figure.component';
import { DropImageComponent } from './shared/directives/drop-image/drop-image.component';
import { SpaceIconComponent } from './shared/directives/space-icon/space-icon.component';

import { SchemaValuePipe } from './shared/pipes/schema-value.pipe';
import { ValuesPipe } from './shared/pipes/values-pipe.pipe';
import { OrderByPipe } from './shared/pipes/order-by.pipe';
import { PopulateMatchesPipe } from './shared/pipes/populate-matches.pipe';
import { KeyPipe } from './shared/pipes/key-pipe.pipe';
import { OrderDropByPipe } from './shared/pipes/order-drop-by.pipe';

import { Logger } from './shared/services/common';
import { SpacesService } from './shared/services/spaces.service';
import { ProfileService } from './shared/services/profile.service';
import { SpaceItemService } from './shared/services/space-item.service';
import { RainService } from './shared/services/rain.service';


@NgModule({
  imports: [BrowserModule, SpaceAdminRoutingModule, MomentModule],
  declarations: [
    routingComponents,
    HeaderComponent,
    ContainerComponent,
    FooterComponent,
    AppComponent,
    DropsComponent,
    DropAtomicComponent,
    SpaceItemComponent,
    ImageFigureComponent,
    DropImageComponent,
    SpaceIconComponent,
    SchemaValuePipe,
    OrderByPipe,
    PopulateMatchesPipe,
    ValuesPipe,
    KeyPipe,
    OrderDropByPipe
  ],
  providers: [
    Logger,
    SpacesService,
    ProfileService,
    SpaceItemService,
    RainService

  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
