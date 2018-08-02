import Event from './models/Event';
import EventDatabase from './models/EventDatabase';

const state = {
  activeDay: 'MON',
  selectedEvent: null,
  eventDatabase: new EventDatabase(),
};
