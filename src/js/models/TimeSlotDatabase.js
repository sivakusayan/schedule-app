import Database from './Database';

export default class TimeSlotDatabase extends Database {
  addToDatabase(timeSlot, activeDay) {
    if (this[activeDay].length === 0) {
      // If no timeSlots, just push
      this[activeDay].push(timeSlot);
    } else {
      // If there are timeSlots, linear search to keep database in order
      let indexToInsert = 0;
      this[activeDay].forEach((cur) => {
        if (timeSlot.startTime > cur.startTime) {
          indexToInsert += 1;
        }
      });
      this[activeDay].splice(indexToInsert, 0, timeSlot);
    }
  }

  validateNoTimeOverlap(timeSlot, activeDay) {
    // Checks if timeSlot is overlaps an existing timeSlot
    for (const [startTime, endTime] of this[activeDay]) {
      // Check if startTime is valid
      if (startTime <= timeSlot.startTime && timeSlot.startTime < endTime) {
        return false;
      }
    }
    for (const [startTime, endTime] of this[activeDay]) {
      // Check if endTime is valid
      if (startTime < timeSlot.endTime && timeSlot.endTime <= endTime) {
        return false;
      }
    }
    return true;
  }

  validateNoSubEvents(timeSlot, activeDay) {
    // Checks if timeSlot swallows an existing timeSlot
    for (const [startTime, endTime] of this[activeDay]) {
      if (timeSlot.startTime <= startTime && endTime <= timeSlot.endTime) {
        return false;
      }
    }
    return true;
  }
}
