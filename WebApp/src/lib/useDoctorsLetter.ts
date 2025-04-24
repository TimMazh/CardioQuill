import { useState } from 'react';

// A basic custom hook for managing a doctor's letter state
export function useDoctorsLetter(initialValue: string = '') {
  const [letter, setLetter] = useState(initialValue);

  // Update the letter
  const updateLetter = (newText: string) => {
    setLetter(newText);
  };

  return {
    letter,
    setLetter: updateLetter,
  };
}
