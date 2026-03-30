/**
 * @fileoverview VaulPage — Demostración del drawer de vaul-base.
 *
 * Muestra tres ejemplos del componente Modal con useDrawer=true:
 *  1. Básico   — drawer simple que se abre y cierra.
 *  2. Snap Points — drawer con tres alturas de snap.
 *  3. Scrollable  — drawer con contenido largo y scroll interno.
 */

import { useCallback, useState } from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { Modal } from '../../components/modals/Modal';
import './VaulPage.css';
import { useSession } from '../../context/SessionContext';
import { TrashIcon, PromoteIcon } from '../../components/common/Icons';

const VaulTask = ({ task, onDelete, onPromote }) => {
    return (
        <section className='vaul-task task-item'>
            <div className='vaul-task__options'>

                <button
                    className='btn-vaul-task__promote'
                    onClick={() => onPromote(task)}
                    title='Convertir en pendiente formal'
                    style={{ border: 'none', padding: '4px', borderRadius: '4px', cursor: 'pointer', background: 'none' }}
                ><PromoteIcon /></button>
                <button
                    className='btn-vaul-task__delete'
                    onClick={() => onDelete(task.id)}
                    style={{ border: 'none', padding: '4px', borderRadius: '4px', cursor: 'pointer', background: 'none' }}
                ><TrashIcon /></button>
            </div>
            <h4 className='vaul-task__title'>{task.title}</h4>
        </section>
    )
}


/* ─── Page ───────────────────────────────────────────────────────────────── */
export function VaulPage({ open, onClose }) {
    const { useTasks } = useSession();
    const { addVaulTask, vaulTasks, deleteBaulTask } = useTasks();
    const [currentTitleTask, setCurrentTitleTask] = useState('');

    const handleSubmit = useCallback(async (titleTask) => {
        if (titleTask === '') return
        await addVaulTask({ title: titleTask });
        setCurrentTitleTask('');
    })

    const handlePromote = useCallback((task) => {
        // TODO: abrir modal de AddTask con el título prellenado
        console.log('Promover tarea al baul formal:', task);
    }, []);
    return (
        <Modal
            useDrawer
            onClose={onClose}
            open={open}

        >
            <section className='vaul-page'>

                <header className='vaul-header'>
                    <h2 className='vaul-page__title'>Tu Baul</h2>
                    <p className='vaul-page__subtitle'>Pendientes que tienes que hacer "ahorita"</p>
                </header>

                <form className='vaul-form' autoComplete='off' noValidate autoFocus onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmit(currentTitleTask)
                }} >
                    <input className='form-input' type="text" placeholder='ej. planear vacaciones' name='title-task' value={currentTitleTask} onChange={e => setCurrentTitleTask(e.target.value)} />
                    <button type='submit' className='btn-primary create-vaul-task'>+</button>
                </form>
                <hr className='divider' />
                <main className='vaul-tasks'>
                    {vaulTasks.length === 0 ?"No haz agregado ningun pendiente al baul":null}
                    {vaulTasks.map((task) => (<VaulTask key={task.id} task={task} onDelete={deleteBaulTask} onPromote={handlePromote} />))}
                </main>
            </section>

        </Modal>
    );
}