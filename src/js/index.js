import TimeSlot from './models/TimeSlot';
import EventDatabase from './models/EventDatabase';
import { DOMobjects, fadeIn, fadeOut } from './views/base';
import * as formView from './views/formView';
import * as menuView from './views/menuView';
import * as eventView from './views/eventView';

const state = {
  activeDay: 'FRI',
  selectedEvent: null,
  eventDatabase: new EventDatabase(),
};

const addEvent = (event) => {
  // Add to database
  state.eventDatabase.addToDatabase(event, state.activeDay);
  // Prepare UI for schedule update
  eventView.clearSchedule();
  // Render events into UI
  eventView.renderSchedule(state.eventDatabase[state.activeDay]);
};

const deleteEvent = (index) => {
  // Delete from database
  state.eventDatabase.deleteFromDatabase(index, state.activeDay);
  // Delete animation, then delete from HTML
  eventView.deleteEvent(index);
  // Update indices after deleted from HTML
  setTimeout(eventView.updateIndices, 300);
};

const cloneRoutine = (selectedDays) => {
  state.eventDatabase.cloneToSelectedDays(state.activeDay, selectedDays);
  formView.resetCloneForm();
  fadeOut(DOMobjects.cloneRoutineUI);
};

const resetSchedule = () => {
  state.eventDatabase.resetActiveDay(state.activeDay);
  eventView.clearSchedule();
};

const refreshSchedule = () => {
  eventView.clearSchedule();
  eventView.renderSchedule(state.eventDatabase[state.activeDay]);
};

const setupConfigureForm = (index) => {
  // Saves event that is being configured
  state.selectedEvent = state.eventDatabase[state.activeDay][index];
  // Initialize config form with event data
  formView.setConfigData(state.selectedEvent);
  // Hide selected event from database for form validation
  state.eventDatabase.deleteFromDatabase(index, state.activeDay);
};

function setValidationMessage(timeInputs) {
  // Tracks validity of [startTimeInput, endTimeInput]
  const validityCheck = [1, 1];
  // Potential timeslot to add
  const timeSlot = new TimeSlot(timeInputs[0].value, timeInputs[1].value);
  // List of timeslots in database
  const timeSlots = state.eventDatabase.getTimeSlots(state.activeDay);

  // Check validity
  if (!timeSlot.validateTimeRange()) {
    timeInputs[1].setCustomValidity('End time should be after the Start time.');
    validityCheck[1] = 0;
  } else if (timeSlot.validateNoTimeOverlap(timeSlots) !== 'OK') {
    const error = timeSlot.validateNoTimeOverlap(timeSlots);
    if (error === 'INVALID_START') {
      timeInputs[0].setCustomValidity('You can\'t have overlapping event times.');
      validityCheck[0] = 0;
    } else if (error === 'INVALID_END') {
      timeInputs[1].setCustomValidity('You can\'t have overlapping event times.');
      validityCheck[1] = 0;
    }
  } else if (!timeSlot.validateNoSubEvents(timeSlots)) {
    timeInputs[1].setCustomValidity('An event is already inside this timeslot.');
    validityCheck[1] = 0;
  }

  // Reset validity if valid
  if (validityCheck[0] === 1) timeInputs[0].setCustomValidity('');
  if (validityCheck[1] === 1) timeInputs[1].setCustomValidity('');
}

/*-------------------------------------------*/
/* EVENT LISTENERS */
/*-------------------------------------------*/

/* -------------------------MENU BUTTONS--------------------------------*/

DOMobjects.btnNew.addEventListener('click', () => fadeIn(DOMobjects.newEventUI));
DOMobjects.btnNewBack.addEventListener('click', () => {
  // Fade out animation
  fadeOut(DOMobjects.newEventUI);
  // Reset form after animation is done
  setTimeout(() => {
    formView.resetNewEventForm();
  }, 300);
});

DOMobjects.btnClone.addEventListener('click', () => fadeIn(DOMobjects.cloneRoutineUI));
DOMobjects.btnCloneBack.addEventListener('click', () => {
  // Fade out animation
  fadeOut(DOMobjects.cloneRoutineUI);
  // Reset form after animation is done
  setTimeout(() => {
    formView.resetCloneForm();
  }, 300);
});

DOMobjects.btnReset.addEventListener('click', () => fadeIn(DOMobjects.resetRoutineUI));
DOMobjects.btnResetBack.addEventListener('click', () => fadeOut(DOMobjects.resetRoutineUI));

DOMobjects.btnOptions.addEventListener('click', formView.openOptionsMenu);
DOMobjects.btnOptionsBack.addEventListener('click', formView.closeOptionsMenu);

/* ------------------------FORM INPUTS------------------------------*/

DOMobjects.startTimeInput.addEventListener('input', () => {
  const timeInputs = [DOMobjects.startTimeInput, DOMobjects.endTimeInput];
  setValidationMessage(timeInputs);
});
DOMobjects.endTimeInput.addEventListener('input', () => {
  const timeInputs = [DOMobjects.startTimeInput, DOMobjects.endTimeInput];
  setValidationMessage(timeInputs);
});
DOMobjects.newEventForm.addEventListener('submit', () => {
  const event = formView.getInputData();
  addEvent(event, state);
  fadeOut(DOMobjects.newEventUI);
  formView.resetNewEventForm();
});

DOMobjects.startTimeConfigInput.addEventListener('input', () => {
  const timeInputs = [DOMobjects.startTimeConfigInput, DOMobjects.endTimeConfigInput];
  setValidationMessage(timeInputs);
});
DOMobjects.endTimeConfigInput.addEventListener('input', () => {
  const timeInputs = [DOMobjects.startTimeConfigInput, DOMobjects.endTimeConfigInput];
  setValidationMessage(timeInputs);
});
DOMobjects.configEventForm.addEventListener('submit', () => {
  const configuredEvent = formView.getConfigData();
  addEvent(configuredEvent, state);
  fadeOut(DOMobjects.configEventUI);
});

DOMobjects.cloneRoutineForm.addEventListener('submit', () => {
  const selectedDays = formView.getSelectedDays();
  cloneRoutine(selectedDays);
});

DOMobjects.resetRoutineYes.addEventListener('click', () => {
  resetSchedule(state);
  fadeOut(DOMobjects.resetRoutineUI);
});

DOMobjects.resetRoutineNo.addEventListener('click', () => fadeOut(DOMobjects.resetRoutineUI));

/* -------------------------WEEK BUTTONS--------------------------------*/

DOMobjects.week.addEventListener('click', (e) => {
  if (e.target.tagName === 'BUTTON' && state.activeDay !== e.target.textContent) {
    // Copy new active day into state
    state.activeDay = e.target.textContent;
    // Change displayed active day
    menuView.changeActiveDay(e);
    // Disable selecting active day for cloning
    formView.updateCloneRoutineChoices(state.activeDay);
    // Switch active day's schedule
    DOMobjects.routineContainer.style.opacity = 0;
    setTimeout(() => {
      refreshSchedule(state);
      DOMobjects.routineContainer.style.opacity = 1;
    }, 600);
  }
});

DOMobjects.cloneRoutineDaysContainer.addEventListener('click', (event) => {
  if (event.target.tagName === 'BUTTON') {
    event.target.classList.toggle('selected');
  }
});

/* -------------------------EVENT BUTTONS--------------------------------*/

DOMobjects.routineContainer.addEventListener('click', (event) => {
  if (event.target.tagName === 'BUTTON') {
    // Find what action to perform
    const buttonType = event.target.className;
    // Find event_index of event container, and extract index;
    const selectedEventIndex = event.target.closest('.eventContainer').getAttribute('id').split('_')[1];

    if (buttonType === 'event__config') {
      setupConfigureForm(selectedEventIndex);
      fadeIn(DOMobjects.configEventUI);
    } else if (buttonType === 'event__delete') {
      deleteEvent(selectedEventIndex, state);
    } else if (buttonType === 'event__note') {
      eventView.toggleNote(selectedEventIndex);
    }
  }
});

DOMobjects.btnConfigBack.addEventListener('click', () => {
  state.eventDatabase.addToDatabase(state.selectedEvent, state.activeDay);
  fadeOut(DOMobjects.configEventUI);
  DOMobjects.endTimeConfigInput.setCustomValidity('');
  DOMobjects.startTimeConfigInput.setCustomValidity('');
});
