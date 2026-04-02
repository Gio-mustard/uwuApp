import { useCallback, useEffect, useState } from "react"
import { Modal } from "./Modal"
import './ChangeVaulPassword.css'
import { EyeIcon, EyeOffIcon } from "../common/Icons"

export default function ChangeVaulPassword({ open, onClose,isEdit=false}) {
    const [currentPassword, setCurrentPassword] = useState('');
    const [isSaved,setIsSaved] = useState(false);
    const [feedbackMessage,setFeedbackMessage] = useState("");
    const [mode,setMode] = useState(isEdit?"update":'set')
    const [showPassword,setShowPassword] = useState(false);
    useEffect(()=>{
        if (!open) return;
        const password = localStorage.getItem("vaul-password");
        if (password!=null)setMode('update')
        setFeedbackMessage("");
        setIsSaved(false);
        setShowPassword(false);
        setCurrentPassword(password??"");
    },[open])
    useEffect(()=>{
        setIsSaved(false);
    },[currentPassword])
    const handleSetPassword = useCallback(()=>{
        if (currentPassword === '') {
            setFeedbackMessage('La contrasena esta vacia birote!');
            return;
        }
        localStorage.setItem('vaul-password',currentPassword);
        setIsSaved(true);
        
    },[currentPassword]);
    useEffect(()=>{
        if(isSaved){
            setFeedbackMessage('Tu contrasena esta guardada!');
        }
    },[isSaved])
    
    return (
        <Modal
            useDrawer
            open={open}
            onClose={onClose}
            
        >
            <section className="modal-change-vaul-password">
            
            <h2>{mode==='set'?"Establece una contrasena":"Cambia tu contrasena"}</h2>
            <p>*actualmente esto esta en estado de prueba,la contrasena solo se almacena en tu navegador!</p>
            <hr className="divider"/>
            <br />
            <label htmlFor="password">Contrasena</label>
            <div className="password-input-container">
                <input name="password" type={showPassword?"text":'password'} value={currentPassword} onChange={(e)=>setCurrentPassword(e.target.value)} className="form-input"/>
                <button type="button" className="toggle-password-btn" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
            </div>
            {(isSaved||feedbackMessage!=='')&&(
                
                <h3 className="feedback-message">{feedbackMessage}</h3>
                
            )}
            <button className="btn-primary" onClick={handleSetPassword}>establecer</button>


            </section>
        </Modal>
    )
}