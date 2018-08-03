import * as base from './base';

export const openOptionsMenu = () => {
  base.darkenScreen();
  base.DOMobjects.weekContainer.classList.toggle('menuOpen');
};

export const closeOptionsMenu = () => {
  base.lightenScreen();
  base.DOMobjects.weekContainer.classList.toggle('menuOpen');
};

export const changeActiveDayDisplay = (activeDay) => {
  let dayName;
  switch (activeDay) {
    case 'MON':
      dayName = 'MONDAY';
      break;
    case 'TUE':
      dayName = 'TUESDAY';
      break;
    case 'WED':
      dayName = 'WEDNESDAY';
      break;
    case 'THU':
      dayName = 'THURSDAY';
      break;
    case 'FRI':
      dayName = 'FRIDAY';
      break;
    case 'SAT':
      dayName = 'SATURDAY';
      break;
    case 'SUN':
      dayName = 'SUNDAY';
      break;
    default:
      dayName = 'UNDEFINED';
      break;
  }
  base.DOMobjects.activeDayDisplay.textContent = dayName;
};
