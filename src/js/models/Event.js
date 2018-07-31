import TimeSlot from './TimeSlot';

export default class Event {
  constructor(name, startTime, endTime, notes) {
    this.name = name;
    this.timeSlot = new TimeSlot(startTime, endTime);
    this.notes = notes;
  }
}
