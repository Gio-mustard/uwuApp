# SessionContext — Sub-hooks Pattern

> **Por qué este documento existe:** El patrón que usa `useSession()` es inusual a primera vista.
> Esta guía explica la motivación, el mecanismo, y cómo extenderlo correctamente.

---

## El Problema que Resuelve

Un único `useSession()` que devuelve todo el estado aplanado (`user`, `tasks`, `events`, `finances`...) fuerza a cada componente a suscribirse a **todo el contexto**. Si cambia cualquier tarea, se re-renderiza el componente de finanzas aunque no use tasks.

El patrón de sub-hooks resuelve esto manteniendo **cada dominio en su propio React Context** mientras `SessionProvider` actúa como gateway común.

---

## Cómo Funciona

```
SessionProvider
│
├── AuthContext.Provider    ← only re-renders auth consumers
├── TaskContext.Provider    ← only re-renders task consumers
├── EventContext.Provider   ← (future) only re-renders event consumers
└── FinanceContext.Provider ← (future) only re-renders finance consumers
```

`useSession()` **no accede a ningún contexto**. Solo devuelve referencias a los sub-hooks:

```js
// src/context/SessionContext.jsx

export function useSession() {
  return {
    useAuth,    // () => { user, login, logout, register }
    useTasks,   // () => { dailyTasks, weeklyTasks, ... }
    // Añadir aquí cuando se creen nuevos contextos:
    // useEvents,
    // useFinances,
  };
}
```

---

## Uso en Componentes

```jsx
// Componente que solo necesita tareas
function HomePage() {
  const { useTasks } = useSession();
  const { dailyTasks, toggleDailyTask } = useTasks();
  // Solo se re-renderiza cuando cambian las tasks ✅
}

// Componente que solo necesita auth
function Sidebar() {
  const { useAuth } = useSession();
  const { user, logout } = useAuth();
  // Solo se re-renderiza cuando cambia el usuario ✅
}

// Componente que necesita ambos
function ProfileModal() {
  const { useAuth, useTasks } = useSession();
  const { user, logout } = useAuth();
  const { deleteTask } = useTasks();
  // Se suscribe a ambos contextos por separado ✅
}
```

---

## Regla Clave

> **`useSession()` solo devuelve referencias a hooks.** No llama a `useContext()` internamente.
> Cada sub-hook ([useAuth](file:///Users/sergiomorquecho/projects/UwuApp/src/context/AuthContext.jsx#73-84), [useTasks](file:///Users/sergiomorquecho/projects/UwuApp/src/context/TaskContext.jsx#192-202)) sí llama a su propio `useContext()`.

Esto garantiza que `useSession()` tenga **costo cero de re-render** — solo es un namespace.

---

## Cómo Añadir un Nuevo Dominio (e.g. `useEvents`)

1. Crear `src/context/EventContext.jsx` con `EventProvider` y `useEvents`
2. Añadir `IEventRepository` y su implementación mock
3. Montar `EventProvider` dentro de `SessionProvider`, después de [TaskProvider](file:///Users/sergiomorquecho/projects/UwuApp/src/context/TaskContext.jsx#40-191)
4. Añadir `useEvents` al objeto devuelto por `useSession()`

```jsx
// SessionContext.jsx — solo añadir en un lugar:
import { useEvents } from './EventContext';

export function useSession() {
  return { useAuth, useTasks, useEvents };
}
```

5. Los componentes ya pueden usar `const { useEvents } = useSession()`

---

## Regla de Scope del Usuario

Todos los repositorios que se monten bajo `SessionProvider` reciben el usuario en su constructor via factory:

```js
// main.jsx
const taskRepositoryFactory   = (user) => new MockTaskRepository(user);
const eventRepositoryFactory  = (user) => new MockEventRepository(user);  // (futuro)
```

`SessionProvider` llama a cada factory cuando el usuario hace login.
El usuario activo siempre está disponible vía `useSession().useAuth()`.
