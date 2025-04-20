import { Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon, XMarkIcon } from '@heroicons/react/24/outline';

const LapSelector = ({ laps, selectedLaps, onSelectLap, maxSelections = 2 }) => {
  // Validate and ensure lap numbers are valid integers
  const validateLapNumber = (lapNumber) => {
    const num = Number(lapNumber);
    return !isNaN(num) && Number.isInteger(num) && num > 0 ? num : null;
  };

  const isSelected = (lapNumber) => {
    const validLapNumber = validateLapNumber(lapNumber);
    return validLapNumber && selectedLaps.some(selected => selected === validLapNumber);
  };

  const canSelectMore = selectedLaps.length < maxSelections;

  const handleSelect = (selectedValues) => {
    // Convert all values to valid numbers and filter out invalid ones
    const validNumbers = selectedValues
      .map(value => validateLapNumber(value))
      .filter(num => num !== null);

    // Update the selection while respecting the maxSelections limit
    onSelectLap(validNumbers.slice(0, maxSelections));
  };

  const handleRemoveLap = (lapNumber, event) => {
    event.stopPropagation();
    const validLapNumber = validateLapNumber(lapNumber);
    if (!validLapNumber) return;
    onSelectLap(selectedLaps.filter(l => l !== validLapNumber));
  };

  // Filter out invalid lap numbers from the laps array
  const validLaps = laps.filter(lap => validateLapNumber(lap.lapNumber));

  return (
    <div className="w-full">
      {/* Selected Laps Display */}
      {selectedLaps.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {selectedLaps.map((lapNumber) => {
            const validLapNumber = validateLapNumber(lapNumber);
            if (!validLapNumber) return null;
            return (
              <div
                key={validLapNumber}
                className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-full text-sm"
              >
                <span>Lap {validLapNumber}</span>
                <button
                  onClick={(e) => handleRemoveLap(validLapNumber, e)}
                  className="p-0.5 hover:bg-indigo-200 dark:hover:bg-indigo-800 rounded-full"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Lap Selection Dropdown */}
      <Listbox value={selectedLaps} onChange={handleSelect} multiple>
        <div className="relative">
          <Listbox.Button className="relative w-full cursor-pointer rounded-lg bg-white dark:bg-gray-800 py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-300 sm:text-sm">
            <span className="block truncate">
              {selectedLaps.length === 0
                ? 'Select laps to compare'
                : `Selected ${selectedLaps.length} lap${selectedLaps.length > 1 ? 's' : ''}`}
            </span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </span>
          </Listbox.Button>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-800 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {validLaps.map((lap) => {
                const validLapNumber = validateLapNumber(lap.lapNumber);
                if (!validLapNumber) return null;
                const isLapSelected = isSelected(validLapNumber);
                return (
                  <Listbox.Option
                    key={validLapNumber}
                    className={({ active }) =>
                      `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                        active ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-900 dark:text-indigo-100' : 'text-gray-900 dark:text-gray-100'
                      } ${!canSelectMore && !isLapSelected ? 'opacity-50' : ''}`
                    }
                    value={validLapNumber}
                  >
                    {({ selected }) => (
                      <>
                        <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                          Lap {validLapNumber} - {lap.lapTime.toFixed(3)}s
                        </span>
                        {selected ? (
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-indigo-600 dark:text-indigo-400">
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Listbox.Option>
                );
              })}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
};

export default LapSelector; 