import { NgModule } from '@angular/core';

import {
  FaIconLibrary,
  FontAwesomeModule,
} from '@fortawesome/angular-fontawesome';

import {
  faFiles as faFilesLight,
  faChartColumn as faChartColumnLight,
  faCrystalBall as faCrystalBallLight,
  faBookSparkles as faBookSparklesLight,
  faFolderArrowUp as faFolderArrowUpLight,
} from '@fortawesome/pro-light-svg-icons';

import {
  faBars as faBarsSolid,
  faGear as faGearSolid,
  faFiles as faFilesSolid,
  faChartColumn as faChartColumnSolid,
  faCrystalBall as faCrystalBallSolid,
  faBookSparkles as faBookSparklesSolid,
  faFolderArrowUp as faFolderArrowUpSolid,
} from '@fortawesome/pro-solid-svg-icons';
import { faGoogle as faGoogleBrands } from '@fortawesome/free-brands-svg-icons';
import { faGripLines as faGripLinesThin } from '@fortawesome/pro-thin-svg-icons';
import { faArrowRight as faArrowRightSolid } from '@fortawesome/free-solid-svg-icons';
import { faHouseTree as faHouseTreeRegular } from '@fortawesome/pro-regular-svg-icons';
import { faDrumstick as faDrumstickSharpSolid } from '@fortawesome/sharp-solid-svg-icons';
import { faBookOpenCover as faBookOpenCoverDuotone } from '@fortawesome/pro-duotone-svg-icons';
import { faWhatsappSquare as faWhatsappSquareBrands } from '@fortawesome/free-brands-svg-icons';

@NgModule({
  imports: [FontAwesomeModule],
  exports: [FontAwesomeModule],
})
export class Fontawesome {
  constructor(private library: FaIconLibrary) {
    library?.addIcons(
      faBarsSolid,
      faGearSolid,
      faFilesLight,
      faFilesSolid,
      faGoogleBrands,
      faGripLinesThin,
      faArrowRightSolid,
      faCrystalBallSolid,
      faCrystalBallLight,
      faChartColumnLight,
      faChartColumnSolid,
      faHouseTreeRegular,
      faBookSparklesSolid,
      faBookSparklesLight,
      faFolderArrowUpLight,
      faFolderArrowUpSolid,
      faDrumstickSharpSolid,
      faBookOpenCoverDuotone,
      faWhatsappSquareBrands
    );
  }
}
