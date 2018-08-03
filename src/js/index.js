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
