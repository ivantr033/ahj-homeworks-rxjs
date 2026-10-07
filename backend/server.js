import express from 'express';
import cors from 'cors';
import { faker } from '@faker-js/faker';

const app = express();
app.use(cors());
app.use(express.json());

// POLLING ENDPOINT: Generates random or empty emails at random.
app.get('/messages/unread', (req, res) => {
    const shouldSendMessages = Math.random() > 0.3; // 70% probability of having new emails
    const messages = [];

    if (shouldSendMessages) {
        const count = Math.floor(Math.random() * 2) + 1; // 1 or 2 new messages
        for (let i = 0; i < count; i++) {
            messages.push({
                id: faker.string.uuid(),
                from: faker.internet.email().toLowerCase(),
                subject: Math.random() > 0.5 ? 'Hello from ' + faker.person.firstName() : 'Short msg',
                body: faker.lorem.paragraph(),
                received: Math.floor(Date.now() / 1000)
            });
        }
    }

    res.json({
        status: 'ok',
        timestamp: Math.floor(Date.now() / 1000),
        messages: messages
    });
});

// MOCK DATABASE FOR POSTS AND COMMENTS
const mockPosts = Array.from({ length: 5 }).map(() => ({
    id: faker.string.uuid(),
    author_id: faker.string.uuid(),
    title: faker.lorem.sentence({ min: 3, max: 5 }),
    author: faker.person.fullName(),
    avatar: 'https://dicebear.com' + faker.person.firstName(),
    image: 'https://picsum.photos' + faker.string.alphanumeric(5) + '/500/300',
    created: Math.floor(Date.now() / 1000) - Math.floor(Math.random() * 10000)
}));

const mockComments = {};
mockPosts.forEach(post => {
    mockComments[post.id] = Array.from({ length: Math.floor(Math.random() * 3) + 1 }).map(() => ({
        id: faker.string.uuid(),
        post_id: post.id,
        author_id: faker.string.uuid(),
        author: faker.person.fullName(),
        avatar: 'https://dicebear.com' + faker.person.firstName(),
        content: faker.lorem.sentence(),
        created: Math.floor(Date.now() / 1000)
    }));
});

// ENDPOINT POSTS LATEST
app.get('/posts/latest', (req, res) => {
    res.json({ status: 'ok', data: mockPosts });
});

// ENDPOINT COMMENTS LATEST
app.get('/posts/:post_id/comments/latest', (req, res) => {
    const { post_id } = req.params;
    res.json({ status: 'ok', data: mockComments[post_id] || [] });
});

app.listen(7070, () => {
    console.log('⚡ Ecosistema Backend RxJS corriendo en http://localhost:7070');
});
