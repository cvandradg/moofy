import { NgModule } from '@angular/core';

import {
  FaIconLibrary,
  FontAwesomeModule,
} from '@fortawesome/angular-fontawesome';


import {
  faPlus as faPlusSolid,
  faBars as faBarsSolid,
  faMinus as faMinusSolid,
  faCheck as faCheckSolid,
  faXmark as faXmarkSolid,
  faSliders as faSlidersSolid,
  faArrowUp as faArrowUpSolid,
  faChevronUp as faChevronUpSolid,
  faArrowRight as faArrowRightSolid,
  faChevronDown as faChevronDownSolid,
  faChevronRight as faChevronRightSolid,
  faArrowUpFromBracket as faArrowUpFromBracketSolid,
} from '@fortawesome/pro-solid-svg-icons';

import {
  faEye as faEyeRegular,
  faFile as faFileRegular,
  faFolder as faFolderRegular,
  faCalendar as faCalendarRegular,
  faChartBar as faChartBarRegular,
  faTrashCan as faTrashCanRegular,
  faNoteSticky as faNoteStickyRegular,
  faCircleCheck as faCircleCheckRegular,
  faRectangleList as faRectangleListRegular,
} from '@fortawesome/pro-regular-svg-icons';

import { faBars as faBarsLight } from '@fortawesome/pro-light-svg-icons';
import { faGoogle as faGoogleBrands } from '@fortawesome/free-brands-svg-icons';
import { faGripLines as faGripLinesThin } from '@fortawesome/pro-thin-svg-icons';
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
      //Solid
      faPlusSolid,
      faBarsSolid,
      faMinusSolid,
      faCheckSolid,
      faXmarkSolid,
      faSlidersSolid,
      faArrowUpSolid,
      faChevronUpSolid,
      faArrowRightSolid,
      faChevronDownSolid,
      faChevronRightSolid,
      faArrowUpFromBracketSolid,

      //Regular
      faEyeRegular,
      faFileRegular,
      faFolderRegular,
      faCalendarRegular,
      faChartBarRegular,
      faTrashCanRegular,
      faNoteStickyRegular,
      faCircleCheckRegular,
      faRectangleListRegular
    );
  }
}
