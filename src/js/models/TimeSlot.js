export default class TimeSlot {
  constructor(startTime, endTime) {
    this.startTime = startTime;
    this.endTime = endTime;
  }

  validateTimeRange() {
    // Checks if start time is before end time
    if (this.startTime && this.endTime) {
      return this.startTime < this.endTime;
    }
    return true;
  }
}
