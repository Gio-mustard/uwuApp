import { useEffect, useState } from "react";
import appColorPallete from "../../constants/colorPalletes";






export default function ColorPallete() {
    const [palletes,setPallets] = useState(appColorPallete.getPalletesKeys());
    const [currentKeyPallete,setCurrentKeyPallete] = useState('default');


    useEffect(()=>{
        appColorPallete.applyColorPalette(currentKeyPallete);
    },[currentKeyPallete])
    
  return (
    <div className="app-pallete-container">
      {palletes.map((pallete) => {
        const isSelected = currentKeyPallete == pallete.key;
        return (
          <button
            key={pallete.key}
            onClick={() => {

                setCurrentKeyPallete(pallete.key)
            }}
            className={`paletteCard ${isSelected ? "paletteCardActive" : ""}`}
          >
            {pallete.title}
          </button>
        );
      })}
    </div>
  );
}
