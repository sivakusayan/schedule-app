import * as base from './base';

export const openOptionsMenu = () => {
  base.darkenScreen();
  base.DOMobjects.weekContainer.classList.toggle('menuOpen');
};

export const closeOptionsMenu = () => {
  base.lightenScreen();
  base.DOMobjects.weekContainer.classList.toggle('menuOpen');
};

const changeActiveDayButton = (clickEvent) => {
  // Updates active day class for buttons
  document.querySelector('.activeDay').classList.remove('activeDay');
  clickEvent.target.classList.add('activeDay');
};

const changeActiveDayLabel = () => {
  // Changes active day display in mobile layout
  let dayName;
  const activeDay = document.querySelector('.activeDay').textContent;
  switch (activeDay) {
    case 'MON': dayName = 'MONDAY'; break;
    case 'TUE': dayName = 'TUESDAY'; break;
    case 'WED': dayName = 'WEDNESDAY'; break;
    case 'THU': dayName = 'THURSDAY'; break;
    case 'FRI': dayName = 'FRIDAY'; break;
    case 'SAT': dayName = 'SATURDAY'; break;
    case 'SUN': dayName = 'SUNDAY'; break;
    default: dayName = 'UNDEFINED'; break;
  }
  base.DOMobjects.activeDayDisplay.textContent = dayName;
};

export const changeActiveDay = (clickEvent) => {
  changeActiveDayButton(clickEvent);
  changeActiveDayLabel();

  // Checks if window has changed to mobile layout or not
  if (base.getWindowWidth() <= 43.75) {
    // Close menu after user has chosen a day
    closeOptionsMenu();
  }
};
