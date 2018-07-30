export default class EventDatabase {
  constructor() {
    this.MON = [];
    this.TUE = [];
    this.WED = [];
    this.THU = [];
    this.FRI = [];
    this.SAT = [];
    this.SUN = [];
  }

  addToEventDatabase(event, activeDay) {
    if (this[activeDay].length === 0) {
      // If no events, just push
      this[activeDay].push(event);
    } else {
      // If events, linear search to keep database in order
      let indexToInsert = 0;
      this[activeDay].forEach((cur) => {
        if (event.startTime > cur.startTime) {
          indexToInsert += 1;
        }
      });
      this[activeDay].splice(indexToInsert, 0, event);
    }
  }

  deleteFromEventDatabase(index, activeDay) {
    this[activeDay].splice(index, 1);
  }

  resetActiveDay(activeDay) {
    this[activeDay] = [];
  }

  cloneToSelectedDays(activeDay, selectedDays) {
    selectedDays.forEach((selectedDay) => {
      this[selectedDay] = this[activeDay].slice();
    });
  }
}
