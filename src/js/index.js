import Event from './models/Event';
import EventDatabase from './models/EventDatabase';
import * as eventView from './views/eventView';

const state = {
  activeDay: 'MON',
  selectedEvent: null,
  eventDatabase: new EventDatabase(),
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

const addEvent = (event) => {
  // Add to database model
  state.eventDatabase.addToDatabase(event, state.activeDay);
  // Prepare UI for schedule update
  eventView.clearEvents();
  // Render events into UI
  eventView.renderSchedule(state.eventDatabase[state.activeDay]);
};

const deleteEvent = (index) => {
  state.eventDatabase.deleteFromDatabase(index, state.activeDay);
  eventView.deleteEvent(index);
  setTimeout(eventView.updateIndices, 300);
};

const resetRoutine = () => {
  state.eventDatabase.resetActiveDay(state.activeDay);
  eventView.clearEvents();
};

/*-------------------------------------------*/
/* EVENT LISTENERS */
/*-------------------------------------------*/
