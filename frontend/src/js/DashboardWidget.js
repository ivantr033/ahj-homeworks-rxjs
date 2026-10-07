import { map, distinctUntilChanged } from 'rxjs/operators';

export default class DashboardWidget {
    constructor(statsTbody, dropdown, tasksBox, store) {
        this.statsTbody = statsTbody;
        this.dropdown = dropdown;
        this.tasksBox = tasksBox;
        this.store = store;
        this.selectedProjectId = null;
    }

    init() {
        // Initial population of the dropdown
        this.store.state$.pipe(map(state => state.projects)).subscribe(projects => {
            if (this.dropdown.children.length === 0) {
                projects.forEach(p => {
                    const opt = document.createElement('option');
                    opt.value = p.id;
                    opt.textContent = `Project: ${p.name}`;
                    this.dropdown.appendChild(opt);
                });
                this.selectedProjectId = projects[0]?.id;
            }
        });

        this.dropdown.addEventListener('change', (e) => {
            this.selectedProjectId = parseInt(e.target.value);
            this.store.dispatch('REFRESH_VIEW'); // Force the rendering
        });

        // Left Widget Subscription: Open Statistics
        this.store.state$.subscribe(state => {
            this.statsTbody.innerHTML = '';
            state.projects.forEach(p => {
                const openCount = p.tasks.filter(t => !t.done).length;
                const row = document.createElement('tr');
                row.innerHTML = `<td>${p.name}</td><td><span class="badge-count">${openCount}</span></td>`;
                this.statsTbody.appendChild(row);
            });
        });

        // Right Widget Subscription: Task List
        this.store.state$.subscribe(state => {
            this.tasksBox.innerHTML = '';
            const activeProject = state.projects.find(p => p.id === this.selectedProjectId);
            if (!activeProject) return;

            activeProject.tasks.forEach(task => {
                const item = document.createElement('div');
                item.className = `task-row ${task.done ? 'done' : ''}`;
                item.innerHTML = `
          <span>${task.name}</span>
          <input type="checkbox" data-id="${task.id}" ${task.done ? 'checked' : ''} />
        `;
                this.tasksBox.appendChild(item);
            });
        });

        // Dispatching reactive actions upon clicking checkboxes
        this.tasksBox.addEventListener('change', (e) => {
            const taskId = parseInt(e.target.dataset.id);
            this.store.toggleTask(taskId);
        });
    }
}
