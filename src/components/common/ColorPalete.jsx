import { useEffect, useState } from "react";
import appColorPallete from "../../constants/colorPalletes";
import "./ColorPalete.css"





export default function ColorPallete() {
    const [palletes,setPallets] = useState(appColorPallete.getPalletesKeys());
    const [currentKeyPallete,setCurrentKeyPallete] = useState(appColorPallete.getCurrentPallete());


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
            style={{borderColor:pallete.colors.colorPrimaryHover,boxShadow:`0 0 1svh ${isSelected ?  pallete.colors.colorPrimary:'transparent'} `}}
            className={`palette-card ${isSelected ? "active" : ""}`}
          >
            <div className="palette-card__color" style={{backgroundColor:pallete.colors.colorPrimary}}></div>
            <div className="palette-card__color" style={{backgroundColor:pallete.colors.colorPrimaryBg}}></div>
            <div className="palette-card__color" style={{backgroundColor:pallete.colors.darkColorPrimary}}></div>
            <div className="palette-card__color" style={{backgroundColor:pallete.colors.ligthColorPrimary}}></div>
            
          </button>
        );
      })}
    </div>
  );
}
