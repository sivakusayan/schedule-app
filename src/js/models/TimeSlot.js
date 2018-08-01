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

  validateNoTimeOverlap(timeSlots) {
    // Checks if timeSlot overlaps an existing timeSlot
    for (const [startTime, endTime] of timeSlots) {
      // Check if startTime is valid
      if (startTime <= this.startTime && this.startTime < endTime) {
        return false;
      }
      // Check if endTime is valid
      if (startTime < this.endTime && this.endTime <= endTime) {
        return false;
      }
    }
    return true;
  }

  validateNoSubEvents(timeSlots) {
    // Checks if timeSlot swallows an existing timeSlot
    for (const [startTime, endTime] of timeSlots) {
      if (this.startTime <= startTime && endTime <= this.endTime) {
        return false;
      }
    }
    return true;
  }
}
