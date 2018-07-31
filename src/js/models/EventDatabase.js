import Database from './Database';

export default class EventDatabase extends Database {
  addToDatabase(event, activeDay) {
    if (this[activeDay].length === 0) {
      // If no events, just push
      this[activeDay].push(event);
    } else {
      // If there are events, linear search to keep database in order
      let indexToInsert = 0;
      this[activeDay].forEach((cur) => {
        if (event.timeSlot.startTime > cur.timeSlot.startTime) {
          indexToInsert += 1;
        }
      });
      this[activeDay].splice(indexToInsert, 0, event);
    }
  }
}
