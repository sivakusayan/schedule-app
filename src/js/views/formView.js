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
  const selectedDays = [];

  Array.prototype.forEach.call(document.querySelectorAll('.selected'), (current) => {
    selectedDays.push(current.textContent);
  });

  return selectedDays;
};

export const resetCloneForm = () => {
  Array.prototype.forEach.call(document.querySelectorAll('.selected'), (current) => {
    current.classList.remove('selected');
  });
};
