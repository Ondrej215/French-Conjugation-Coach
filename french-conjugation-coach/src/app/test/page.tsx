"use client";
import { useState, useEffect , useRef} from "react";

const SlideDown = () => {
  const [show, setShow] = useState(false);

  return (
    <div className="relative w-full max-w-md mx-auto mt-10">
      <input
        type="text"
        placeholder="Type something..."
        className="w-full p-2 border rounded"
      />
      <button onClick={() => setShow(prev => !prev)} className="mt-2">
        Toggle
      </button>

      <div
  className={`overflow-hidden transition-all duration-500 ease-in-out ${
    show ? 'max-h-96 opacity-100 mt-2' : 'max-h-96 opacity-0'
  } bg-blue-100 rounded p-4`}
>
  This slides down!
</div>
    </div>
  );
};

export default SlideDown;
