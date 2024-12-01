import { NgModule } from '@angular/core';

import {
  FaIconLibrary,
  FontAwesomeModule,
} from '@fortawesome/angular-fontawesome';

import {
  faJar as faJarDuotone,
  faXmark as faXmarkDuotone,
  faPerson as faPersonDuotone,
  faTurkey as faTurkeyDuotone,
  faFilePen as faFilePenDuotone,
  faTrashCan as faTrashCanDuotone,
  faLayerPlus as faLayerPlusDuotone,
  faCaretRight as faCaretRightDuotone,
  faPersonDress as faPersonDressDuotone,
  faBookOpenCover as faBookOpenCoverDuotone,
  faPlateUtensils as faPlateUtensilsDuotone,
} from '@fortawesome/pro-duotone-svg-icons';

import {
  faFiles as faFilesLight,
  faChartColumn as faChartColumnLight,
  faFolderArrowUp as faFolderArrowUpLight,
  faRightToBracket as faRightToBracketLight,
  faClipboardQuestion as faClipboardQuestionLight,
  faEnvelopeCircleCheck as faEnvelopeCircleCheckLight,
} from '@fortawesome/pro-light-svg-icons';

import {
  faBolt as faBoltSharpSolid,
  faPlus as faPlusSharpSolid,
  faPeanuts as faPeanutsSharpSolid,
  faBowlRice as faBowlRiceSharpSolid,
  faDrumstick as faDrumstickSharpSolid,
} from '@fortawesome/sharp-solid-svg-icons';

import {
  faCheck as faCheckSolid,
  faXmark as faXmarkSolid,
  faArrowRight as faArrowRightSolid,
} from '@fortawesome/free-solid-svg-icons';
import {
  faGoogle as faGoogleBrands,
  faTwitter as faTwitterBrands,
  faInstagram as faInstagramBrands,
  faFacebookF as faFacebookFBrands,
} from '@fortawesome/free-brands-svg-icons';

import {
  faUser as faUserSolid,
  faBars as faBarsSolid,
  faGear as faGearSolid,
  faFiles as faFilesSolid,
  faShirt as faShirtSolid,
  faSalad as faSaladSolid,
  faPotFood as faPotFoodSolid,
  faDumbbell as faDumbbellSolid,
  faTelescope as faTelescopeSolid,
  faRotateBack as faRotateBackSolid,
  faHeartPulse as faHeartPulseSolid,
  faChartColumn as faChartColumnSolid,
  faCircleNotch as faCircleNotchSolid,
  faSpinnerThird as faSpinnerThirdSolid,
  faFolderArrowUp as faFolderArrowUpSolid,
  faPersonDollyEmpty as faPersonDollyEmptySolid,
  faMessageExclamation as faMessageExclamationSolid,
  faCommentsQuestionCheck as faCommentsQuestionCheckSolid,
} from '@fortawesome/pro-solid-svg-icons';
import { faGripLines as faGripLinesThin } from '@fortawesome/pro-thin-svg-icons';
import { faHouseTree as faHouseTreeRegular } from '@fortawesome/pro-regular-svg-icons';
import { faWhatsappSquare as faWhatsappSquareBrands } from '@fortawesome/free-brands-svg-icons';

@NgModule({
  imports: [FontAwesomeModule], // Import the FontAwesomeModule
  exports: [FontAwesomeModule], // Export it for use in other modules
})
export class Fontawesome {
  constructor(private library: FaIconLibrary) {
    library?.addIcons(
      faBarsSolid,
      faGearSolid,
      faUserSolid,
      faFilesLight,
      faFilesSolid,
      faSaladSolid,
      faCheckSolid,
      faShirtSolid,
      faXmarkSolid,
      faJarDuotone,
      faXmarkDuotone,
      faGoogleBrands,
      faPotFoodSolid,
      faPersonDuotone,
      faGripLinesThin,
      faTurkeyDuotone,
      faTwitterBrands,
      faDumbbellSolid,
      faPlusSharpSolid,
      faFilePenDuotone,
      faBoltSharpSolid,
      faTelescopeSolid,
      faTrashCanDuotone,
      faRotateBackSolid,
      faArrowRightSolid,
      faFacebookFBrands,
      faInstagramBrands,
      faHeartPulseSolid,
      faChartColumnLight,
      faChartColumnSolid,
      faLayerPlusDuotone,
      faHouseTreeRegular,
      faCircleNotchSolid,
      faCaretRightDuotone,
      faSpinnerThirdSolid,
      faPeanutsSharpSolid,
      faFolderArrowUpLight,
      faBowlRiceSharpSolid,
      faPersonDressDuotone,
      faFolderArrowUpSolid,
      faDrumstickSharpSolid,
      faRightToBracketLight,
      faPlateUtensilsDuotone,
      faBookOpenCoverDuotone,
      faWhatsappSquareBrands,
      faPersonDollyEmptySolid,
      faClipboardQuestionLight,
      faMessageExclamationSolid,
      faEnvelopeCircleCheckLight,
      faCommentsQuestionCheckSolid
    );
  }
}
