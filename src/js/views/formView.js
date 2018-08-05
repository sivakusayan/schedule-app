import { DOMobjects } from './base';

export const getInputData = () => ({
  name: DOMobjects.nameInput.value,
  startTime: DOMobjects.startTimeInput.value,
  endTime: DOMobjects.endTimeInput.value,
  notes: DOMobjects.notesInput.value,
});


export const setConfigData = (name, startTime, endTime, notes) => {
  DOMobjects.nameConfigInput.value = name;
  DOMobjects.startTimeConfigInput.value = startTime;
  DOMobjects.endTimeConfigInput.value = endTime;
  DOMobjects.notesConfigInput.value = notes;
};

export const getConfigData = () => ({
  name: DOMobjects.nameConfigInput.value,
  startTime: DOMobjects.startTimeConfigInput.value,
  endTime: DOMobjects.endTimeConfigInput.value,
  notes: DOMobjects.notesConfigInput.value,
});

export const resetNewEventForm = () => {
  DOMobjects.startTimeInput.setCustomValidity('');
  DOMobjects.endTimeInput.setCustomValidity('');
  DOMobjects.newEventForm.reset();
};

export const getSelectedDays = () => {
  // Find days that were selected for cloning
  const selectedDays = [];

  Array.prototype.forEach.call(document.querySelectorAll('.selected'), (current) => {
    selectedDays.push(current.textContent);
  });

  return selectedDays;
};

export const updateCloneRoutineChoices = (state) => {
  // Unhide the original active day
  document.querySelector('.hidden').classList.remove('hidden');

  // Hide the new active day
  const cloneDayButtons = Array.from(DOMobjects.cloneRoutineDays);
  cloneDayButtons.find(day => day.textContent === state.activeDay).classList.add('hidden');
};

export const resetCloneForm = () => {
  // Unselect selected days if exiting clone form
  Array.prototype.forEach.call(document.querySelectorAll('.selected'), (current) => {
    current.classList.remove('selected');
  });
};
