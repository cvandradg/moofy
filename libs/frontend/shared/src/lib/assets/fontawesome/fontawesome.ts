import { NgModule } from '@angular/core';

import { FaIconLibrary, FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import {
  faPlus as faPlusSolid,
  faBars as faBarsSolid,
  faMinus as faMinusSolid,
  faCheck as faCheckSolid,
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
  faCalendar as faCalendarRegular,
  faChartBar as faChartBarRegular,
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
  constructor(private library: FaIconLibrary) {
    library?.addIcons(
      //Solid
      faPlusSolid,
      faBarsSolid,
      faMinusSolid,
      faCheckSolid,
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
      faCalendarRegular,
      faChartBarRegular,
      faTrashCanRegular,
      faNoteStickyRegular,
      faCircleCheckRegular,
      faRectangleListRegular
    );
  }
}
