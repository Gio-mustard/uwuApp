/**
 * @fileoverview VaulPage — Demostración del drawer de vaul-base.
 *
 * Muestra tres ejemplos del componente Modal con useDrawer=true:
 *  1. Básico   — drawer simple que se abre y cierra.
 *  2. Snap Points — drawer con tres alturas de snap.
 *  3. Scrollable  — drawer con contenido largo y scroll interno.
 */

import { useCallback, useEffect, useState } from 'react';
import { Modal } from '../../components/modals/Modal';
import './VaulPage.css';
import { useSession } from '../../context/SessionContext';
import { TrashIcon, PromoteIcon } from '../../components/common/Icons';

const VaulTask = ({ task, onDelete, onPromote }) => {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = useCallback(async (taskId) => {
        setIsDeleting(true);
        await onDelete(taskId);
        setIsDeleting(false);
    }, [onDelete]);

    return (
        <section className='vaul-task task-item'>
            <div className='vaul-task__options'>
                {isDeleting && (

                    <div
                        className='spinner'
                        style={{
                            position: 'absolute', inset: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: 'rgba(0,0,0,0.2)'
                        }}>
                        <div style={{
                            width: 14, height: 14,
                            border: '2px solid rgba(255,255,255,0.4)',
                            borderTopColor: '#fff', borderRadius: '50%',
                            animation: 'spin 0.8s linear infinite'
                        }} />
                    </div>
                )}
                <button
                    className='btn-vaul-task__promote'
                    onClick={() => onPromote(task)}
                    title='Convertir en pendiente formal'
                    style={{ border: 'none', padding: '4px', borderRadius: '4px', cursor: 'pointer', background: 'none' }}
                ><PromoteIcon /></button>
                <button
                    className='btn-vaul-task__delete'
                    onClick={() => handleDelete(task.id)}
                    style={{ border: 'none', padding: '4px', borderRadius: '4px', cursor: 'pointer', background: 'none' }}
                ><TrashIcon /></button>
            </div>
            <h4 className='vaul-task__title'>{task.title}</h4>
        </section>
    )
}


/* ─── Page ───────────────────────────────────────────────────────────────── */
export function VaulPage({ open, onClose, onPromote }) {
    const { useTasks } = useSession();
    const { addVaulTask, vaulTasks, deleteBaulTask } = useTasks();
    const [currentTitleTask, setCurrentTitleTask] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [innerTask, setInnerTask] = useState(vaulTasks);

    useEffect(() => {
        setInnerTask(vaulTasks.toReversed())
    }, [vaulTasks])

    const handleSubmit = useCallback(async (titleTask) => {
        if (titleTask === '') return
        setIsLoading(true);
        await addVaulTask({ title: titleTask });
        setCurrentTitleTask('');
        setIsLoading(false);
    })

    const handlePromote = useCallback((task) => {
        onPromote({
            title: task.title
        });
        onClose();
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
                    {vaulTasks.length === 0 && !isLoading ? "No haz agregado ningun pendiente al baul" : null}
                    <section className={`vaul-task task-item loader${isLoading ? ' is-loading' : ''}`} />
                    {innerTask.map((task) => (<VaulTask key={task.id} task={task} onDelete={deleteBaulTask} onPromote={handlePromote} />))}
                </main>
            </section>

        </Modal>
    );
}