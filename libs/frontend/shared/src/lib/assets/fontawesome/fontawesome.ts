import { NgModule } from '@angular/core';

import { FaIconLibrary, FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import {
  faPlus as faPlusSolid,
  faBars as faBarsSolid,
  faMinus as faMinusSolid,
  faCheck as faCheckSolid,
  faPrint as faPrintSolid,
  faXmark as faXmarkSolid,
  faCircle as faCircleSolid,
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
  faFileCsv as faFileCsvRegular,
  faChartBar as faChartBarRegular,
  faCalendar as faCalendarRegular,
  faTrashCan as faTrashCanRegular,
  faNoteSticky as faNoteStickyRegular,
  faCircleCheck as faCircleCheckRegular,
  faRectangleList as faRectangleListRegular,
} from '@fortawesome/pro-regular-svg-icons';

@NgModule({
  imports: [FontAwesomeModule],
  exports: [FontAwesomeModule],
})
export class Fontawesome {
  constructor(library: FaIconLibrary) {
    library?.addIcons(
      //Solid
      faPlusSolid,
      faBarsSolid,
      faMinusSolid,
      faCheckSolid,
      faPrintSolid,
      faXmarkSolid,
      faCircleSolid,
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
      faFileCsvRegular,
      faCalendarRegular,
      faChartBarRegular,
      faTrashCanRegular,
      faNoteStickyRegular,
      faCircleCheckRegular,
      faRectangleListRegular,
    );
  }
}
