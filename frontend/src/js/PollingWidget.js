import { interval, of } from 'rxjs';
import { ajax } from 'rxjs/ajax';
import { switchMap, catchError, map } from 'rxjs/operators';

export default class PollingWidget {
    constructor(tbody) {
        this.tbody = tbody;
        this.url = 'http://localhost:7070/messages/unread';
        this.errorElement = null; // This will save the visual warning banner
    }

    init() {
        // Create a small alert container above the table to notify the user
        this.setupErrorBanner();

        // 📡 THE CONTINUOUS POLLING FLOW (NEVER DIES)
        interval(5000).pipe(
            switchMap(() =>
                ajax.getJSON(this.url).pipe(
                    map(response => {
                        // If the server responds, we ensure the error notification is turned off
                        this.toggleErrorVisual(false);
                        return response.messages || [];
                    }),
                    catchError((err) => {
                        console.warn('Server down or unreachable detected by RxJS!', err);

                        // Turn on the network notification on the screen
                        this.toggleErrorVisual(true);

                        // Transform the error by returning an empty array so it behaves
                        // exactly like "no new messages".
                        return of([]);
                    })
                )
            )
        ).subscribe(messages => {
            // If the server is down, an array [] will be received, and this loop simply won't do anything.
            messages.forEach(msg => this.renderMessageRow(msg));
        });
    }

    setupErrorBanner() {
        this.errorElement = document.createElement('div');
        this.errorElement.id = 'polling-network-error-banner';
        this.errorElement.style.cssText = `
      background: #fef2f2;
      border: 1px solid #ef4444;
      color: #ef4444;
      padding: 10px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: bold;
      margin-bottom: 14px;
      display: none;
      text-align: center;
    `;
        this.errorElement.innerText = '⚠️ Сервер недоступен! Проверка новых сообщений приостановлена...';

        // We inject it just above the mail board
        this.tbody.closest('.workshop-block-card').insertBefore(this.errorElement, this.tbody.closest('.polling-table'));
    }

    toggleErrorVisual(isError) {
        if (this.errorElement) {
            this.errorElement.style.display = isError ? 'block' : 'none';
        }
    }

    renderMessageRow(msg) {
        const row = document.createElement('tr');

        const cleanSubject = msg.subject.length > 15 ? msg.subject.substring(0, 15) + '...' : msg.subject;

        const date = new Date(msg.received * 1000);
        const timeStr = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')} ${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()}`;

        row.innerHTML = `
      <td class="msg-from">${msg.from}</td>
      <td class="msg-subject">${cleanSubject}</td>
      <td class="msg-time">${timeStr}</td>
    `;
        this.tbody.insertBefore(row, this.tbody.firstChild);
    }
}
