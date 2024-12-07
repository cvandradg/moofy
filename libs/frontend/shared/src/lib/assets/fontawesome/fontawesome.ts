import { NgModule } from '@angular/core';

import {
  FaIconLibrary,
  FontAwesomeModule,
} from '@fortawesome/angular-fontawesome';

import {
  faBars as faBarsLight,
  faFiles as faFilesLight,
  faXmark as faXmarkLight,
  faSliders as faSlidersLight,
  faSunCloud as faSunCloudLight,
  faCloudsMoon as faCloudsMoonLight,
  faUpFromLine as faUpFromLineLight,
  faChartColumn as faChartColumnLight,
  faCrystalBall as faCrystalBallLight,
  faBookSparkles as faBookSparklesLight,
  faFolderArrowUp as faFolderArrowUpLight,
  faScrewdriverWrench as faScrewdriverWrenchLight,
  faChartMixedUpCircleDollar as faChartMixedUpCircleDollarLight,
} from '@fortawesome/pro-light-svg-icons';

import {
  faBars as faBarsSolid,
  faGear as faGearSolid,
  faFiles as faFilesSolid,
  faXmark as faXmarkSolid,
  faSliders as faSlidersSolid,
  faSunCloud as faSunCloudSolid,
  faCloudsMoon as faCloudsMoonSolid,
  faUpFromLine as faUpFromLineSolid,
  faChartColumn as faChartColumnSolid,
  faCrystalBall as faCrystalBallSolid,
  faBookSparkles as faBookSparklesSolid,
  faFolderArrowUp as faFolderArrowUpSolid,
  faScrewdriverWrench as faScrewdriverWrenchSolid,
  faChartMixedUpCircleDollar as faChartMixedUpCircleDollarSolid,
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
      faBarsLight,
      faBarsSolid,
      faGearSolid,
      faFilesLight,
      faFilesSolid,
      faXmarkLight,
      faXmarkSolid,
      faSlidersLight,
      faSlidersSolid,
      faGoogleBrands,
      faSunCloudLight,
      faSunCloudSolid,
      faGripLinesThin,
      faArrowRightSolid,
      faCloudsMoonSolid,
      faCloudsMoonLight,
      faUpFromLineLight,
      faUpFromLineSolid,
      faChartColumnLight,
      faChartColumnSolid,
      faCrystalBallSolid,
      faCrystalBallLight,
      faHouseTreeRegular,
      faScrewdriverWrenchSolid,
      faScrewdriverWrenchLight,
      faBookSparklesSolid,
      faBookSparklesLight,
      faFolderArrowUpLight,
      faFolderArrowUpSolid,
      faDrumstickSharpSolid,
      faBookOpenCoverDuotone,
      faWhatsappSquareBrands,
      faChartMixedUpCircleDollarLight,
      faChartMixedUpCircleDollarSolid
    );
  }
}
