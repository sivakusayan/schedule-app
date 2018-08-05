import EventDatabase from './models/EventDatabase';
import * as eventController from './controllers/eventController';

const state = {
  activeDay: 'FRI',
  selectedEvent: null,
  eventDatabase: new EventDatabase(),
};

/*-------------------------------------------*/
/* EVENT LISTENERS */
/*-------------------------------------------*/
