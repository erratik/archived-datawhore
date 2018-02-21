
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { RouterModule, Routes } from '@angular/router';
import { MomentModule } from 'angular2-moment';
import { AppComponent } from './app.component';
import { SpaceAdminRoutingModule, routingComponents } from './space-admin/space-admin.routing';

// MOVE THESE MODULES
// import { LineChartComponent } from './shared/ui/charts/line-chart/line-chart.component';
// import { PieChartAdvancedComponent } from './shared/ui/charts/pie-chart--advanced/pie-chart--advanced.component';
// import { StackedBarHorizontalComponent } from './shared/ui/charts/stacked-bar-horizontal/stacked-bar-horizontal.component';
// import { DonutChartComponent } from './shared/ui/charts/donut-chart/donut-chart.component';
// import { BaseChartComponent } from './shared/ui/charts/base-chart/base-chart.component'

// import { DropCloudComponent } from './views/cloud/drop-cloud/drop-cloud.component';
// import { CloudComponent } from './views/cloud/cloud/cloud.component';
// import { DayViewerComponent } from './views/cloud/day-viewer/day-viewer.component';
// import { MapComponent } from './views/cloud/map/map.component';
// import { SegmentComponent } from './views/cloud/segment/segment.component';
// import { SimpleMessageComponent } from './shared/ui/messages/simple-message/simple-message.component';

import { HeaderComponent } from './shared/ui/wrapper/header/header.component';
import { ContainerComponent } from './shared/ui/wrapper/container/container.component';
import { FooterComponent } from './shared/ui/wrapper/footer/footer.component';

import { DropsComponent } from './shared/component/drops/drops/drops.component';
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
import { EnumToArrayPipe } from './shared/pipes/enum-to-array.pipe';
import { InTimeframePipe } from './shared/pipes/in-timeframe.pipe';

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
    ImageFigureComponent,
    DropImageComponent,
    SpaceIconComponent,
    InTimeframePipe
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
