import Event from '../models/Event';
import { DOMobjects } from '../views/base';
import * as eventView from '../views/eventView';
import * as formView from '../views/formView';

export const addEvent = (event, state) => {
  // Add to database model
  state.eventDatabase.addToDatabase(event, state.activeDay);
  // Prepare UI for schedule update
  eventView.clearEvents();
  // Render events into UI
  eventView.renderSchedule(state.eventDatabase[state.activeDay]);
};

export const deleteEvent = (index, state) => {
  state.eventDatabase.deleteFromDatabase(index, state.activeDay);
  eventView.deleteEvent(index);
  setTimeout(eventView.updateIndices, 300);
};

export const cloneRoutine = (state) => {
  const selectedDays = formView.getSelectedDays();
  state.eventDatabase.cloneToSelectedDays(state.activeDay, selectedDays);
  formView.resetCloneForm();
  formView.fadeOut(DOMobjects.cloneRoutineUI);
};

export const resetRoutine = (state) => {
  state.eventDatabase.resetActiveDay(state.activeDay);
  eventView.clearEvents();
};

// eventView.renderEvent({
//   name: 'Breakfast',
//   timeSlot: {
//     startTime: '07:00',
//     endTime: '07:30',
//   },
//   notes: '',
// }, 0);
// eventView.renderEvent({
//   name: 'Workout',
//   timeSlot: {
//     startTime: '08:00',
//     endTime: '09:30',
//   },
//   notes: '4 sets, 15 reps of each: Glute Bridge, Step Up, Squat, Leg Curl',
// }, 1);
