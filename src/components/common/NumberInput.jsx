import { useCallback, useEffect, useState } from "react"
import "./NumberInput.css"

export default function NumberInput({id,initialValue=0,onChange=(value)=>{},min=0,max=3}){
    const [value,setValue] = useState(initialValue);
    const handleChange = useCallback((newValue)=>{
        if (newValue < min || newValue > max) return
        setValue(newValue);
    },[])

    useEffect(()=>{
        onChange(value);
    },[value])

    return(
        <section className="number-input-container">
            <button onClick={()=>handleChange(value-1)} type="button">-</button>
            <input 
                id={id}
                type="number" 
                value={value} 
                inputMode="none" 
                className="form-input hide-spin-button input-number"
                disabled
                />
            <button onClick={()=>handleChange(value+1)} type="button" >+</button>

        </section>
    )
}