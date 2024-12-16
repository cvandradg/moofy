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
  faLockOpen as faLockOpenLight,
  faArrowRight as faArrowRightLight,
  faCloudsMoon as faCloudsMoonLight,
  faUpFromLine as faUpFromLineLight,
  faChartColumn as faChartColumnLight,
  faCrystalBall as faCrystalBallLight,
  faLockKeyhole as faLockKeyholeLight,
  faBookSparkles as faBookSparklesLight,
  faFolderArrowUp as faFolderArrowUpLight,
  faLockKeyholeOpen as faLockKeyholeOpenLight,
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
  faLockOpen as faLockOpenSolid,
  faCloudsMoon as faCloudsMoonSolid,
  faUpFromLine as faUpFromLineSolid,
  faArrowRight as faArrowRightSolid,
  faChartColumn as faChartColumnSolid,
  faCrystalBall as faCrystalBallSolid,
  faLockKeyhole as faLockKeyholeSolid,
  faBookSparkles as faBookSparklesSolid,
  faChevronRight as faChevronRightSolid,
  faFolderArrowUp as faFolderArrowUpSolid,
  faLockKeyholeOpen as faLockKeyholeOpenSolid,
  faScrewdriverWrench as faScrewdriverWrenchSolid,
  faChartMixedUpCircleDollar as faChartMixedUpCircleDollarSolid,
} from '@fortawesome/pro-solid-svg-icons';
import { faGoogle as faGoogleBrands } from '@fortawesome/free-brands-svg-icons';
import { faGripLines as faGripLinesThin } from '@fortawesome/pro-thin-svg-icons';
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
      faLockOpenLight,
      faLockOpenSolid,
      faGripLinesThin,
      faArrowRightLight,
      faArrowRightSolid,
      faCloudsMoonSolid,
      faCloudsMoonLight,
      faUpFromLineLight,
      faUpFromLineSolid,
      faChartColumnLight,
      faChartColumnSolid,
      faCrystalBallSolid,
      faLockKeyholeSolid,
      faCrystalBallLight,
      faLockKeyholeLight,
      faHouseTreeRegular,
      faChevronRightSolid,
      faBookSparklesSolid,
      faBookSparklesLight,
      faFolderArrowUpLight,
      faFolderArrowUpSolid,
      faDrumstickSharpSolid,
      faLockKeyholeOpenSolid,
      faLockKeyholeOpenLight,
      faBookOpenCoverDuotone,
      faWhatsappSquareBrands,
      faScrewdriverWrenchSolid,
      faScrewdriverWrenchLight,
      faChartMixedUpCircleDollarLight,
      faChartMixedUpCircleDollarSolid
    );
  }
}
