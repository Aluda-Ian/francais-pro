import { io } from 'socket.io-client';

export function initChat() {
    const contactsListEl = document.getElementById('chat-contacts-list');
    const messagesContainerEl = document.getElementById('chat-messages-container');
    const chatFormEl = document.getElementById('chat-form');
    const chatInputEl = document.getElementById('chat-input');
    const chatUserNameEl = document.getElementById('chat-current-user-name');

    if (!contactsListEl || !messagesContainerEl) {
        return; // Not on the chat page
    }

    let socket;
    let currentUser = null;
    let selectedContactId = null;

    // Fetch current user details from localStorage
    const authData = localStorage.getItem('auth');
    if (authData) {
        try {
            const auth = JSON.parse(authData);
            currentUser = auth.user;
        } catch (e) {
            console.error('Error parsing auth info for chat:', e);
        }
    }

    if (!currentUser) {
        return;
    }

    // Initialize Socket.io
    socket = io(window.location.hostname === 'localhost' ? 'http://localhost:5000' : '/');

    socket.on('connect', () => {
        console.log('Connected to Chat Socket:', socket.id);
        socket.emit('join-user-room', currentUser._id);
    });

    socket.on('receive-private-message', (data) => {
        // If the message is from the currently selected contact, append it
        if (selectedContactId && data.senderId === selectedContactId) {
            appendMessage(data.content, false, data.createdAt);
            scrollToBottom();
        }
        
        // Refresh contacts list to update the latest message and unread count
        loadContacts();
    });

    // Load initial contacts
    loadContacts();

    chatFormEl.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const content = chatInputEl.value.trim();
        if (!content || !selectedContactId) return;

        chatInputEl.value = '';

        try {
            const token = JSON.parse(localStorage.getItem('auth')).token;
            
            // Send to server via API
            const response = await fetch('/api/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    receiver: selectedContactId,
                    content
                })
            });

            if (!response.ok) {
                throw new Error('Failed to send message');
            }

            const data = await response.json();
            
            // Emit via socket
            socket.emit('send-private-message', {
                senderId: currentUser._id,
                receiverId: selectedContactId,
                content: data.message.content,
                _id: data.message._id,
                createdAt: data.message.createdAt
            });

            // Append locally
            appendMessage(data.message.content, true, data.message.createdAt);
            scrollToBottom();
            
            // Refresh contacts
            loadContacts();

        } catch (err) {
            console.error('Message send error:', err);
            alert('Failed to send message');
        }
    });

    async function loadContacts() {
        try {
            const token = JSON.parse(localStorage.getItem('auth')).token;
            const response = await fetch('/api/messages/contacts', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Failed to fetch contacts');
            
            const data = await response.json();
            renderContacts(data.contacts);
        } catch (err) {
            console.error('Error loading contacts:', err);
        }
    }

    function renderContacts(contacts) {
        contactsListEl.innerHTML = '';
        
        if (contacts.length === 0) {
            contactsListEl.innerHTML = `<div class="text-center text-neutral-300 mt-24">No conversations yet. Start a new chat from the Courses or Tutors page.</div>`;
            return;
        }

        contacts.forEach(contactObj => {
            const { user, latestMessage, unreadCount } = contactObj;
            
            // Format time
            const date = new Date(latestMessage.createdAt);
            const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            const div = document.createElement('div');
            div.className = `align-items-center justify-content-between hover-bg-neutral-20 rounded-8 transition-03 mb-16 flex gap-16 px-24 py-12 cursor-pointer ${selectedContactId === user._id ? 'bg-neutral-20' : ''}`;
            div.style.cursor = 'pointer';
            
            const avatar = user.avatar ? (user.avatar.startsWith('http') ? user.avatar : `http://localhost:5000/${user.avatar}`) : './images/thumbs/user-avatar.png';

            div.innerHTML = `
                <div class="align-items-center flex flex-wrap gap-12 pointer-events-none">
                    <img src="${avatar}" alt="${user.name}" class="h-40 w-40 rounded-circle object-fit-cover">
                    <div>
                        <h6 class="text-14 mb-0 font-medium text-neutral-500">${user.name}</h6>
                        <span class="text-12 fw-normal text-neutral-100 text-line-1 max-w-150-px">
                            ${latestMessage.sender === currentUser._id ? 'You: ' : ''}${latestMessage.content}
                        </span>
                    </div>
                </div>
                <div class="text-end pointer-events-none">
                    <span class="text-12 fw-normal block text-neutral-100 ${unreadCount > 0 ? 'mb-8' : ''}">
                        ${timeString}
                    </span>
                    ${unreadCount > 0 ? `<span class="text-12 bg-main-600 rounded-circle align-items-center justify-content-center inline-flex h-20 w-20 font-medium text-white">${unreadCount}</span>` : ''}
                </div>
            `;

            div.addEventListener('click', () => {
                selectContact(user._id, user.name);
                // Highlight active contact
                Array.from(contactsListEl.children).forEach(child => child.classList.remove('bg-neutral-20'));
                div.classList.add('bg-neutral-20');
            });

            contactsListEl.appendChild(div);
        });
    }

    async function selectContact(userId, userName) {
        selectedContactId = userId;
        
        if (chatUserNameEl) {
            chatUserNameEl.textContent = userName;
        }

        try {
            const token = JSON.parse(localStorage.getItem('auth')).token;
            const response = await fetch(`/api/messages/${userId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Failed to fetch messages');

            const data = await response.json();
            renderMessages(data.messages, userName);
            
            // Mark as read, refresh contacts to clear unread bubble
            loadContacts();
        } catch (err) {
            console.error('Error loading messages:', err);
        }
    }

    function renderMessages(messages, userName) {
        messagesContainerEl.innerHTML = '';
        
        messages.forEach(msg => {
            const isMe = msg.sender === currentUser._id;
            appendMessage(msg.content, isMe, msg.createdAt, isMe ? currentUser.name : userName);
        });

        scrollToBottom();
    }

    function appendMessage(content, isMe, timestamp, name) {
        const date = new Date(timestamp);
        const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        const div = document.createElement('div');
        div.className = isMe ? 'mb-24' : 'align-items-start flex w-100 gap-12 mb-24';
        
        if (isMe) {
            div.innerHTML = `
                <div class="text-end">
                    <span class="text-12 fw-normal mb-12 text-neutral-100 block">
                        ${timeString}
                    </span>
                    <p class="max-w-514-px text-14 fw-normal bg-main-600 text-white rounded-10 margin-inline-start-auto line-height-105 mb-12 px-20 py-16 text-start">
                        ${content}
                    </p>
                </div>
            `;
        } else {
            // Default avatar for other person
            const avatar = './images/thumbs/user-avatar.png';
            div.innerHTML = `
                <img src="${avatar}" alt="User" class="h-40 w-40 rounded-circle object-fit-cover">
                <div>
                    <span class="text-12 fw-normal mb-12 text-neutral-100 block">
                        ${name ? name + ', ' : ''}${timeString}
                    </span>
                    <p class="max-w-514-px text-14 fw-normal bg-neutral-20 rounded-10 line-height-105 mb-12 px-20 py-16 text-neutral-500">
                        ${content}
                    </p>
                </div>
            `;
        }
        
        messagesContainerEl.appendChild(div);
    }

    function scrollToBottom() {
        if (messagesContainerEl) {
            messagesContainerEl.scrollTop = messagesContainerEl.scrollHeight;
        }
    }
}
