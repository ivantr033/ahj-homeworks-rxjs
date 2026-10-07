import { Subject, startWith, scan, share } from 'rxjs';

const ACTIONS = {
    TOGGLE_TASK: 'TOGGLE_TASK',
};

function reducer(state, action) {
    switch (action.type) {
        case ACTIONS.TOGGLE_TASK: {
            const updatedProjects = state.projects.map(proj => {
                const hasTask = proj.tasks.some(t => t.id === action.payload.taskId);
                if (!hasTask) return proj;

                return {
                    ...proj,
                    tasks: proj.tasks.map(t => t.id === action.payload.taskId ? { ...t, done: !t.done } : t)
                };
            });
            return { ...state, projects: updatedProjects };
        }
        default:
            return state;
    }
}

export default class Store {
    constructor(initialData) {
        this.actions$ = new Subject();
        this.state$ = this.actions$.asObservable().pipe(
            startWith({ type: 'INITIALIZATION' }),
            scan((state, action) => reducer(state, action), initialData),
            share()
        );
    }

    dispatch(type, payload = null) {
        this.actions$.next({ type, payload });
    }

    toggleTask(taskId) {
        this.dispatch(ACTIONS.TOGGLE_TASK, { taskId });
    }
}
