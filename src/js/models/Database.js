export default class Database {
  constructor() {
    this.MON = [];
    this.TUE = [];
    this.WED = [];
    this.THU = [];
    this.FRI = [];
    this.SAT = [];
    this.SUN = [];
  }

  deleteFromDatabase(index, activeDay) {
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
