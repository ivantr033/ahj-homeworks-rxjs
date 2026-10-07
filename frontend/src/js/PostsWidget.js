import { of, forkJoin } from 'rxjs';
import { ajax } from 'rxjs/ajax';
import { mergeMap, map, catchError } from 'rxjs/operators';

export default class PostsWidget {
    constructor(viewport) {
        this.viewport = viewport;
        this.postsUrl = 'http://localhost:7070/posts/latest';
    }

    init() {
        // COMBINED PUBLICATION UPLOAD CHANNEL
        ajax.getJSON(this.postsUrl).pipe(
            map(response => response.data || []),
            mergeMap(posts => {
                if (posts.length === 0) return of([]);

                // Create asynchronous sub-calls in parallel for each post using forkJoin
                const postStreams = posts.map(post =>
                    ajax.getJSON(`http://localhost:7070/posts/${post.id}/comments/latest`).pipe(
                        map(commRes => ({ ...post, comments: commRes.data || [] })),
                        // If a individual comment fails, that card will recover itself with an empty array
                        catchError(() => of({ ...post, comments: [] }))
                    )
                );
                return forkJoin(postStreams);
            }),
            // Capture the general failure if the entire server is down when the app starts
            catchError((err) => {
                console.error('Critical failure in the social network channel detected by RxJS!', err);

                // Return a simulated error identifier so the subscribe knows what to display
                return of({ error: true });
            })
        ).subscribe(result => {
            this.viewport.innerHTML = '';

            // If the pipeline captured that the backend is dead, we paint the contingency banner
            if (result.error) {
                this.renderErrorPlaceholder();
                return;
            }

            // If the server is alive, the Faker posts flow smoothly
            result.forEach(post => this.renderPostCard(post));
        });
    }

    renderErrorPlaceholder() {
        const placeholder = document.createElement('div');
        placeholder.style.cssText = `
      text-align: center;
      padding: 40px 20px;
      border: 1px dashed #ef4444;
      border-radius: 12px;
      background: #fef2f2;
      color: #ef4444;
      max-width: 500px;
      width: 100%;
      font-size: 14px;
      font-weight: bold;
      box-sizing: border-box;
    `;
        placeholder.innerHTML = `
      <div style="font-size: 24px; margin-bottom: 10px;">📴</div>
      Лента публикаций временно недоступна<br/>
      <span style="font-size: 12px; font-weight: normal; color: #f87171;">
        (Проверьте соединение с сервером на порту 7070)
      </span>
    `;
        this.viewport.appendChild(placeholder);
    }

    renderPostCard(post) {
        const card = document.createElement('div');
        card.className = 'post-card';

        let commentsHTML = '';
        post.comments.forEach(c => {
            commentsHTML += `
        <div class="comment-item">
          <img src="${c.avatar}" class="avatar-img"/>
          <div class="comment-text"><strong>${c.author}:</strong> ${c.content}</div>
        </div>
      `;
        });

        card.innerHTML = `
      <div class="post-header">
        <img src="${post.avatar}" class="avatar-img"/>
        <div class="author-meta">
          <span class="author-name">${post.author}</span>
          <span class="post-date">${new Date(post.created * 1000).toLocaleTimeString()}</span>
        </div>
      </div>
      <img src="${post.image}" class="post-banner-img" />
      <div class="comments-section">
        <div style="font-size:12px; font-weight:bold; color:#718096; margin-bottom:10px;">Latest comments</div>
        ${commentsHTML || '<p style="font-size:11px; color:#a0aec0;">No comments yet.</p>'}
      </div>
    `;
        this.viewport.appendChild(card);
    }
}
