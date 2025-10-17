import React, { useState } from 'react';

interface ToggleSwitchProps {
  option1: string;
  option2: string;
  onToggle: (mode: 'ingredients' | 'dish') => void;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ option1, option2, onToggle }) => {
  const [isToggled, setIsToggled] = useState(false);

  const handleToggle = () => {
    const newToggleState = !isToggled;
    setIsToggled(newToggleState);
    onToggle(newToggleState ? 'dish' : 'ingredients');
  };

  return (
    <div className="flex items-center justify-center bg-slate-800 rounded-lg p-1 w-full">
      <button
        onClick={!isToggled ? undefined : handleToggle}
        className={`w-1/2 py-2 px-4 rounded-md text-sm font-semibold transition-colors ${
          !isToggled ? 'bg-cyan-600 text-white' : 'bg-transparent text-slate-400 hover:bg-slate-700'
        }`}
      >
        {option1}
      </button>
      <button
        onClick={isToggled ? undefined : handleToggle}
        className={`w-1/2 py-2 px-4 rounded-md text-sm font-semibold transition-colors ${
          isToggled ? 'bg-cyan-600 text-white' : 'bg-transparent text-slate-400 hover:bg-slate-700'
        }`}
      >
        {option2}
      </button>
    </div>
  );
};

export default ToggleSwitch;