import Store from './store/Store';
import PollingWidget from './PollingWidget';
import DashboardWidget from './DashboardWidget';
import PostsWidget from './PostsWidget';

const INITIAL_PROJECTS_DATA = {
    projects: [
        {
            id: 1, name: 'REST Backend',
            tasks: [{ id: 11, name: 'Setup Express', done: true }, { id: 12, name: 'Configure CORS', done: false }]
        },
        {
            id: 2, name: 'Frontend',
            tasks: [{ id: 21, name: 'Webpack bundle', done: false }, { id: 22, name: 'Babel setup', done: false }]
        },
        {
            id: 3, name: 'Android App',
            tasks: [{ id: 31, name: 'Setup SDK', done: false }]
        },
        {
            id: 4, name: 'iOS App',
            tasks: [{ id: 41, name: 'Push Notifications', done: true }, { id: 42, name: 'Apple Pay Support', done: false }]
        }
    ]
};

document.addEventListener('DOMContentLoaded', () => {
    const storeInstance = new Store(INITIAL_PROJECTS_DATA);

    // 1. Turn on polling
    const pollingTbody = document.getElementById('polling-messages-tbody');
    if (pollingTbody) {
        const polling = new PollingWidget(pollingTbody);
        polling.init();
    }

    // 2. Turn on Reactive Dashboard
    const statsTbody = document.getElementById('dashboard-stats-tbody');
    const dropdown = document.getElementById('project-selector-dropdown');
    const tasksBox = document.getElementById('dashboard-tasks-box');
    if (statsTbody && dropdown && tasksBox) {
        const dashboard = new DashboardWidget(statsTbody, dropdown, tasksBox, storeInstance);
        dashboard.init();
    }

    // 3. Turn on Social Feed
    const feedViewport = document.getElementById('social-feed-viewport');
    if (feedViewport) {
        const feed = new PostsWidget(feedViewport);
        feed.init();
    }
});
