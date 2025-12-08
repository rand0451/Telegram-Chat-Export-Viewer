// ==UserScript==
// @name         Telegram Chat Export Enhancer
// @version      2.0.1
// @description  Beautiful Telegram-like formatting for chat exports with dark/light theme and animations
// @match        file:///*
// @author 		 https://github.com/rand0451
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    // Check if this is a Telegram export page
    if (!document.querySelector('.page_wrap') && !document.querySelector('.history')) {
        return; // Exit if not a Telegram export
    }

    // Allow disabling via URL param (?enhancer=off) or localStorage flag
    try {
        const params = new URLSearchParams(window.location.search);
        const disabledParam = params.get('enhancer');
        const disabledStore = localStorage.getItem('telegram-enhancer-disabled');
        if ((disabledParam && disabledParam.toLowerCase() === 'off') || disabledStore === 'true') {
            console.log('[Telegram Enhancer] Disabled (param/store)');
            return;
        }
    } catch(e) {
        console.warn('[Telegram Enhancer] Disable check failed', e);
    }

    // Theme definitions
    const themes = {
        light: {
            bg: '#ffffff',
            bgSecondary: '#f4f4f5',
            bgHeader: '#ffffff',
            bgMessage: '#ffffff',
            bgMessageOut: '#effdde',
            bgService: '#f4f4f5',
            bgHover: '#f1f1f2',
            text: '#000000',
            textSecondary: '#707579',
            textLink: '#3390ec',
            border: '#dadce0',
            shadow: 'rgba(0, 0, 0, 0.08)',
            scrollbar: '#c1c1c1',
            scrollbarHover: '#a8a8a8'
        },
        dark: {
            bg: '#0e0e0e',
            bgSecondary: '#1c1c1e',
            bgHeader: '#17212b',
            bgMessage: '#182533',
            bgMessageOut: '#2b5278',
            bgService: '#1c1c1e',
            bgHover: '#242424',
            text: '#e4e4e7',
            textSecondary: '#8d969c',
            textLink: '#6ab7ff',
            border: '#2f2f2f',
            shadow: 'rgba(0, 0, 0, 0.3)',
            scrollbar: '#434343',
            scrollbarHover: '#5a5a5a'
        }
    };

    let currentTheme = localStorage.getItem('telegram-theme') || 'light';

    // Language definitions
    const translations = {
        en: {
            search: 'Search in chat...',
            all: 'All',
            text: '📝 Text',
            photo: '📷 Photos',
            video: '🎥 Videos',
            voice: '🎤 Voice',
            results: 'results',
            result: 'result',
            notFound: 'Nothing found',
            shown: 'Shown',
            messages: 'messages',
            copyText: '📋 Copy Text',
            reply: '↩️ Reply',
            forward: '➡️ Forward',
            select: '✓ Select',
            copyLink: '🔗 Copy Link',
            textCopied: 'Text copied',
            linkCopied: 'Link copied',
            selected: '✓ Selected',
            compactMode: '📦 Compact mode',
            normalMode: '📋 Normal mode',
            mediaHidden: '🖼️ Media hidden',
            mediaShown: '🖼️ Media shown',
            fontSize: '🔤 Font size',
            exportComplete: '💾 Export complete!',
            statistics: '📊 Chat Statistics',
            period: 'Period',
            close: 'Close',
            keyboard: '⌨️ Keyboard Shortcuts',
            search_key: 'Search',
            theme_key: 'Toggle theme',
            compact_key: 'Compact mode',
            media_key: 'Hide/show media',
            font_key: 'Font size',
            nav_key: 'Next/prev date',
            stats_key: 'Statistics',
            export_key: 'Export to JSON',
            nav_arrows: 'Start/end',
            close_key: 'Close',
            help_key: 'This help',
            tip: '💡 Right-click on message for context menu',
            welcome: '💬 Telegram Chat Enhancer ready! Press H for help',
            photos_label: 'Photos',
            videos_label: 'Videos',
            voices_label: 'Voices',
            links_label: 'Links',
            days_label: 'Days',
            language: '🌍 Language',
            favorite: '⭐ Add to Favorites',
            unfavorite: '⭐ Remove from Favorites',
            favoriteAdded: '⭐ Added to favorites',
            favoriteRemoved: '⭐ Removed from favorites',
            readingMode: '📖 Reading mode',
            resetFont: '↺ Reset font size',
            fontReset: 'Font size reset to default',
            focusMode: '🎯 Focus on message',
            exitFocus: 'Click anywhere to exit',
            focusActive: '🎯 Focus mode active',
            jumpToDate: '📅 Jump to date',
            searchByUser: '👤 Filter by user',
            bookmark: '🔖 Bookmark',
            bookmarks: '🔖 Bookmarks',
            removeBookmark: '🔖 Remove bookmark',
            bookmarkAdded: '🔖 Bookmarked',
            bookmarkRemoved: '🔖 Bookmark removed',
            noBookmarks: 'No bookmarks yet',
            progress: '📊 Reading progress',
            continueReading: '▶️ Continue reading',
            messageCount: 'messages',
            scrollProgress: 'Scroll',
            filterMessages: '🔍 Filter messages',
            quickActions: 'Quick actions',
            jumpTo: '🔢 Jump to #',
            jumpToMessage: 'Jump to message',
            jumpPlaceholder: 'Enter message number...',
            jumpGo: 'Go',
            cancel: 'Cancel',
            messageNotFound: 'Message not found',
            messageInfo: 'ℹ️ Message Info',
            wordCount: 'Words',
            charCount: 'Characters',
            hasMedia: 'Has media',
            timestamp: 'Timestamp'
        },
        ru: {
            search: 'Поиск в чате...',
            all: 'Все',
            text: '📝 Текст',
            photo: '📷 Фото',
            video: '🎥 Видео',
            voice: '🎤 Голос',
            results: 'результатов',
            result: 'результат',
            notFound: 'Ничего не найдено',
            shown: 'Показано',
            messages: 'сообщений',
            copyText: '📋 Копировать текст',
            reply: '↩️ Ответить',
            forward: '➡️ Переслать',
            select: '✓ Выбрать',
            copyLink: '🔗 Копировать ссылку',
            textCopied: 'Текст скопирован',
            linkCopied: 'Ссылка скопирована',
            selected: '✓ Выбрано',
            compactMode: '📦 Компактный режим',
            normalMode: '📋 Обычный режим',
            mediaHidden: '🖼️ Медиа скрыто',
            mediaShown: '🖼️ Медиа показано',
            fontSize: '🔤 Размер текста',
            exportComplete: '💾 Экспорт завершён!',
            statistics: '📊 Статистика чата',
            period: 'Период',
            close: 'Закрыть',
            keyboard: '⌨️ Горячие клавиши',
            search_key: 'Поиск',
            theme_key: 'Сменить тему',
            compact_key: 'Компактный режим',
            media_key: 'Скрыть/показать медиа',
            font_key: 'Размер текста',
            nav_key: 'След./пред. дата',
            stats_key: 'Статистика',
            export_key: 'Экспорт в JSON',
            nav_arrows: 'Начало/конец',
            close_key: 'Закрыть',
            help_key: 'Эта справка',
            tip: '💡 Правый клик на сообщении для контекстного меню',
            welcome: '💬 Telegram Chat Enhancer готов! Нажмите H для помощи',
            photos_label: 'Фото',
            videos_label: 'Видео',
            voices_label: 'Голосовых',
            links_label: 'Ссылок',
            days_label: 'Дней',
            language: '🌍 Язык',
            favorite: '⭐ В избранное',
            unfavorite: '⭐ Из избранного',
            favoriteAdded: '⭐ Добавлено в избранное',
            favoriteRemoved: '⭐ Удалено из избранного',
            readingMode: '📖 Режим чтения',
            resetFont: '↺ Сбросить размер шрифта',
            fontReset: 'Размер шрифта сброшен',
            focusMode: '🎯 Фокус на сообщении',
            exitFocus: 'Нажмите в любом месте для выхода',
            focusActive: '🎯 Режим фокусировки активен',
            jumpToDate: '📅 Перейти к дате',
            searchByUser: '👤 Фильтр по пользователю',
            bookmark: '🔖 Закладка',
            bookmarks: '🔖 Закладки',
            removeBookmark: '🔖 Удалить закладку',
            bookmarkAdded: '🔖 Добавлено в закладки',
            bookmarkRemoved: '🔖 Закладка удалена',
            noBookmarks: 'Пока нет закладок',
            progress: '📊 Прогресс чтения',
            continueReading: '▶️ Продолжить чтение',
            messageCount: 'сообщений',
            scrollProgress: 'Прокрутка',
            filterMessages: '🔍 Фильтр сообщений',
            quickActions: 'Быстрые действия',
            jumpTo: '🔢 Перейти к #',
            jumpToMessage: 'Перейти к сообщению',
            jumpPlaceholder: 'Введите номер сообщения...',
            jumpGo: 'Перейти',
            cancel: 'Отмена',
            messageNotFound: 'Сообщение не найдено',
            messageInfo: 'ℹ️ Инфо о сообщении',
            wordCount: 'Слов',
            charCount: 'Символов',
            hasMedia: 'Есть медиа',
            timestamp: 'Время'
        },
        ua: {
            search: 'Пошук у чаті...',
            all: 'Усі',
            text: '📝 Текст',
            photo: '📷 Фото',
            video: '🎥 Відео',
            voice: '🎤 Голос',
            results: 'результатів',
            result: 'результат',
            notFound: 'Нічого не знайдено',
            shown: 'Показано',
            messages: 'повідомлень',
            copyText: '📋 Копіювати текст',
            reply: '↩️ Відповісти',
            forward: '➡️ Переслати',
            select: '✓ Вибрати',
            copyLink: '🔗 Копіювати посилання',
            textCopied: 'Текст скопійовано',
            linkCopied: 'Посилання скопійовано',
            selected: '✓ Вибрано',
            compactMode: '📦 Компактний режим',
            normalMode: '📋 Звичайний режим',
            mediaHidden: '🖼️ Медіа приховано',
            mediaShown: '🖼️ Медіа показано',
            fontSize: '🔤 Розмір тексту',
            exportComplete: '💾 Експорт завершено!',
            statistics: '📊 Статистика чату',
            period: 'Період',
            close: 'Закрити',
            keyboard: '⌨️ Гарячі клавіші',
            search_key: 'Пошук',
            theme_key: 'Змінити тему',
            compact_key: 'Компактний режим',
            media_key: 'Сховати/показати медіа',
            font_key: 'Розмір тексту',
            nav_key: 'Наст./попер. дата',
            stats_key: 'Статистика',
            export_key: 'Експорт у JSON',
            nav_arrows: 'Початок/кінець',
            close_key: 'Закрити',
            help_key: 'Ця довідка',
            tip: '💡 Правий клік на повідомленні для контекстного меню',
            welcome: '💬 Telegram Chat Enhancer готовий! Натисніть H для допомоги',
            photos_label: 'Фото',
            videos_label: 'Відео',
            voices_label: 'Голосових',
            links_label: 'Посилань',
            days_label: 'Днів',
            language: '🌍 Мова',
            favorite: '⭐ До обраного',
            unfavorite: '⭐ З обраного',
            favoriteAdded: '⭐ Додано до обраного',
            favoriteRemoved: '⭐ Видалено з обраного',
            readingMode: '📖 Режим читання',
            resetFont: '↺ Скинути розмір шрифту',
            fontReset: 'Розмір шрифту скинуто',
            focusMode: '🎯 Фокус на повідомленні',
            exitFocus: 'Натисніть будь-де для виходу',
            focusActive: '🎯 Режим фокусування активний',
            jumpToDate: '📅 Перейти до дати',
            searchByUser: '👤 Фільтр по користувачу',
            bookmark: '🔖 Закладка',
            bookmarks: '🔖 Закладки',
            removeBookmark: '🔖 Видалити закладку',
            bookmarkAdded: '🔖 Додано до закладок',
            bookmarkRemoved: '🔖 Закладку видалено',
            noBookmarks: 'Поки немає закладок',
            progress: '📊 Прогрес читання',
            continueReading: '▶️ Продовжити читання',
            messageCount: 'повідомлень',
            scrollProgress: 'Прокрутка',
            filterMessages: '🔍 Фільтр повідомлень',
            quickActions: 'Швидкі дії',
            jumpTo: '🔢 Перейти до #',
            jumpToMessage: 'Перейти до повідомлення',
            jumpPlaceholder: 'Введіть номер повідомлення...',
            jumpGo: 'Перейти',
            cancel: 'Скасувати',
            messageNotFound: 'Повідомлення не знайдено',
            messageInfo: 'ℹ️ Інфо про повідомлення',
            wordCount: 'Слів',
            charCount: 'Символів',
            hasMedia: 'Є медіа',
            timestamp: 'Час'
        }
    };

    // Auto-detect language or use saved
    function detectLanguage() {
        const saved = localStorage.getItem('telegram-lang');
        if (saved && translations[saved]) return saved;
        
        const browserLang = navigator.language.toLowerCase();
        if (browserLang.startsWith('ru')) return 'ru';
        if (browserLang.startsWith('uk')) return 'ua';
        return 'en';
    }

    let currentLang = detectLanguage();
    const t = (key) => translations[currentLang][key] || translations['en'][key] || key;

    // Create search functionality with filters
    function createSearch() {
        const searchContainer = document.createElement('div');
        searchContainer.id = 'search-container';
        searchContainer.innerHTML = `
            <input type="text" id="search-input" placeholder="${t('search')}" />
            <div id="search-filters">
                <button class="filter-btn active" data-filter="all">${t('all')}</button>
                <button class="filter-btn" data-filter="text">${t('text')}</button>
                <button class="filter-btn" data-filter="photo">${t('photo')}</button>
                <button class="filter-btn" data-filter="video">${t('video')}</button>
                <button class="filter-btn" data-filter="voice">${t('voice')}</button>
            </div>
            <div id="search-results">0 ${t('results')}</div>
            <button id="search-close">✕</button>
        `;
        document.body.appendChild(searchContainer);

        // Filter functionality
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                applyFilter(btn.dataset.filter);
            });
        });

        const searchBtn = document.createElement('div');
        searchBtn.id = 'search-toggle';
        searchBtn.innerHTML = '🔍';
        searchBtn.title = t('search_key');
        document.body.appendChild(searchBtn);

        let searchVisible = false;
        searchBtn.addEventListener('click', () => {
            searchVisible = !searchVisible;
            searchContainer.classList.toggle('visible', searchVisible);
            if (searchVisible) {
                document.getElementById('search-input').focus();
            }
        });

        document.getElementById('search-close').addEventListener('click', () => {
            searchVisible = false;
            searchContainer.classList.remove('visible');
            document.getElementById('search-input').value = '';
            clearSearchHighlights();
        });

        let searchTimeout;
        document.getElementById('search-input').addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => performSearch(e.target.value), 300);
        });
    }

    function performSearch(query) {
        clearSearchHighlights();
        if (!query || query.length < 2) {
            document.getElementById('search-results').textContent = '0 результатов';
            return;
        }

        const messages = document.querySelectorAll('.message.default .text');
        let count = 0;
        const regex = new RegExp(query, 'gi');

        messages.forEach(msg => {
            const text = msg.textContent;
            if (regex.test(text)) {
                count++;
                msg.closest('.message').classList.add('search-match');
                msg.innerHTML = text.replace(regex, match => `<mark>${match}</mark>`);
            }
        });

        document.getElementById('search-results').textContent = 
            count > 0 ? `${count} ${count === 1 ? t('result') : t('results')}` : t('notFound');

        if (count > 0) {
            const firstMatch = document.querySelector('.search-match');
            if (firstMatch) {
                firstMatch.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }

    function clearSearchHighlights() {
        document.querySelectorAll('.search-match').forEach(el => el.classList.remove('search-match'));
        document.querySelectorAll('.message.default .text mark').forEach(mark => {
            const parent = mark.parentNode;
            parent.replaceChild(document.createTextNode(mark.textContent), mark);
        });
    }

    function applyFilter(filter) {
        const messages = document.querySelectorAll('.message.default');
        
        messages.forEach(msg => {
            msg.style.display = '';
            
            if (filter === 'all') return;
            
            const hasPhoto = msg.querySelector('.photo');
            const hasVideo = msg.querySelector('.video_file, .media_video');
            const hasVoice = msg.querySelector('.media_voice_message');
            const hasText = msg.querySelector('.text')?.textContent.trim().length > 0;
            
            let shouldShow = false;
            
            switch(filter) {
                case 'text':
                    shouldShow = hasText && !hasPhoto && !hasVideo && !hasVoice;
                    break;
                case 'photo':
                    shouldShow = hasPhoto;
                    break;
                case 'video':
                    shouldShow = hasVideo;
                    break;
                case 'voice':
                    shouldShow = hasVoice;
                    break;
            }
            
            if (!shouldShow) {
                msg.style.display = 'none';
            }
        });
        
        const visible = document.querySelectorAll('.message.default:not([style*="display: none"])').length;
        showToast(`${t('shown')}: ${visible} ${t('messages')}`);
    }

    // Create date navigation
    function createDateNavigation() {
        const dates = [];
        document.querySelectorAll('.message.service .body').forEach(el => {
            const dateText = el.textContent.trim();
            if (dateText && dateText !== 'History cleared') {
                dates.push({ text: dateText, element: el.closest('.message') });
            }
        });

        if (dates.length === 0) return;

        const nav = document.createElement('div');
        nav.id = 'date-navigation';
        nav.innerHTML = `
            <button id="date-nav-toggle">📅</button>
            <div id="date-list" class="hidden">
                ${dates.map((d, i) => `<div class="date-item" data-index="${i}">${d.text}</div>`).join('')}
            </div>
        `;
        document.body.appendChild(nav);

        document.getElementById('date-nav-toggle').addEventListener('click', () => {
            document.getElementById('date-list').classList.toggle('hidden');
        });

        document.querySelectorAll('.date-item').forEach((item, i) => {
            item.addEventListener('click', () => {
                dates[i].element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                dates[i].element.classList.add('selected');
                setTimeout(() => dates[i].element.classList.remove('selected'), 2000);
                document.getElementById('date-list').classList.add('hidden');
            });
        });
    }

    // Create scroll to top button
    function createScrollToTop() {
        const scrollBtn = document.createElement('div');
        scrollBtn.id = 'scroll-to-top';
        scrollBtn.innerHTML = '↑';
        scrollBtn.title = currentLang === 'en' ? 'Scroll to top' : currentLang === 'ru' ? 'Наверх' : 'Вгору';
        document.body.appendChild(scrollBtn);

        let isVisible = false;
        window.addEventListener('scroll', () => {
            const shouldShow = window.scrollY > 500;
            if (shouldShow !== isVisible) {
                isVisible = shouldShow;
                scrollBtn.classList.toggle('visible', isVisible);
            }
        });

        scrollBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Create message counter with statistics
    function createMessageCounter() {
        const messages = document.querySelectorAll('.message.default').length;
        const photos = document.querySelectorAll('.photo').length;
        const videos = document.querySelectorAll('.video_file, .media_video').length;
        const voices = document.querySelectorAll('.media_voice_message').length;
        
        const counter = document.createElement('div');
        counter.id = 'message-counter';
        counter.innerHTML = `📊 ${messages}`;
        const labels = currentLang === 'en' ? 
            ['Messages', 'Photos', 'Videos', 'Voices'] :
            currentLang === 'ru' ?
            ['Сообщений', 'Фото', 'Видео', 'Голосовых'] :
            ['Повідомлень', 'Фото', 'Відео', 'Голосових'];
        counter.title = `${labels[0]}: ${messages}\n${labels[1]}: ${photos}\n${labels[2]}: ${videos}\n${labels[3]}: ${voices}`;
        document.body.appendChild(counter);

        // Toggle detailed stats on click
        counter.addEventListener('click', () => {
            if (counter.classList.contains('expanded')) {
                counter.innerHTML = `📊 ${messages}`;
                counter.classList.remove('expanded');
            } else {
                counter.innerHTML = `📊 ${messages} | 📷 ${photos} | 🎥 ${videos} | 🎤 ${voices}`;
                counter.classList.add('expanded');
            }
        });
    }

    // Create context menu for messages
    function createContextMenu() {
        const menu = document.createElement('div');
        menu.id = 'context-menu';
        menu.innerHTML = `
            <div class="context-item" data-action="copy">${t('copyText')}</div>
            <div class="context-item" data-action="focus">${t('focusMode')}</div>
            <div class="context-separator"></div>
            <div class="context-item" data-action="bookmark">${t('bookmark')}</div>
            <div class="context-item" data-action="favorite">${t('favorite')}</div>
            <div class="context-separator"></div>
            <div class="context-item" data-action="info">${t('messageInfo')}</div>
            <div class="context-item" data-action="select">${t('select')}</div>
            <div class="context-item" data-action="link">${t('copyLink')}</div>
        `;
        document.body.appendChild(menu);

        let currentMessage = null;

        // Show context menu on right click
        document.querySelectorAll('.message.default').forEach(msg => {
            msg.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                currentMessage = msg;
                
                menu.style.left = e.pageX + 'px';
                menu.style.top = e.pageY + 'px';
                menu.classList.add('visible');
            });
        });

        // Handle context menu actions
        menu.querySelectorAll('.context-item').forEach(item => {
            item.addEventListener('click', () => {
                const action = item.dataset.action;
                handleContextAction(action, currentMessage);
                menu.classList.remove('visible');
            });
        });

        // Hide menu on click outside
        document.addEventListener('click', () => {
            menu.classList.remove('visible');
        });
    }

    function handleContextAction(action, message) {
        if (!message) return;

        switch(action) {
            case 'copy':
                const text = message.querySelector('.text')?.textContent || '';
                navigator.clipboard.writeText(text).then(() => {
                    showToast(t('textCopied'));
                });
                break;
            case 'focus':
                enableFocusMode(message);
                break;
            case 'bookmark':
                toggleBookmark(message);
                break;
            case 'favorite':
                toggleFavorite(message);
                break;
            case 'info':
                showMessageInfo(message);
                break;
            case 'link':
                const id = message.id;
                const link = `${window.location.href.split('#')[0]}#${id}`;
                navigator.clipboard.writeText(link).then(() => {
                    showToast(t('linkCopied'));
                });
                break;
            case 'select':
                message.classList.toggle('selected-permanent');
                updateSelectionCounter();
                break;
        }
    }

    // Save/load favorites
    function saveFavorites() {
        const favorites = Array.from(document.querySelectorAll('.favorite-message')).map(m => m.id);
        localStorage.setItem('telegram-favorites', JSON.stringify(favorites));
    }

    function loadFavorites() {
        const favorites = JSON.parse(localStorage.getItem('telegram-favorites') || '[]');
        favorites.forEach(id => {
            const msg = document.getElementById(id);
            if (msg) {
                msg.classList.add('favorite-message');
                addFavoriteStar(msg);
            }
        });
    }
    
    // Add favorite star indicator to message
    function addFavoriteStar(message) {
        if (message.querySelector('.favorite-star')) return; // Already has star
        
        const star = document.createElement('div');
        star.className = 'favorite-star';
        star.innerHTML = '⭐';
        star.title = t('unfavorite');
        
        star.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleFavorite(message);
        });
        
        const body = message.querySelector('.body');
        if (body) {
            body.appendChild(star);
        }
    }
    
    // Toggle favorite status
    function toggleFavorite(message) {
        const isFavorite = message.classList.contains('favorite-message');
        
        if (isFavorite) {
            // Remove from favorites
            message.classList.remove('favorite-message');
            const star = message.querySelector('.favorite-star');
            if (star) star.remove();
            showToast(t('favoriteRemoved'));
        } else {
            // Add to favorites
            message.classList.add('favorite-message');
            addFavoriteStar(message);
            showToast(t('favoriteAdded'));
        }
        
        saveFavorites();
    }
    
    // Add favorite toggle to all messages
    function addFavoriteStarsToMessages() {
        document.querySelectorAll('.message.default').forEach(msg => {
            const addBtn = document.createElement('div');
            addBtn.className = 'favorite-add-btn';
            addBtn.innerHTML = '☆';
            addBtn.title = t('favorite');
            
            addBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleFavorite(msg);
            });
            
            const body = msg.querySelector('.body');
            if (body && !msg.querySelector('.favorite-add-btn')) {
                body.appendChild(addBtn);
            }
        });
    }

    function updateSelectionCounter() {
        const selected = document.querySelectorAll('.selected-permanent').length;
        let counter = document.getElementById('selection-counter');
        
        if (selected > 0) {
            if (!counter) {
                counter = document.createElement('div');
                counter.id = 'selection-counter';
                document.body.appendChild(counter);
            }
            counter.innerHTML = `${t('selected')}: ${selected} <button id="clear-selection">✕</button>`;
            counter.classList.add('visible');
            
            document.getElementById('clear-selection')?.addEventListener('click', () => {
                document.querySelectorAll('.selected-permanent').forEach(el => 
                    el.classList.remove('selected-permanent')
                );
                counter.classList.remove('visible');
            });
        } else if (counter) {
            counter.classList.remove('visible');
        }
    }

    function showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => toast.classList.add('visible'), 10);
        setTimeout(() => {
            toast.classList.remove('visible');
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }

    // Create help button
    function createHelpButton() {
        const helpBtn = document.createElement('div');
        helpBtn.id = 'help-button';
        helpBtn.innerHTML = '?';
        helpBtn.title = t('help_key');
        document.body.appendChild(helpBtn);

        helpBtn.addEventListener('click', () => {
            showKeyboardHelp();
        });
    }
    
    // Create language selector dropdown
    function createLanguageSelector() {
        const langBtn = document.createElement('div');
        langBtn.id = 'language-selector';
        const flags = { en: '🇬🇧', ru: '🇷🇺', ua: '🇺🇦' };
        langBtn.innerHTML = flags[currentLang];
        langBtn.title = t('language');
        document.body.appendChild(langBtn);
        
        const dropdown = document.createElement('div');
        dropdown.id = 'language-dropdown';
        dropdown.innerHTML = `
            <div class="lang-option" data-lang="en">🇬🇧 English</div>
            <div class="lang-option" data-lang="ru">🇷🇺 Русский</div>
            <div class="lang-option" data-lang="ua">🇺🇦 Українська</div>
        `;
        document.body.appendChild(dropdown);
        
        langBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('visible');
        });
        
        document.querySelectorAll('.lang-option').forEach(option => {
            option.addEventListener('click', () => {
                currentLang = option.dataset.lang;
                localStorage.setItem('telegram-lang', currentLang);
                location.reload();
            });
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            dropdown.classList.remove('visible');
        });
    }

    // Create theme toggle button
    function createThemeToggle() {
        const toggle = document.createElement('div');
        toggle.id = 'theme-toggle';
        toggle.innerHTML = currentTheme === 'light' ? '🌙' : '☀️';
        toggle.title = t('theme_key');
        document.body.appendChild(toggle);

        toggle.addEventListener('click', () => {
            currentTheme = currentTheme === 'light' ? 'dark' : 'light';
            localStorage.setItem('telegram-theme', currentTheme);
            applyTheme();
            toggle.innerHTML = currentTheme === 'light' ? '🌙' : '☀️';
        });
    }

    // Apply theme
    function applyTheme() {
        const theme = themes[currentTheme];
        const root = document.documentElement;

        Object.entries(theme).forEach(([key, value]) => {
            root.style.setProperty(`--${key}`, value);
        });

        document.body.setAttribute('data-theme', currentTheme);
    }

    // Add modern styles
    function addStyles() {
        const styleEl = document.createElement('style');
        styleEl.textContent = `
        :root {
            --transition-speed: 0.2s;
        }

        * {
            box-sizing: border-box;
        }

        body {
            background: var(--bg) !important;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
            color: var(--text) !important;
            margin: 0;
            padding: 0;
            transition: background var(--transition-speed) ease, color var(--transition-speed) ease;
            scroll-behavior: smooth;
        }
        
        html {
            scroll-behavior: smooth;
        }
        
        /* Custom scrollbar styling */
        ::-webkit-scrollbar {
            width: 10px;
            height: 10px;
        }
        
        ::-webkit-scrollbar-track {
            background: var(--bgSecondary);
        }
        
        ::-webkit-scrollbar-thumb {
            background: var(--scrollbar);
            border-radius: 5px;
            transition: background 0.2s ease;
        }
        
        ::-webkit-scrollbar-thumb:hover {
            background: var(--scrollbarHover);
        }
        
        /* Smooth selection */
        ::selection {
            background: var(--textLink);
            color: white;
        }

        /* Theme toggle button */
        #theme-toggle {
            position: fixed;
            top: 80px;
            right: 20px;
            width: 50px;
            height: 50px;
            background: var(--bgMessage);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            cursor: pointer;
            z-index: 1000;
            box-shadow: 0 4px 12px var(--shadow);
            transition: transform 0.2s ease, background 0.2s ease;
            user-select: none;
        }

        #theme-toggle:hover {
            transform: scale(1.1);
            background: var(--bgHover);
        }

        #theme-toggle:active {
            transform: scale(0.95);
        }

        /* Help button */
        #help-button {
            position: fixed;
            top: 20px;
            right: 20px;
            width: 40px;
            height: 40px;
            background: var(--textLink);
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            font-weight: bold;
            cursor: pointer;
            z-index: 1001;
            box-shadow: 0 4px 12px var(--shadow);
            transition: transform 0.2s ease, background 0.2s ease;
            user-select: none;
        }

        #help-button:hover {
            transform: scale(1.1);
            background: var(--textLink);
            opacity: 0.9;
        }

        #help-button:active {
            transform: scale(0.95);
        }
        
        /* Language dropdown styles (used inside Help) */
        .help-language {
            position: relative;
            display: inline-block;
        }
        .help-language .lang-button {
            padding: 10px 14px;
            border-radius: 12px;
            border: 1px solid var(--border);
            background: var(--bgMessage);
            color: var(--text);
            cursor: pointer;
            font-size: 14px;
            box-shadow: 0 4px 12px var(--shadow);
        }
        .help-language .lang-button:hover {
            background: var(--bgHover);
        }
        .help-language .lang-dropdown {
            position: absolute;
            top: calc(100% + 8px);
            right: 0;
            background: var(--bgMessage);
            border-radius: 12px;
            box-shadow: 0 12px 40px var(--shadow);
            min-width: 160px;
            opacity: 0;
            transform: translateY(-10px) scale(0.95);
            pointer-events: none;
            transition: all 0.2s ease;
            overflow: hidden;
            border: 1px solid var(--border);
            backdrop-filter: blur(10px);
            z-index: 5;
        }
        .help-language .lang-dropdown.visible {
            opacity: 1;
            transform: translateY(0) scale(1);
            pointer-events: all;
        }
        
        .lang-option {
            padding: 14px 18px;
            cursor: pointer;
            transition: all 0.2s ease;
            color: var(--text);
            font-size: 14px;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 10px;
            position: relative;
        }
        
        .lang-option::before {
            content: '';
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            width: 3px;
            background: var(--textLink);
            transform: scaleY(0);
            transition: transform 0.2s ease;
        }
        
        .lang-option:hover {
            background: var(--bgHover);
            padding-left: 22px;
        }
        
        .lang-option:hover::before {
            transform: scaleY(1);
        }
        
        .lang-option:active {
            background: var(--bgSecondary);
            transform: scale(0.98);
        }

        /* Language selector in help */
        #help-lang-selector {
            display: flex;
            gap: 12px;
            justify-content: center;
            margin: 16px 0;
        }

        #help-lang-selector .lang-item {
            background: var(--bgSecondary);
            border: 2px solid var(--border);
            border-radius: 8px;
            padding: 12px 20px;
            cursor: pointer;
            color: var(--text);
            font-size: 14px;
            transition: all 0.2s ease;
            font-weight: 500;
        }

        #help-lang-selector .lang-item:hover {
            background: var(--bgHover);
            border-color: var(--textLink);
        }

        #help-lang-selector .lang-item.active {
            background: var(--textLink);
            color: white;
            border-color: var(--textLink);
        }

        /* Help sections */
        .help-section {
            margin-bottom: 24px;
        }

        .help-section h3 {
            color: var(--text);
            margin: 0 0 12px 0;
            font-size: 18px;
            border-bottom: 2px solid var(--border);
            padding-bottom: 8px;
        }

        /* Language toggle button - remove old styles */
        #lang-toggle {
            display: none;
        }

        /* Favorite messages */
        .favorite-message {
            position: relative;
        }
        
        /* Favorite star indicator (shown when message is favorited) */
        .favorite-star {
            position: absolute;
            top: 6px;
            left: 6px;
            font-size: 14px;
            cursor: pointer;
            z-index: 10;
            opacity: 0.85;
            transition: all 0.2s ease;
            filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
            line-height: 1;
        }
        
        .favorite-star:hover {
            transform: scale(1.3) rotate(15deg);
            opacity: 1;
            filter: drop-shadow(0 3px 6px rgba(255, 215, 0, 0.4));
        }
        
        /* Favorite add button (hollow star, appears on hover) */
        .favorite-add-btn {
            position: absolute;
            top: 6px;
            left: 6px;
            font-size: 15px;
            cursor: pointer;
            z-index: 10;
            opacity: 0;
            transition: all 0.2s ease;
            color: var(--textSecondary);
            line-height: 1;
        }
        
        .message.default:hover .favorite-add-btn {
            opacity: 0.6;
            animation: subtlePulse 2s ease-in-out infinite;
        }
        
        .message.default .favorite-add-btn:hover {
            opacity: 1;
            transform: scale(1.3);
            color: #ffd700;
            animation: none;
        }
        
        @keyframes subtlePulse {
            0%, 100% { opacity: 0.6; }
            50% { opacity: 0.8; }
        }
        
        /* Hide add button when message already has favorite star */
        .favorite-message .favorite-add-btn {
            display: none;
        }

        /* Reading mode */
        body.reading-mode .page_header,
        body.reading-mode #theme-toggle,
        body.reading-mode #search-toggle,
        body.reading-mode #date-navigation,
        body.reading-mode #scroll-to-top,
        body.reading-mode #language-selector,
        body.reading-mode #message-counter {
            opacity: 0.2;
            pointer-events: none;
        }

        body.reading-mode #help-button {
            opacity: 1;
            pointer-events: all;
        }

        body.reading-mode .userpic,
        body.reading-mode .from_name {
            display: none;
        }

        body.reading-mode .message.default .body {
            margin-left: 0;
            max-width: 700px;
        }

        /* Search container */
        #search-container {
            position: fixed;
            top: 70px;
            right: -350px;
            width: 320px;
            background: var(--bgMessage);
            border-radius: 12px;
            padding: 16px;
            box-shadow: 0 8px 24px var(--shadow);
            z-index: 1001;
            transition: right 0.3s ease;
        }

        #search-container.visible {
            right: 20px;
        }

        #search-input {
            width: 100%;
            padding: 12px;
            border: 2px solid var(--border);
            border-radius: 8px;
            background: var(--bg);
            color: var(--text);
            font-size: 14px;
            outline: none;
            transition: border-color 0.2s ease;
        }

        #search-input:focus {
            border-color: var(--textLink);
        }

        #search-results {
            margin-top: 8px;
            color: var(--textSecondary);
            font-size: 13px;
        }

        #search-close {
            position: absolute;
            top: 8px;
            right: 8px;
            background: transparent;
            border: none;
            color: var(--textSecondary);
            font-size: 20px;
            cursor: pointer;
            padding: 4px 8px;
            border-radius: 4px;
            transition: background 0.2s ease;
        }

        #search-close:hover {
            background: var(--bgHover);
        }

        #search-toggle {
            position: fixed;
            top: 140px;
            right: 20px;
            width: 50px;
            height: 50px;
            background: var(--bgMessage);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            cursor: pointer;
            z-index: 1000;
            box-shadow: 0 4px 12px var(--shadow);
            transition: transform 0.2s ease, background 0.2s ease;
            user-select: none;
        }

        #search-toggle:hover {
            transform: scale(1.1);
            background: var(--bgHover);
        }

        .search-match {
            background: rgba(255, 200, 50, 0.15) !important;
            border-left: 3px solid #ffc832;
        }

        mark {
            background: #ffc832;
            color: #000;
            padding: 2px 4px;
            border-radius: 3px;
            font-weight: 600;
        }

        /* Scroll to top button */
        #scroll-to-top {
            position: fixed;
            bottom: 30px;
            right: 30px;
            width: 50px;
            height: 50px;
            background: var(--textLink);
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            font-weight: bold;
            cursor: pointer;
            z-index: 999;
            box-shadow: 0 4px 12px var(--shadow);
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.3s ease, transform 0.2s ease;
        }

        #scroll-to-top.visible {
            opacity: 1;
            pointer-events: all;
        }

        #scroll-to-top:hover {
            transform: scale(1.1) translateY(-2px);
        }

        #scroll-to-top:active {
            transform: scale(0.95);
        }

        /* Message counter */
        #message-counter {
            position: fixed;
            bottom: 30px;
            left: 30px;
            background: var(--bgMessage);
            color: var(--text);
            padding: 12px 16px;
            border-radius: 20px;
            font-size: 13px;
            font-weight: 600;
            box-shadow: 0 4px 12px var(--shadow);
            z-index: 999;
            cursor: default;
            user-select: none;
            transition: transform 0.2s ease;
        }

        #message-counter:hover {
            transform: scale(1.05);
        }

        #message-counter.expanded {
            font-size: 11px;
            padding: 10px 14px;
        }

        /* Context menu */
        #context-menu {
            position: absolute;
            background: var(--bgMessage);
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2), 0 0 0 1px var(--border);
            padding: 6px;
            z-index: 10001;
            opacity: 0;
            pointer-events: none;
            transform: scale(0.92) translateY(-8px);
            transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
            min-width: 200px;
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
        }

        #context-menu.visible {
            opacity: 1;
            pointer-events: all;
            transform: scale(1) translateY(0);
        }

        .context-item {
            padding: 10px 14px;
            cursor: pointer;
            color: var(--text);
            font-size: 14px;
            font-weight: 500;
            transition: all 0.15s ease;
            white-space: nowrap;
            border-radius: 8px;
            margin: 2px 0;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .context-item:hover {
            background: var(--bgHover);
            transform: translateX(2px);
        }

        .context-item:active {
            transform: scale(0.98);
        }

        .context-separator {
            height: 1px;
            background: var(--border);
            margin: 6px 8px;
        }

        /* Quick actions toolbar */
        #quick-actions {
            position: fixed;
            bottom: 70px;
            right: 20px;
            transform: translateY(100px);
            background: var(--bgMessage);
            border-radius: 12px;
            padding: 6px;
            display: flex;
            flex-direction: column;
            gap: 4px;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
            z-index: 4000;
            opacity: 0;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
        }

        #quick-actions.visible {
            opacity: 1;
            transform: translateY(0);
        }

        .quick-action-btn {
            padding: 8px;
            background: transparent;
            border: none;
            border-radius: 10px;
            cursor: pointer;
            font-size: 18px;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--text);
            width: 36px;
            height: 36px;
        }

        .quick-action-btn:hover {
            background: var(--bgHover);
            transform: scale(1.1);
        }

        .quick-action-btn:active {
            transform: scale(0.95);
        }

        /* Jump to message modal */
        #jump-modal {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.3s ease;
        }

        #jump-modal.visible {
            opacity: 1;
            pointer-events: all;
        }

        .jump-content {
            background: var(--bgMessage);
            border-radius: 16px;
            padding: 24px;
            min-width: 320px;
            box-shadow: 0 12px 48px rgba(0, 0, 0, 0.3);
            transform: scale(0.9);
            transition: transform 0.3s ease;
        }

        #jump-modal.visible .jump-content {
            transform: scale(1);
        }

        .jump-content h3 {
            margin: 0 0 16px 0;
            color: var(--text);
            font-size: 18px;
        }

        .jump-content input {
            width: 100%;
            padding: 12px 16px;
            border: 2px solid var(--border);
            border-radius: 12px;
            background: var(--bg);
            color: var(--text);
            font-size: 14px;
            font-family: inherit;
            outline: none;
            transition: border 0.2s ease;
        }

        .jump-content input:focus {
            border-color: var(--textLink);
        }

        .jump-buttons {
            display: flex;
            gap: 8px;
            margin-top: 16px;
        }

        .jump-buttons button {
            flex: 1;
            padding: 10px;
            border: none;
            border-radius: 10px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .jump-go {
            background: var(--textLink);
            color: white;
        }

        .jump-go:hover {
            opacity: 0.9;
            transform: scale(1.02);
        }

        .jump-cancel {
            background: var(--bgHover);
            color: var(--text);
        }

        .jump-cancel:hover {
            background: var(--border);
        }

        /* Message info modal */
        #message-info-modal {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.6);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.3s ease;
        }

        #message-info-modal.visible {
            opacity: 1;
            pointer-events: all;
        }

        .message-info-content {
            background: var(--bgMessage);
            border-radius: 20px;
            padding: 28px;
            min-width: 380px;
            max-width: 500px;
            box-shadow: 0 16px 64px rgba(0, 0, 0, 0.4);
            transform: scale(0.9);
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        #message-info-modal.visible .message-info-content {
            transform: scale(1);
        }

        .message-info-content h3 {
            margin: 0 0 20px 0;
            color: var(--text);
            font-size: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .info-row {
            display: flex;
            justify-content: space-between;
            padding: 12px 0;
            border-bottom: 1px solid var(--border);
            color: var(--text);
            font-size: 14px;
        }

        .info-row:last-child {
            border-bottom: none;
        }

        .info-label {
            font-weight: 600;
            color: var(--textSecondary);
        }

        .info-value {
            font-weight: 500;
        }

        .info-close-btn {
            margin-top: 20px;
            width: 100%;
            padding: 12px;
            background: var(--textLink);
            color: white;
            border: none;
            border-radius: 12px;
            font-size: 15px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .info-close-btn:hover {
            opacity: 0.9;
            transform: scale(1.02);
        }

        /* Improved message hover effect */
        .message.default:hover {
            background: var(--bgHover);
            transform: translateX(4px);
        }

        /* Smooth animations for all interactive elements */
        .message.default,
        .context-item,
        .quick-action-btn,
        button {
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Selection counter */
        #selection-counter {
            position: fixed;
            top: 80px;
            left: 50%;
            transform: translateX(-50%) translateY(-100px);
            background: var(--textLink);
            color: white;
            padding: 12px 20px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
            box-shadow: 0 4px 12px var(--shadow);
            z-index: 1001;
            opacity: 0;
            pointer-events: none;
            transition: transform 0.3s ease, opacity 0.3s ease;
        }

        #selection-counter.visible {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
            pointer-events: all;
        }

        #clear-selection {
            background: rgba(255, 255, 255, 0.3);
            border: none;
            color: white;
            padding: 4px 10px;
            border-radius: 12px;
            margin-left: 10px;
            cursor: pointer;
            font-weight: 600;
            transition: background 0.2s ease;
        }

        #clear-selection:hover {
            background: rgba(255, 255, 255, 0.4);
        }

        .selected-permanent {
            background: rgba(100, 150, 255, 0.15) !important;
            border-left: 3px solid var(--textLink);
        }

        /* Ensure favorite controls remain interactive when selected */
        .selected-permanent .favorite-add-btn,
        .selected-permanent .favorite-star {
            opacity: 0.9;
            pointer-events: all;
            z-index: 20;
        }

        /* Toast notifications */
        .toast {
            position: fixed;
            bottom: 100px;
            left: 50%;
            transform: translateX(-50%) translateY(100px);
            background: linear-gradient(135deg, rgba(0, 0, 0, 0.9), rgba(40, 40, 40, 0.9));
            color: white;
            padding: 14px 28px;
            border-radius: 24px;
            font-size: 14px;
            font-weight: 500;
            z-index: 10002;
            opacity: 0;
            transition: transform 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55), opacity 0.3s ease;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .toast.visible {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
        }

        /* Search filters */
        #search-filters {
            display: flex;
            gap: 6px;
            margin: 12px 0 8px 0;
            flex-wrap: wrap;
        }

        .filter-btn {
            padding: 6px 12px;
            background: var(--bgSecondary);
            border: 1px solid var(--border);
            border-radius: 16px;
            color: var(--text);
            font-size: 12px;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .filter-btn:hover {
            background: var(--bgHover);
        }

        .filter-btn.active {
            background: var(--textLink);
            color: white;
            border-color: var(--textLink);
        }

        /* Date navigation */
        #date-navigation {
            position: fixed;
            top: 200px;
            right: 20px;
            z-index: 1000;
        }

        #date-nav-toggle {
            width: 50px;
            height: 50px;
            background: var(--bgMessage);
            border: none;
            border-radius: 50%;
            font-size: 24px;
            cursor: pointer;
            box-shadow: 0 4px 12px var(--shadow);
            transition: transform 0.2s ease, background 0.2s ease;
        }

        #date-nav-toggle:hover {
            transform: scale(1.1);
            background: var(--bgHover);
        }

        #date-list {
            position: absolute;
            right: 60px;
            top: 0;
            background: var(--bgMessage);
            border-radius: 12px;
            padding: 8px 0;
            box-shadow: 0 4px 16px var(--shadow);
            max-height: 400px;
            overflow-y: auto;
            min-width: 200px;
            opacity: 1;
            transform: scale(1);
            transition: opacity 0.2s ease, transform 0.2s ease;
        }

        #date-list.hidden {
            opacity: 0;
            transform: scale(0.95);
            pointer-events: none;
        }

        .date-item {
            padding: 10px 16px;
            cursor: pointer;
            color: var(--text);
            font-size: 13px;
            transition: background 0.1s ease;
        }

        .date-item:hover {
            background: var(--bgHover);
        }

        @media (max-width: 768px) {
            #date-navigation {
                top: 170px;
                right: 10px;
            }

            #date-nav-toggle {
                width: 44px;
                height: 44px;
                font-size: 20px;
            }

            #date-list {
                right: 50px;
            }
        }

        /* Page wrap */
        .page_wrap {
            background: var(--bg) !important;
            color: var(--text) !important;
            min-height: 100vh;
        }

        .page_wrap a {
            color: var(--textLink) !important;
            text-decoration: none;
            transition: opacity 0.2s ease;
        }

        .page_wrap a:hover {
            opacity: 0.8;
            text-decoration: none;
        }

        /* Header */
        .page_header {
            background: var(--bgHeader) !important;
            border-bottom: 1px solid var(--border) !important;
            backdrop-filter: blur(20px);
            box-shadow: 0 2px 8px var(--shadow);
            transition: background var(--transition-speed) ease;
        }

        .page_header .text {
            color: var(--text) !important;
            font-weight: 600 !important;
        }

        /* Chat body */
        .page_body {
            background: var(--bgSecondary) !important;
            padding-bottom: 40px;
        }

        /* History */
        .history {
            padding: 20px 0;
        }

        /* Service messages (dates, system messages) */
        .message.service {
            padding: 15px 24px;
            margin: 10px 0;
            opacity: 0;
            animation: fadeIn 0.4s ease forwards;
        }

        .message.service .body {
            background: var(--bgService);
            color: var(--textSecondary) !important;
            padding: 6px 12px;
            border-radius: 12px;
            display: inline-block;
            font-size: 13px;
            font-weight: 500;
            box-shadow: 0 1px 2px var(--shadow);
        }

        /* Messages */
        .message.default {
            margin: 4px 0;
            padding: 8px 10px;
            opacity: 0;
            animation: fadeSlideIn 0.3s ease forwards;
            transition: background 0.2s ease;
        }

        .message.default:hover {
            background: var(--bgHover) !important;
            border-radius: 8px;
            transform: translateX(2px);
        }
        
        /* Date becomes more visible on hover */
        .message.default .date {
            transition: opacity 0.2s ease, color 0.2s ease;
            opacity: 0.7;
        }
        
        .message.default:hover .date {
            opacity: 1;
            color: var(--textLink);
        }

        .message.default.joined {
            margin-top: -4px;
        }

        /* Message bubbles */
        .message.default .body {
            background: var(--bgMessage);
            border-radius: 12px;
            padding: 8px 12px;
            box-shadow: 0 1px 2px var(--shadow);
            transition: transform 0.2s ease, box-shadow 0.2s ease;
            margin-left: 58px;
            position: relative;
            max-width: 420px;
        }

        .message.default .body::before {
            content: '';
            position: absolute;
            left: -8px;
            top: 10px;
            width: 0;
            height: 0;
            border-style: solid;
            border-width: 0 8px 8px 0;
            border-color: transparent var(--bgMessage) transparent transparent;
            opacity: 0;
            transition: opacity 0.2s ease;
        }

        .message.default:hover .body::before {
            opacity: 1;
        }

        .message.default:hover .body {
            box-shadow: 0 2px 8px var(--shadow);
        }

        /* Outgoing messages (if needed) */
        .message.default[class*="out"] .body {
            background: var(--bgMessageOut) !important;
        }

        /* From name */
        .message.default .from_name {
            color: var(--textLink) !important;
            font-weight: 600;
            font-size: 14px;
            padding-bottom: 4px;
        }

        /* Message text */
        .message.default .text {
            color: var(--text) !important;
            line-height: 1.5;
            word-wrap: break-word;
            font-size: var(--message-font-size, 14px);
        }
        
        /* Compact mode */
        body.compact-mode .message.default {
            padding: 4px 10px;
            margin: 2px 0;
        }
        
        body.compact-mode .message.default .body {
            padding: 6px 10px;
            margin-left: 48px;
        }
        
        body.compact-mode .message.default .text {
            font-size: calc(var(--message-font-size, 14px) - 1px);
            line-height: 1.4;
        }
        
        body.compact-mode .userpic {
            width: 36px !important;
            height: 36px !important;
        }
        
        body.compact-mode .userpic .initials {
            line-height: 36px !important;
            font-size: 14px !important;
        }
        
        body.compact-mode .from_name {
            font-size: 13px !important;
            padding-bottom: 2px;
        }
        
        body.compact-mode .message.service {
            padding: 8px 24px;
            margin: 6px 0;
        }
        
        /* Hide media mode */
        body.hide-media .photo,
        body.hide-media .video_file,
        body.hide-media .video_file_wrap,
        body.hide-media .animated,
        body.hide-media .sticker,
        body.hide-media .media_video {
            display: none !important;
        }

        /* Date/time */
        .message.default .date {
            color: var(--textSecondary) !important;
            font-size: 11px;
            padding-left: 8px;
            opacity: 0.8;
            font-weight: 500;
        }

        .message.default:hover .date {
            opacity: 1;
        }

        /* User pics */
        .userpic {
            transition: transform 0.2s ease;
            box-shadow: 0 2px 4px var(--shadow);
        }

        .userpic:hover {
            transform: scale(1.05);
        }

        .userpic .initials {
            font-weight: 600;
        }

        /* Media */
        .media_wrap {
            padding-top: 6px;
        }

        .media {
            background: var(--bgSecondary) !important;
            border-radius: 12px;
            padding: 8px 12px !important;
            margin: 0 !important;
            transition: transform 0.2s ease, background 0.2s ease;
        }

        .media:hover {
            background: var(--bgHover) !important;
            transform: translateY(-2px);
        }

        .media .title {
            color: var(--text) !important;
            font-weight: 600;
        }

        .media .description {
            color: var(--textSecondary) !important;
        }

        .media .status {
            color: var(--textSecondary) !important;
        }

        /* Photos and videos */
        .photo, .video_file, .animated, .sticker {
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 2px 8px var(--shadow);
            transition: transform 0.2s ease, box-shadow 0.2s ease;
            max-width: 100%;
            height: auto;
        }

        .photo:hover, .video_file:hover, .animated:hover {
            transform: scale(1.02);
            box-shadow: 0 4px 16px var(--shadow);
        }

        .video_file_wrap, .animated_wrap {
            position: relative;
            border-radius: 12px;
            overflow: hidden;
        }

        /* Video overlay */
        .video_play_bg {
            background: rgba(0, 0, 0, 0.6) !important;
            backdrop-filter: blur(4px);
            transition: transform 0.2s ease;
        }

        .video_file_wrap:hover .video_play_bg,
        .animated_wrap:hover .video_play_bg {
            transform: scale(1.1);
        }

        .video_duration {
            background: rgba(0, 0, 0, 0.6) !important;
            backdrop-filter: blur(4px);
            font-weight: 600;
        }

        /* Bot buttons */
        .bot_buttons_table {
            margin-top: 8px;
        }

        .bot_button {
            background: var(--textLink) !important;
            color: var(--bg) !important;
            padding: 10px 16px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 14px;
            transition: transform 0.2s ease, background 0.2s ease;
            cursor: pointer;
        }

        .bot_button:hover {
            transform: translateY(-2px);
            opacity: 0.9;
        }

        .bot_button:active {
            transform: translateY(0);
        }

        .bot_button a {
            color: var(--bg) !important;
            display: block;
            text-decoration: none !important;
        }

        /* Code blocks */
        code {
            background: var(--bgSecondary) !important;
            color: var(--textLink) !important;
            border-radius: 4px;
            padding: 2px 6px;
            font-family: 'SF Mono', Consolas, monospace;
            font-size: 13px;
        }

        pre {
            background: var(--bgSecondary) !important;
            color: var(--text) !important;
            border: 1px solid var(--border) !important;
            border-radius: 8px;
            padding: 12px;
            overflow-x: auto;
        }

        /* Spoilers */
        .spoiler.hidden {
            background: var(--bgSecondary) !important;
            transition: background 0.2s ease;
        }

        .spoiler.hidden:hover {
            background: var(--bgHover) !important;
        }

        /* Reactions */
        .reactions .reaction {
            background: var(--bgSecondary) !important;
            color: var(--textLink) !important;
            border: 1px solid var(--border);
            padding: 4px 10px;
            margin: 4px 4px 4px 0;
            transition: transform 0.2s ease, background 0.2s ease;
        }

        .reactions .reaction:hover {
            transform: scale(1.05);
            background: var(--bgHover) !important;
        }

        .reactions .reaction.active {
            background: var(--textLink) !important;
            color: var(--bg) !important;
            border-color: var(--textLink);
        }

        /* Scrollbar */
        ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
        }

        ::-webkit-scrollbar-track {
            background: var(--bg);
        }

        ::-webkit-scrollbar-thumb {
            background: var(--scrollbar);
            border-radius: 4px;
            transition: background 0.2s ease;
        }

        ::-webkit-scrollbar-thumb:hover {
            background: var(--scrollbarHover);
        }

        /* Animations */
        @keyframes fadeIn {
            from {
                opacity: 0;
            }
            to {
                opacity: 1;
            }
        }

        @keyframes fadeSlideIn {
            from {
                opacity: 0;
                transform: translateY(10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        /* Stagger animation for messages */
        .message.default:nth-child(1) { animation-delay: 0.05s; }
        .message.default:nth-child(2) { animation-delay: 0.1s; }
        .message.default:nth-child(3) { animation-delay: 0.15s; }
        .message.default:nth-child(4) { animation-delay: 0.2s; }
        .message.default:nth-child(5) { animation-delay: 0.25s; }
        .message.default:nth-child(6) { animation-delay: 0.3s; }
        .message.default:nth-child(7) { animation-delay: 0.35s; }
        .message.default:nth-child(8) { animation-delay: 0.4s; }
        .message.default:nth-child(9) { animation-delay: 0.45s; }
        .message.default:nth-child(10) { animation-delay: 0.5s; }

        .message.service:nth-child(odd) { animation-delay: 0.1s; }
        .message.service:nth-child(even) { animation-delay: 0.2s; }

        /* Selected message highlight */
        div.selected {
            background: var(--bgHover) !important;
            border-radius: 8px;
            animation: pulse 1s ease;
        }

        @keyframes pulse {
            0%, 100% {
                transform: scale(1);
            }
            50% {
                transform: scale(1.02);
            }
        }

        /* Details text */
        .details {
            color: var(--textSecondary) !important;
        }

        .bold {
            color: var(--text) !important;
        }

        /* Typing indicator */
        .typing-indicator {
            display: inline-flex;
            align-items: center;
            padding: 12px 16px;
            background: var(--bgMessage);
            border-radius: 18px;
            margin: 10px 0;
        }

        .typing-indicator span {
            height: 8px;
            width: 8px;
            background: var(--textSecondary);
            border-radius: 50%;
            display: inline-block;
            margin: 0 2px;
            animation: typing 1.4s infinite;
        }

        .typing-indicator span:nth-child(2) {
            animation-delay: 0.2s;
        }

        .typing-indicator span:nth-child(3) {
            animation-delay: 0.4s;
        }

        @keyframes typing {
            0%, 60%, 100% {
                transform: translateY(0);
                opacity: 0.7;
            }
            30% {
                transform: translateY(-10px);
                opacity: 1;
            }
        }
        
        /* iOS-style Focus Mode with Blur Background */
        .focus-mode-active {
            position: relative;
        }

        .focus-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.65);
            backdrop-filter: blur(10px) saturate(160%);
            -webkit-backdrop-filter: blur(10px) saturate(160%);
            z-index: 5000;
            opacity: 0;
            transition: opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            pointer-events: all;
        }

        .focus-overlay.visible {
            opacity: 1;
        }

        /* Wrapper for focused message to isolate it from blur */
        .message-focused {
            position: relative !important;
            z-index: 5001 !important;
            transform: scale(1.08) translateZ(0) !important;
            box-shadow: 0 20px 80px rgba(0, 0, 0, 0.9), 
                        0 0 0 5px var(--textLink),
                        0 0 40px rgba(52, 144, 236, 0.8) !important;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
            animation: focusPulse 3s ease-in-out infinite !important;
            border-radius: 16px !important;
            background: #ffffff !important;
            filter: none !important;
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
            will-change: transform, box-shadow;
            isolation: isolate;
        }

        /* Dark theme focused message */
        [data-theme="dark"] .message-focused {
            background: #1e1e1e !important;
        }

        /* Ensure all text and content is visible */
        .message-focused,
        .message-focused *,
        .message-focused .text,
        .message-focused .from_name,
        .message-focused .body {
            color: #000000 !important;
            opacity: 1 !important;
            visibility: visible !important;
        }

        [data-theme="dark"] .message-focused,
        [data-theme="dark"] .message-focused *,
        [data-theme="dark"] .message-focused .text,
        [data-theme="dark"] .message-focused .from_name,
        [data-theme="dark"] .message-focused .body {
            color: #e4e4e7 !important;
        }

        @keyframes focusPulse {
            0%, 100% {
                box-shadow: 0 20px 80px rgba(0, 0, 0, 0.9), 
                            0 0 0 5px var(--textLink),
                            0 0 40px rgba(52, 144, 236, 0.8);
            }
            50% {
                box-shadow: 0 24px 96px rgba(0, 0, 0, 1), 
                            0 0 0 6px var(--textLink),
                            0 0 50px rgba(52, 144, 236, 1);
            }
        }

        .focus-hint {
            position: fixed;
            bottom: 40px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 14px 28px;
            border-radius: 24px;
            font-size: 15px;
            font-weight: 600;
            z-index: 10000;
            opacity: 0;
            transition: opacity 0.3s ease;
            pointer-events: none;
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
        }

        .focus-hint.visible {
            opacity: 1;
        }

        /* Action buttons for focused message */
        .focus-actions {
            position: absolute;
            top: 100%;
            left: 50%;
            margin-top: 16px;
            transform: translateX(-50%) scale(0.9);
            display: flex;
            gap: 10px;
            background: rgba(255, 255, 255, 1);
            padding: 12px 18px;
            border-radius: 24px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
            opacity: 0;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            pointer-events: none;
            z-index: 5002;
        }

        .message-focused .focus-actions {
            opacity: 1;
            transform: translateX(-50%) scale(1);
            pointer-events: all;
        }

        .focus-actions button {
            background: transparent;
            border: none;
            padding: 10px 16px;
            border-radius: 14px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            color: #000;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            gap: 6px;
        }

        .focus-actions button:hover {
            background: rgba(0, 0, 0, 0.08);
            transform: scale(1.05);
        }

        .focus-actions button:active {
            transform: scale(0.95);
        }

        /* Dark theme adjustments for focus mode */
        [data-theme="dark"] .focus-overlay {
            background: rgba(0, 0, 0, 0.92);
        }

        [data-theme="dark"] .focus-actions {
            background: rgba(30, 30, 30, 1);
        }

        [data-theme="dark"] .focus-actions button {
            color: #e4e4e7;
        }

        [data-theme="dark"] .focus-actions button:hover {
            background: rgba(255, 255, 255, 0.15);
        }

        /* Bookmarks panel */
        #bookmarks-panel {
            position: fixed;
            top: 80px;
            right: -320px;
            width: 300px;
            max-height: calc(100vh - 100px);
            background: var(--bgMessage);
            border-radius: 16px 0 0 16px;
            box-shadow: -4px 0 20px var(--shadow);
            padding: 20px;
            z-index: 4000;
            transition: right 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            overflow-y: auto;
        }

        #bookmarks-panel.visible {
            right: 0;
        }

        #bookmarks-panel h3 {
            margin: 0 0 16px 0;
            color: var(--text);
            font-size: 18px;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .bookmark-item {
            padding: 12px;
            margin: 8px 0;
            background: var(--bg);
            border-radius: 12px;
            cursor: pointer;
            transition: all 0.2s ease;
            border-left: 3px solid var(--textLink);
        }

        .bookmark-item:hover {
            background: var(--bgHover);
            transform: translateX(-4px);
        }

        .bookmark-item .bookmark-text {
            font-size: 13px;
            color: var(--text);
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }

        .bookmark-item .bookmark-meta {
            font-size: 11px;
            color: var(--textSecondary);
            margin-top: 6px;
        }

        .bookmark-item .bookmark-remove {
            float: right;
            color: var(--textSecondary);
            cursor: pointer;
            padding: 4px 8px;
            border-radius: 6px;
            font-size: 16px;
        }

        .bookmark-item .bookmark-remove:hover {
            background: rgba(255, 0, 0, 0.1);
            color: #ff4444;
        }

        /* Reading progress indicator */
        #reading-progress {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 3px;
            background: rgba(0, 0, 0, 0.1);
            z-index: 10000;
            pointer-events: none;
        }

        #reading-progress .progress-bar {
            height: 100%;
            background: linear-gradient(90deg, var(--textLink), #5ac8fa);
            width: 0%;
            transition: width 0.1s ease;
            box-shadow: 0 0 10px rgba(52, 144, 236, 0.5);
        }

        /* Reading position button */
        #reading-position {
            position: fixed;
            bottom: 80px;
            right: 20px;
            width: 56px;
            height: 56px;
            background: var(--textLink);
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            cursor: pointer;
            z-index: 4001;
            box-shadow: 0 4px 16px rgba(52, 144, 236, 0.4);
            transition: all 0.3s ease;
            opacity: 0;
            transform: scale(0.8);
        }

        #reading-position.visible {
            opacity: 1;
            transform: scale(1);
        }

        #reading-position:hover {
            transform: scale(1.1);
            box-shadow: 0 6px 24px rgba(52, 144, 236, 0.6);
        }

        /* User filter dropdown */
        #user-filter {
            position: fixed;
            top: 140px;
            left: 20px;
            background: var(--bgMessage);
            border-radius: 16px;
            padding: 16px;
            box-shadow: 0 4px 20px var(--shadow);
            z-index: 4000;
            max-width: 250px;
            max-height: 400px;
            overflow-y: auto;
            opacity: 0;
            transform: translateY(-10px);
            pointer-events: none;
            transition: all 0.3s ease;
        }

        #user-filter.visible {
            opacity: 1;
            transform: translateY(0);
            pointer-events: all;
        }

        #user-filter h4 {
            margin: 0 0 12px 0;
            color: var(--text);
            font-size: 14px;
        }

        .user-filter-item {
            padding: 10px;
            margin: 4px 0;
            background: var(--bg);
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s ease;
            font-size: 13px;
            color: var(--text);
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .user-filter-item:hover {
            background: var(--bgHover);
        }

        .user-filter-item.active {
            background: var(--textLink);
            color: white;
        }

        .user-filter-count {
            margin-left: auto;
            font-size: 11px;
            opacity: 0.7;
        }

        /* Bookmark indicator on messages */
        .message.bookmarked {
            position: relative;
        }

        .message.bookmarked::before {
            content: '🔖';
            position: absolute;
            top: 8px;
            right: 8px;
            font-size: 16px;
            opacity: 0.7;
            z-index: 10;
        }

        /* Scroll timeline */
        #scroll-timeline {
            position: fixed;
            right: 10px;
            top: 50%;
            transform: translateY(-50%);
            width: 4px;
            height: 40%;
            background: rgba(0, 0, 0, 0.1);
            border-radius: 2px;
            z-index: 3000;
            opacity: 0;
            transition: opacity 0.3s ease, width 0.2s ease;
        }

        #scroll-timeline:hover {
            width: 8px;
            opacity: 1 !important;
        }

        #scroll-timeline .timeline-thumb {
            position: absolute;
            left: 0;
            width: 100%;
            background: var(--textLink);
            border-radius: 2px;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        #scroll-timeline .timeline-thumb:hover {
            background: #2c7ac4;
            width: 12px;
            left: -4px;
        }

        body.scrolling #scroll-timeline {
            opacity: 0.6;
        }

        @keyframes ripple {
            0% {
                transform: scale(0);
                opacity: 0.6;
            }
            100% {
                transform: scale(2);
                opacity: 0;
            }
        }
        
        /* Add hover glow effect to interactive elements */
        #theme-toggle:hover,
        #help-button:hover,
        #language-selector:hover {
            filter: brightness(1.1);
            box-shadow: 0 6px 20px var(--shadow), 0 0 20px rgba(51, 144, 236, 0.3);
        }

        /* Image viewer overlay */
        #image-viewer {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.95);
            z-index: 10000;
            justify-content: center;
            align-items: center;
            cursor: zoom-out;
        }

        #image-viewer.active {
            display: flex;
            animation: fadeIn 0.2s ease;
        }

        #image-viewer img {
            max-width: 90%;
            max-height: 90%;
            object-fit: contain;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
            border-radius: 8px;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
            .page_body {
                width: 100% !important;
                padding: 64px 8px 20px 8px !important;
            }

            .message.default .body {
                max-width: calc(100vw - 80px);
            }

            #theme-toggle {
                right: 10px;
                top: 70px;
                width: 44px;
                height: 44px;
                font-size: 20px;
            }

            #search-toggle {
                right: 10px;
                top: 120px;
            }

            #search-container {
                right: -100%;
                width: calc(100vw - 40px);
            }

            #search-container.visible {
                right: 20px;
            }

            #message-counter {
                left: 10px;
                bottom: 20px;
                font-size: 12px;
                padding: 8px 12px;
            }

            #scroll-to-top {
                right: 10px;
                bottom: 20px;
                width: 44px;
                height: 44px;
            }
        }

        /* Smooth scrolling */
        html {
            scroll-behavior: smooth;
        }

        /* Loading animation for images */
        img {
            transition: opacity 0.3s ease;
        }

        img:not([src]) {
            opacity: 0;
        }

        /* Round video messages */
        .media_video .thumb {
            border-radius: 50%;
            transition: transform 0.2s ease;
        }

        .media_video:hover .thumb {
            transform: scale(1.05);
        }

        /* Link previews */
        .media.clearfix {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        /* Statistics modal */
        .stats-modal, .help-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.75);
            backdrop-filter: blur(8px);
            z-index: 10003;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        
        .stats-modal.visible, .help-modal.visible {
            opacity: 1;
        }
        
        .stats-content, .help-content {
            background: var(--bgMessage);
            border-radius: 16px;
            border: 1px solid var(--border);
            padding: 32px;
            max-width: 600px;
            width: 90%;
            max-height: 85vh;
            overflow-y: auto;
            box-shadow: 0 16px 48px rgba(0, 0, 0, 0.4), 0 0 1px var(--border);
            transform: scale(0.9);
            transition: transform 0.3s ease;
        }
        
        .stats-modal.visible .stats-content,
        .help-modal.visible .help-content {
            transform: scale(1);
        }
        
        .stats-content h2, .help-content h2 {
            color: var(--text);
            margin: 0 0 24px 0;
            font-size: 24px;
            text-align: center;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 16px;
            margin-bottom: 24px;
        }
        
        .stat-item {
            background: var(--bgSecondary);
            border-radius: 12px;
            padding: 20px;
            text-align: center;
            transition: transform 0.2s ease;
        }
        
        .stat-item:hover {
            transform: translateY(-4px);
        }
        
        .stat-icon {
            font-size: 32px;
            display: block;
            margin-bottom: 8px;
        }
        
        .stat-value {
            font-size: 28px;
            font-weight: bold;
            color: var(--textLink);
            display: block;
            margin-bottom: 4px;
        }
        
        .stat-label {
            font-size: 13px;
            color: var(--textSecondary);
            display: block;
        }
        
        .date-range {
            background: var(--bgSecondary);
            border-radius: 12px;
            padding: 16px;
            margin-bottom: 24px;
            text-align: center;
        }
        
        .date-range p {
            margin: 0;
            color: var(--text);
            font-size: 14px;
        }
        
        .close-stats, .close-help {
            width: 100%;
            padding: 12px;
            background: var(--textLink);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: opacity 0.2s ease;
        }
        
        .close-stats:hover, .close-help:hover {
            opacity: 0.9;
        }
        
        /* Keyboard help */
        .help-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 12px;
            margin-bottom: 20px;
        }
        
        .help-item {
            background: var(--bgSecondary);
            border-radius: 8px;
            padding: 12px 16px;
            color: var(--text);
            font-size: 14px;
        }
        
        kbd {
            background: var(--textLink);
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-family: monospace;
            font-size: 13px;
            font-weight: 600;
            margin-right: 8px;
        }
        
        .help-tip {
            text-align: center;
            color: var(--textSecondary);
            font-size: 13px;
            margin: 16px 0;
        }
        
        /* Improve touch targets for mobile */
        @media (pointer: coarse) {
            .bot_button {
                min-height: 44px;
            }
            
            #theme-toggle {
                min-width: 44px;
                min-height: 44px;
            }
        }
        
        @media (max-width: 768px) {
            .stats-content, .help-content {
                padding: 24px;
            }
            
            .stats-grid, .help-grid {
                grid-template-columns: 1fr;
            }
        }
        `;
        document.head.appendChild(styleEl);
    }

    // Create image viewer
    function createImageViewer() {
        // Handle photos - open directly
        document.querySelectorAll('.photo').forEach(img => {
            img.style.cursor = 'pointer';
            img.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                window.open(img.src, '_blank');
            }, true);
        });
        
        // Handle videos - open actual video file, not thumbnail
        document.querySelectorAll('.video_file_wrap').forEach(videoWrap => {
            videoWrap.style.cursor = 'pointer';
            const videoUrl = videoWrap.href;
            
            videoWrap.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (videoUrl) {
                    window.open(videoUrl, '_blank');
                }
            }, true);
            
            // Also handle clicks on video thumbnail inside
            const thumb = videoWrap.querySelector('img.video_file');
            if (thumb) {
                thumb.style.cursor = 'pointer';
                thumb.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (videoUrl) {
                        window.open(videoUrl, '_blank');
                    }
                }, true);
            }
        });
        
        // Handle download links
        document.querySelectorAll('a[download]').forEach(link => {
            link.style.cursor = 'pointer';
            link.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                window.open(link.href, '_blank');
            }, true);
        });
    }

    // Add read/unread indicators
    function addReadIndicators() {
        document.querySelectorAll('.message.default').forEach((msg, index, all) => {
            const date = msg.querySelector('.date');
            if (date && index < all.length * 0.9) { // 90% считаем прочитанными
                const checkmark = document.createElement('span');
                checkmark.innerHTML = ' ✓✓';
                checkmark.style.color = 'var(--textLink)';
                checkmark.style.fontSize = '12px';
                date.appendChild(checkmark);
            }
        });
    }

    // Initialize enhancements
    // Bookmarks system
    let bookmarks = JSON.parse(localStorage.getItem('telegram-bookmarks') || '[]');

    function createBookmarksPanel() {
        const panel = document.createElement('div');
        panel.id = 'bookmarks-panel';
        panel.innerHTML = `
            <h3>🔖 ${t('bookmarks')}</h3>
            <div id="bookmarks-list"></div>
        `;
        document.body.appendChild(panel);
        updateBookmarksList();
    }

    function toggleBookmark(message) {
        const messageId = message.id || Array.from(document.querySelectorAll('.message.default')).indexOf(message);
        const text = message.querySelector('.text')?.innerText || '';
        const from = message.querySelector('.from_name')?.innerText || 'Unknown';
        const date = message.querySelector('.date')?.getAttribute('title') || '';
        
        const bookmarkIndex = bookmarks.findIndex(b => b.id === messageId);
        
        if (bookmarkIndex > -1) {
            bookmarks.splice(bookmarkIndex, 1);
            message.classList.remove('bookmarked');
            showToast(t('bookmarkRemoved'));
        } else {
            bookmarks.push({ id: messageId, text: text.substring(0, 100), from, date });
            message.classList.add('bookmarked');
            showToast(t('bookmarkAdded'));
        }
        
        localStorage.setItem('telegram-bookmarks', JSON.stringify(bookmarks));
        updateBookmarksList();
    }

    function updateBookmarksList() {
        const list = document.getElementById('bookmarks-list');
        if (!list) return;
        
        if (bookmarks.length === 0) {
            list.innerHTML = `<p style="color: var(--textSecondary); font-size: 13px; text-align: center; padding: 20px;">${t('noBookmarks')}</p>`;
            return;
        }
        
        list.innerHTML = bookmarks.map((bookmark, index) => `
            <div class="bookmark-item" data-id="${bookmark.id}">
                <span class="bookmark-remove" data-index="${index}">×</span>
                <div class="bookmark-text">${bookmark.text}</div>
                <div class="bookmark-meta">${bookmark.from} • ${bookmark.date}</div>
            </div>
        `).join('');
        
        list.querySelectorAll('.bookmark-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (e.target.classList.contains('bookmark-remove')) {
                    const index = parseInt(e.target.dataset.index);
                    bookmarks.splice(index, 1);
                    localStorage.setItem('telegram-bookmarks', JSON.stringify(bookmarks));
                    updateBookmarksList();
                    const messages = Array.from(document.querySelectorAll('.message.default'));
                    messages.forEach(m => m.classList.remove('bookmarked'));
                    bookmarks.forEach(b => {
                        if (messages[b.id]) messages[b.id].classList.add('bookmarked');
                    });
                    showToast(t('bookmarkRemoved'));
                } else {
                    const messageId = item.dataset.id;
                    const messages = Array.from(document.querySelectorAll('.message.default'));
                    const targetMessage = messages[messageId];
                    if (targetMessage) {
                        targetMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        targetMessage.classList.add('selected');
                        setTimeout(() => targetMessage.classList.remove('selected'), 2000);
                    }
                    document.getElementById('bookmarks-panel').classList.remove('visible');
                }
            });
        });
    }

    function loadBookmarks() {
        const messages = Array.from(document.querySelectorAll('.message.default'));
        bookmarks.forEach(bookmark => {
            if (messages[bookmark.id]) {
                messages[bookmark.id].classList.add('bookmarked');
            }
        });
    }

    // Reading progress tracker
    function createReadingProgress() {
        const progress = document.createElement('div');
        progress.id = 'reading-progress';
        progress.innerHTML = '<div class="progress-bar"></div>';
        document.body.appendChild(progress);
        
        const progressBar = progress.querySelector('.progress-bar');
        
        window.addEventListener('scroll', () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = (scrollTop / docHeight) * 100;
            progressBar.style.width = scrollPercent + '%';
            
            // Save reading position
            localStorage.setItem('telegram-reading-pos', scrollTop);
        });
        
        // Continue reading button
        const savedPos = localStorage.getItem('telegram-reading-pos');
        if (savedPos && parseFloat(savedPos) > 500) {
            const btn = document.createElement('div');
            btn.id = 'reading-position';
            btn.innerHTML = '▶️';
            btn.title = t('continueReading');
            document.body.appendChild(btn);
            
            setTimeout(() => btn.classList.add('visible'), 1000);
            
            btn.addEventListener('click', () => {
                window.scrollTo({ top: parseFloat(savedPos), behavior: 'smooth' });
                btn.classList.remove('visible');
                setTimeout(() => btn.remove(), 300);
            });
            
            // Auto-hide after 5 seconds
            setTimeout(() => {
                btn.classList.remove('visible');
                setTimeout(() => btn.remove(), 300);
            }, 5000);
        }
    }

    // User filter
    function createUserFilter() {
        const messages = document.querySelectorAll('.message.default');
        const users = new Map();
        
        messages.forEach(msg => {
            const from = msg.querySelector('.from_name')?.innerText;
            if (from) {
                users.set(from, (users.get(from) || 0) + 1);
            }
        });
        
        if (users.size === 0) return;
        
        const filter = document.createElement('div');
        filter.id = 'user-filter';
        filter.innerHTML = `
            <h4>👤 ${t('searchByUser')}</h4>
            <div class="user-filter-item" data-user="all">
                ${t('all')} <span class="user-filter-count">${messages.length}</span>
            </div>
            ${Array.from(users.entries()).map(([user, count]) => `
                <div class="user-filter-item" data-user="${user}">
                    ${user} <span class="user-filter-count">${count}</span>
                </div>
            `).join('')}
        `;
        document.body.appendChild(filter);
        
        filter.querySelectorAll('.user-filter-item').forEach(item => {
            item.addEventListener('click', () => {
                const user = item.dataset.user;
                filter.querySelectorAll('.user-filter-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                
                if (user === 'all') {
                    messages.forEach(msg => msg.style.display = '');
                    showToast(`${t('shown')} ${messages.length} ${t('messageCount')}`);
                } else {
                    let count = 0;
                    messages.forEach(msg => {
                        const from = msg.querySelector('.from_name')?.innerText;
                        if (from === user) {
                            msg.style.display = '';
                            count++;
                        } else {
                            msg.style.display = 'none';
                        }
                    });
                    showToast(`${user}: ${count} ${t('messageCount')}`);
                }
                
                filter.classList.remove('visible');
            });
        });
    }

    // Scroll timeline
    function createScrollTimeline() {
        const timeline = document.createElement('div');
        timeline.id = 'scroll-timeline';
        timeline.innerHTML = '<div class="timeline-thumb"></div>';
        document.body.appendChild(timeline);
        
        const thumb = timeline.querySelector('.timeline-thumb');
        let scrollTimeout;
        
        function updateThumb() {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = (scrollTop / docHeight) * 100;
            const thumbHeight = (window.innerHeight / document.documentElement.scrollHeight) * 100;
            
            thumb.style.height = Math.max(thumbHeight, 5) + '%';
            thumb.style.top = scrollPercent + '%';
        }
        
        window.addEventListener('scroll', () => {
            document.body.classList.add('scrolling');
            updateThumb();
            
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                document.body.classList.remove('scrolling');
            }, 1000);
        });
        
        timeline.addEventListener('click', (e) => {
            const rect = timeline.getBoundingClientRect();
            const clickY = e.clientY - rect.top;
            const percent = clickY / rect.height;
            const scrollTarget = percent * (document.documentElement.scrollHeight - window.innerHeight);
            window.scrollTo({ top: scrollTarget, behavior: 'smooth' });
        });
        
        updateThumb();
    }

    // Show message info
    function showMessageInfo(message) {
        const text = message.querySelector('.text')?.innerText || '';
        const from = message.querySelector('.from_name')?.innerText || 'Unknown';
        const date = message.querySelector('.date')?.getAttribute('title') || '';
        const messageIndex = Array.from(document.querySelectorAll('.message.default')).indexOf(message) + 1;
        
        const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;
        const charCount = text.length;
        const hasPhoto = message.querySelector('.photo') ? '✓' : '✗';
        const hasVideo = message.querySelector('.video_file, .media_video') ? '✓' : '✗';
        const hasVoice = message.querySelector('.media_voice_message') ? '✓' : '✗';
        const hasLink = message.querySelector('a') ? '✓' : '✗';
        
        let modal = document.getElementById('message-info-modal');
        
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'message-info-modal';
            document.body.appendChild(modal);
            
            modal.addEventListener('click', (e) => {
                if (e.target === modal || e.target.classList.contains('info-close-btn')) {
                    modal.classList.remove('visible');
                }
            });
        }
        
        modal.innerHTML = `
            <div class="message-info-content">
                <h3>ℹ️ ${t('messageInfo')}</h3>
                <div class="info-row">
                    <span class="info-label">#</span>
                    <span class="info-value">${messageIndex}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">👤 ${currentLang === 'en' ? 'From' : currentLang === 'ru' ? 'От' : 'Від'}</span>
                    <span class="info-value">${from}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">🕐 ${t('timestamp')}</span>
                    <span class="info-value">${date}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">📝 ${t('wordCount')}</span>
                    <span class="info-value">${wordCount}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">🔤 ${t('charCount')}</span>
                    <span class="info-value">${charCount}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">📷 ${currentLang === 'en' ? 'Photo' : currentLang === 'ru' ? 'Фото' : 'Фото'}</span>
                    <span class="info-value">${hasPhoto}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">🎥 ${currentLang === 'en' ? 'Video' : currentLang === 'ru' ? 'Видео' : 'Відео'}</span>
                    <span class="info-value">${hasVideo}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">🎤 ${currentLang === 'en' ? 'Voice' : currentLang === 'ru' ? 'Голос' : 'Голос'}</span>
                    <span class="info-value">${hasVoice}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">🔗 ${currentLang === 'en' ? 'Link' : currentLang === 'ru' ? 'Ссылка' : 'Посилання'}</span>
                    <span class="info-value">${hasLink}</span>
                </div>
                <button class="info-close-btn">${t('close')}</button>
            </div>
        `;
        
        modal.classList.add('visible');
    }

    // Quick actions toolbar
    function createQuickActions() {
        const toolbar = document.createElement('div');
        toolbar.id = 'quick-actions';
        toolbar.innerHTML = `
            <button class="quick-action-btn" data-action="jump" title="${t('jumpTo')}">
                🔢
            </button>
            <button class="quick-action-btn" data-action="bookmarks" title="${t('bookmarks')}">
                🔖
            </button>
            <button class="quick-action-btn" data-action="filter" title="${t('filterMessages')}">
                👤
            </button>
            <button class="quick-action-btn" data-action="stats" title="${t('statistics')}">
                📊
            </button>
            <button class="quick-action-btn" data-action="theme" title="${t('theme_key')}">
                ${currentTheme === 'light' ? '🌙' : '☀️'}
            </button>
            <button class="quick-action-btn" data-action="scroll-top" title="${currentLang === 'en' ? 'Scroll to top' : currentLang === 'ru' ? 'Наверх' : 'Вгору'}">
                ⬆️
            </button>
        `;
        document.body.appendChild(toolbar);
        
        // Show toolbar on scroll
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            toolbar.classList.add('visible');
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                toolbar.classList.remove('visible');
            }, 2000);
        });
        
        // Action handlers
        toolbar.querySelectorAll('.quick-action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = btn.dataset.action;
                
                switch(action) {
                    case 'jump':
                        showJumpToMessage();
                        break;
                    case 'bookmarks':
                        document.getElementById('bookmarks-panel')?.classList.toggle('visible');
                        break;
                    case 'filter':
                        document.getElementById('user-filter')?.classList.toggle('visible');
                        break;
                    case 'stats':
                        showDetailedStats();
                        break;
                    case 'theme':
                        document.getElementById('theme-toggle')?.click();
                        setTimeout(() => {
                            btn.innerHTML = currentTheme === 'light' ? '🌙' : '☀️';
                        }, 100);
                        break;
                    case 'scroll-top':
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                        break;
                }
            });
        });
    }

    // Jump to message by number
    function showJumpToMessage() {
        let modal = document.getElementById('jump-modal');
        
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'jump-modal';
            modal.innerHTML = `
                <div class="jump-content">
                    <h3>${t('jumpToMessage')}</h3>
                    <input type="number" id="jump-input" placeholder="${t('jumpPlaceholder')}" min="1">
                    <div class="jump-buttons">
                        <button class="jump-cancel">${t('cancel')}</button>
                        <button class="jump-go">${t('jumpGo')}</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            
            // Close on overlay click
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('visible');
                }
            });
            
            // Cancel button
            modal.querySelector('.jump-cancel').addEventListener('click', () => {
                modal.classList.remove('visible');
            });
            
            // Go button
            modal.querySelector('.jump-go').addEventListener('click', () => {
                const input = document.getElementById('jump-input');
                const messageNum = parseInt(input.value);
                
                if (messageNum > 0) {
                    const messages = Array.from(document.querySelectorAll('.message.default'));
                    const targetMessage = messages[messageNum - 1];
                    
                    if (targetMessage) {
                        targetMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        targetMessage.classList.add('selected');
                        setTimeout(() => targetMessage.classList.remove('selected'), 2000);
                        modal.classList.remove('visible');
                    } else {
                        showToast(t('messageNotFound'));
                    }
                }
            });
            
            // Enter key
            modal.querySelector('#jump-input').addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    modal.querySelector('.jump-go').click();
                }
            });
        }
        
        modal.classList.add('visible');
        setTimeout(() => {
            document.getElementById('jump-input').focus();
        }, 100);
    }

    function init() {
        addStyles();
        applyTheme();
        
        // Restore saved settings
        if (localStorage.getItem('telegram-compact') === 'true') {
            document.body.classList.add('compact-mode');
        }
        if (localStorage.getItem('telegram-hide-media') === 'true') {
            document.body.classList.add('hide-media');
        }
        const fontSize = localStorage.getItem('telegram-font-size');
        if (fontSize) {
            document.documentElement.style.setProperty('--message-font-size', `${fontSize}px`);
        }
        
        createThemeToggle();
        createHelpButton();
        createSearch();
        createScrollToTop();
        createMessageCounter();
        createContextMenu();
        createDateNavigation();
        createImageViewer();
        createBookmarksPanel();
        createReadingProgress();
        createUserFilter();
        createScrollTimeline();
        createQuickActions();
        setupKeyboardShortcuts();
        enhanceInteractivity();
        addReadIndicators();
        addFavoriteStarsToMessages();
        loadFavorites();
        loadBookmarks();
        lazyLoadImages();
        
        // Restore reading mode
        if (localStorage.getItem('telegram-reading') === 'true') {
            document.body.classList.add('reading-mode');
        }
    }

    // Add keyboard shortcuts
    function setupKeyboardShortcuts() {
        let currentDateIndex = -1;
        const dates = Array.from(document.querySelectorAll('.message.service'));
        
        document.addEventListener('keydown', (e) => {
            // Slash (/) - Quick search focus
            if (e.key === '/' && !e.ctrlKey && !e.altKey && document.activeElement.tagName !== 'INPUT') {
                e.preventDefault();
                document.getElementById('search-toggle')?.click();
                setTimeout(() => document.getElementById('search-input')?.focus(), 100);
            }
            
            // T - Toggle theme
            if (e.key === 't' && !e.ctrlKey && !e.altKey && document.activeElement.tagName !== 'INPUT') {
                e.preventDefault();
                document.getElementById('theme-toggle')?.click();
            }
            
            // C - Compact mode toggle
            if (e.key === 'c' && !e.ctrlKey && !e.altKey && document.activeElement.tagName !== 'INPUT') {
                e.preventDefault();
                toggleCompactMode();
            }
            
            // M - Toggle media visibility
            if (e.key === 'm' && !e.ctrlKey && !e.altKey && document.activeElement.tagName !== 'INPUT') {
                e.preventDefault();
                toggleMediaVisibility();
            }
            
            // Plus/Minus - Font size
            if ((e.key === '+' || e.key === '=') && !e.ctrlKey && !e.altKey && document.activeElement.tagName !== 'INPUT') {
                e.preventDefault();
                adjustFontSize(1);
            }
            if ((e.key === '-' || e.key === '_') && !e.ctrlKey && !e.altKey && document.activeElement.tagName !== 'INPUT') {
                e.preventDefault();
                adjustFontSize(-1);
            }
            
            // 0 - Reset font size
            if (e.key === '0' && !e.ctrlKey && !e.altKey && document.activeElement.tagName !== 'INPUT') {
                e.preventDefault();
                resetFontSize();
            }
            
            // N/P - Navigate between dates
            if (e.key === 'n' && !e.ctrlKey && !e.altKey && document.activeElement.tagName !== 'INPUT') {
                e.preventDefault();
                currentDateIndex = Math.min(currentDateIndex + 1, dates.length - 1);
                if (dates[currentDateIndex]) {
                    dates[currentDateIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
                    dates[currentDateIndex].classList.add('selected');
                    setTimeout(() => dates[currentDateIndex].classList.remove('selected'), 1500);
                }
            }
            if (e.key === 'p' && !e.ctrlKey && !e.altKey && document.activeElement.tagName !== 'INPUT') {
                e.preventDefault();
                currentDateIndex = Math.max(currentDateIndex - 1, 0);
                if (dates[currentDateIndex]) {
                    dates[currentDateIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
                    dates[currentDateIndex].classList.add('selected');
                    setTimeout(() => dates[currentDateIndex].classList.remove('selected'), 1500);
                }
            }
            
            // S - Show statistics
            if (e.key === 's' && !e.ctrlKey && !e.altKey && document.activeElement.tagName !== 'INPUT') {
                e.preventDefault();
                showDetailedStats();
            }
            
            // (Removed) E - Export to JSON
            
            // H - Show help
            if (e.key === 'h' && !e.ctrlKey && !e.altKey && document.activeElement.tagName !== 'INPUT') {
                e.preventDefault();
                showKeyboardHelp();
            }
            
            // R - Reading mode
            if (e.key === 'r' && !e.ctrlKey && !e.altKey && document.activeElement.tagName !== 'INPUT') {
                e.preventDefault();
                toggleReadingMode();
            }
            
            // F - Show favorites
            if (e.key === 'f' && !e.ctrlKey && !e.altKey && document.activeElement.tagName !== 'INPUT') {
                e.preventDefault();
                showFavorites();
            }
            
            // B - Toggle bookmarks panel
            if (e.key === 'b' && !e.ctrlKey && !e.altKey && document.activeElement.tagName !== 'INPUT') {
                e.preventDefault();
                document.getElementById('bookmarks-panel')?.classList.toggle('visible');
            }
            
            // U - Toggle user filter
            if (e.key === 'u' && !e.ctrlKey && !e.altKey && document.activeElement.tagName !== 'INPUT') {
                e.preventDefault();
                document.getElementById('user-filter')?.classList.toggle('visible');
            }
            
            // J - Jump to message
            if (e.key === 'j' && !e.ctrlKey && !e.altKey && document.activeElement.tagName !== 'INPUT') {
                e.preventDefault();
                showJumpToMessage();
            }
            
            // Home - Scroll to top
            if (e.key === 'Home') {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
                currentDateIndex = 0;
            }
            
            // End - Scroll to bottom
            if (e.key === 'End') {
                e.preventDefault();
                window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                currentDateIndex = dates.length - 1;
            }
            
            // Escape - Close overlays and focus mode
            if (e.key === 'Escape') {
                if (focusedMessage) {
                    disableFocusMode();
                } else {
                    document.querySelector('#search-container.visible')?.classList.remove('visible');
                    document.querySelector('#image-viewer.active')?.classList.remove('active');
                    document.querySelector('#date-list:not(.hidden)')?.classList.add('hidden');
                    document.querySelector('#keyboard-help.visible')?.classList.remove('visible');
                    document.querySelector('#bookmarks-panel.visible')?.classList.remove('visible');
                    document.querySelector('#user-filter.visible')?.classList.remove('visible');
                }
            }
        });
    }
    
    // Compact mode toggle
    function toggleCompactMode() {
        document.body.classList.toggle('compact-mode');
        const isCompact = document.body.classList.contains('compact-mode');
        showToast(isCompact ? t('compactMode') : t('normalMode'));
        localStorage.setItem('telegram-compact', isCompact);
    }
    
    // Reading mode toggle
    function toggleReadingMode() {
        document.body.classList.toggle('reading-mode');
        const isReading = document.body.classList.contains('reading-mode');
        showToast(t('readingMode') + (isReading ? ' ✓' : ' ✗'));
        localStorage.setItem('telegram-reading', isReading);
    }
    
    // Toggle media visibility
    function toggleMediaVisibility() {
        document.body.classList.toggle('hide-media');
        const isHidden = document.body.classList.contains('hide-media');
        showToast(isHidden ? t('mediaHidden') : t('mediaShown'));
        localStorage.setItem('telegram-hide-media', isHidden);
    }
    
    // Adjust font size
    function adjustFontSize(delta) {
        const currentSize = parseInt(localStorage.getItem('telegram-font-size') || '14');
        const newSize = Math.max(10, Math.min(24, currentSize + delta));
        document.documentElement.style.setProperty('--message-font-size', `${newSize}px`);
        localStorage.setItem('telegram-font-size', newSize);
        showToast(`${t('fontSize')}: ${newSize}px`);
    }
    
    // Reset font size to default
    function resetFontSize() {
        document.documentElement.style.setProperty('--message-font-size', '14px');
        localStorage.setItem('telegram-font-size', '14');
        showToast(t('fontReset'));
    }
    
    // Show detailed statistics
    function showDetailedStats() {
        const messages = document.querySelectorAll('.message.default');
        const photos = document.querySelectorAll('.photo').length;
        const videos = document.querySelectorAll('.video_file, .media_video').length;
        const voices = document.querySelectorAll('.media_voice_message').length;
        const links = document.querySelectorAll('.message.default a').length;
        
        const dates = Array.from(document.querySelectorAll('.message.service .body'))
            .map(el => el.textContent.trim())
            .filter(t => t && t !== 'History cleared');
        
        const firstDate = dates[0] || 'N/A';
        const lastDate = dates[dates.length - 1] || 'N/A';
        
        const statsHTML = `
            <div id="detailed-stats" class="stats-modal">
                <div class="stats-content">
                    <h2>${t('statistics')}</h2>
                    <div class="stats-grid">
                        <div class="stat-item">
                            <span class="stat-icon">💬</span>
                            <span class="stat-value">${messages.length}</span>
                            <span class="stat-label">${t('messages')}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-icon">📷</span>
                            <span class="stat-value">${photos}</span>
                            <span class="stat-label">${t('photos_label')}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-icon">🎥</span>
                            <span class="stat-value">${videos}</span>
                            <span class="stat-label">${t('videos_label')}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-icon">🎤</span>
                            <span class="stat-value">${voices}</span>
                            <span class="stat-label">${t('voices_label')}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-icon">🔗</span>
                            <span class="stat-value">${links}</span>
                            <span class="stat-label">${t('links_label')}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-icon">📅</span>
                            <span class="stat-value">${dates.length}</span>
                            <span class="stat-label">${t('days_label')}</span>
                        </div>
                    </div>
                    <div class="date-range">
                        <p><strong>${t('period')}:</strong> ${firstDate} — ${lastDate}</p>
                    </div>
                    <button class="close-stats">${t('close')}</button>
                </div>
            </div>
        `;
        
        const existing = document.getElementById('detailed-stats');
        if (existing) {
            existing.remove();
        }
        
        document.body.insertAdjacentHTML('beforeend', statsHTML);
        
        setTimeout(() => {
            const modal = document.getElementById('detailed-stats');
            modal.classList.add('visible');
            
            modal.addEventListener('click', (e) => {
                if (e.target === modal || e.target.classList.contains('close-stats')) {
                    modal.classList.remove('visible');
                    setTimeout(() => modal.remove(), 300);
                }
            });
        }, 10);
    }
            
    // Show keyboard help
    function showKeyboardHelp() {
        const helpHTML = `
            <div id="keyboard-help" class="help-modal">
                <div class="help-content">
                    <h2>Help</h2>
                    <div class="help-section">
                        <h3> ${t('keyboard')}</h3>
                        <div class="help-grid">
                            <div class="help-item"><kbd>/</kbd> — ${t('search_key')}</div>
                            <div class="help-item"><kbd>T</kbd> — ${t('theme_key')}</div>
                            <div class="help-item"><kbd>C</kbd> — ${t('compact_key')}</div>
                            <div class="help-item"><kbd>M</kbd> — ${t('media_key')}</div>
                            <div class="help-item"><kbd>R</kbd> — ${t('readingMode')}</div>
                            <div class="help-item"><kbd>+</kbd> / <kbd>-</kbd> — ${t('font_key')}</div>
                            <div class="help-item"><kbd>0</kbd> — ${t('resetFont')}</div>
                            <div class="help-item"><kbd>N</kbd> / <kbd>P</kbd> — ${t('nav_key')}</div>
                            <div class="help-item"><kbd>S</kbd> — ${t('stats_key')}</div>
                            <div class="help-item"><kbd>F</kbd> — ${currentLang === 'en' ? 'Show favorites' : currentLang === 'ru' ? 'Показать избранное' : 'Показати обране'}</div>
                            <div class="help-item"><kbd>B</kbd> — ${t('bookmarks')}</div>
                            <div class="help-item"><kbd>U</kbd> — ${t('filterMessages')}</div>
                            <div class="help-item"><kbd>J</kbd> — ${t('jumpTo')}</div>
                            <div class="help-item"><kbd>Right click</kbd> — ${currentLang === 'en' ? 'Context menu (focus mode)' : currentLang === 'ru' ? 'Контекстное меню (режим фокуса)' : 'Контекстне меню (режим фокусу)'}</div>
                            <div class="help-item"><kbd>Home</kbd> / <kbd>End</kbd> — ${t('nav_arrows')}</div>
                            <div class="help-item"><kbd>Esc</kbd> — ${t('close_key')}</div>
                        </div>
                    </div>
                    <div class="help-section">
                        <h3>🌐 ${t('language')}</h3>
                        <div class="help-language">
                            <button class="lang-button" id="help-lang-button"></button>
                            <div class="lang-dropdown" id="help-lang-dropdown">
                                <div class="lang-option" data-lang="en">🇬🇧 English</div>
                                <div class="lang-option" data-lang="ru">🇷🇺 Русский</div>
                                <div class="lang-option" data-lang="ua">🇺🇦 Українська</div>
                            </div>
                        </div>
                    </div>
                    <p class="help-tip">${t('tip')}</p>
                    <button class="close-help">${t('close')}</button>
                </div>
            </div>
        `;
        
        const existing = document.getElementById('keyboard-help');
        if (existing) {
            existing.remove();
        }
        
        document.body.insertAdjacentHTML('beforeend', helpHTML);
        
        setTimeout(() => {
            const modal = document.getElementById('keyboard-help');
            modal.classList.add('visible');
            
            // Language dropdown in help
            const flagFor = (lang) => ({ en: '🇬🇧', ru: '🇷🇺', ua: '🇺🇦' }[lang] || '🌐');
            const labelFor = (lang) => ({ en: 'English', ru: 'Русский', ua: 'Українська' }[lang] || 'Language');
            const btn = document.getElementById('help-lang-button');
            const dd = document.getElementById('help-lang-dropdown');
            btn.innerHTML = `${flagFor(currentLang)} ${labelFor(currentLang)}`;
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                dd.classList.toggle('visible');
            });
            dd.querySelectorAll('.lang-option').forEach(opt => {
                opt.addEventListener('click', () => {
                    currentLang = opt.dataset.lang;
                    localStorage.setItem('telegram-lang', currentLang);
                    location.reload();
                });
            });
            
            modal.addEventListener('click', (e) => {
                if (e.target === modal || e.target.classList.contains('close-help')) {
                    modal.classList.remove('visible');
                    setTimeout(() => modal.remove(), 300);
                }
            });
        }, 10);
    }

    // Show favorites
    function showFavorites() {
        const favorites = document.querySelectorAll('.favorite-message');
        if (favorites.length === 0) {
            showToast('⭐ ' + (currentLang === 'en' ? 'No favorites' : currentLang === 'ru' ? 'Нет избранных' : 'Немає обраних'));
            return;
        }
        
        document.querySelectorAll('.message.default').forEach(msg => {
            msg.style.display = msg.classList.contains('favorite-message') ? '' : 'none';
        });
        
        showToast(`⭐ ${favorites.length} ` + (currentLang === 'en' ? 'favorites' : currentLang === 'ru' ? 'избранных' : 'обраних'));
        
        // Reset after 5 seconds
        setTimeout(() => {
            document.querySelectorAll('.message.default').forEach(msg => {
                msg.style.display = '';
            });
        }, 5000);
    }

    // iOS-style focus mode
    let focusedMessage = null;
    let focusOverlay = null;
    let focusHint = null;
    let longPressTimer = null;

    function enableFocusMode(message) {
        if (focusedMessage === message) return;
        
        disableFocusMode();
        
        // Create overlay
        focusOverlay = document.createElement('div');
        focusOverlay.className = 'focus-overlay';
        document.body.appendChild(focusOverlay);
        
        // Create hint
        focusHint = document.createElement('div');
        focusHint.className = 'focus-hint';
        focusHint.textContent = t('exitFocus');
        document.body.appendChild(focusHint);
        
        // Create action buttons
        const actions = document.createElement('div');
        actions.className = 'focus-actions';
        const isBookmarked = message.classList.contains('bookmarked');
        actions.innerHTML = `
            <button data-action="copy">${t('copyText')}</button>
            <button data-action="bookmark">${isBookmarked ? t('removeBookmark') : t('bookmark')}</button>
            <button data-action="favorite">${message.classList.contains('favorite-message') ? t('unfavorite') : t('favorite')}</button>
        `;
        message.appendChild(actions);
        
        // Add event listeners to action buttons
        actions.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                handleFocusAction(btn.dataset.action, message);
            });
        });
        
        // Apply focus
        setTimeout(() => {
            focusOverlay.classList.add('visible');
            focusHint.classList.add('visible');
            message.classList.add('message-focused');
            document.body.classList.add('focus-mode-active');
            focusedMessage = message;
            
            // Scroll message into view
            message.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            showToast(t('focusActive'));
        }, 50);
        
        // Click overlay to exit
        focusOverlay.addEventListener('click', disableFocusMode);
    }

    function disableFocusMode() {
        if (!focusedMessage) return;
        
        focusedMessage.classList.remove('message-focused');
        document.body.classList.remove('focus-mode-active');
        
        // Remove action buttons
        const actions = focusedMessage.querySelector('.focus-actions');
        if (actions) actions.remove();
        
        if (focusOverlay) {
            focusOverlay.classList.remove('visible');
            setTimeout(() => {
                if (focusOverlay && focusOverlay.parentNode) {
                    focusOverlay.remove();
                }
                focusOverlay = null;
            }, 300);
        }
        
        if (focusHint) {
            focusHint.classList.remove('visible');
            setTimeout(() => {
                if (focusHint && focusHint.parentNode) {
                    focusHint.remove();
                }
                focusHint = null;
            }, 300);
        }
        
        focusedMessage = null;
    }

    function handleFocusAction(action, message) {
        switch(action) {
            case 'copy':
                copyMessageText(message);
                break;
            case 'bookmark':
                toggleBookmark(message);
                disableFocusMode();
                break;
            case 'favorite':
                toggleFavorite(message);
                disableFocusMode();
                break;
        }
    }

    function copyMessageText(message) {
        const textElement = message.querySelector('.text');
        if (textElement) {
            const text = textElement.innerText;
            navigator.clipboard.writeText(text).then(() => {
                showToast(t('textCopied'));
            }).catch(() => {
                showToast('❌ ' + (currentLang === 'en' ? 'Copy failed' : currentLang === 'ru' ? 'Ошибка копирования' : 'Помилка копіювання'));
            });
        }
    }

    // Add interactive features
    function enhanceInteractivity() {
        // Spoiler reveal
        document.querySelectorAll('.spoiler.hidden').forEach(spoiler => {
            spoiler.addEventListener('click', function() {
                this.classList.remove('hidden');
                this.style.animation = 'fadeIn 0.3s ease';
            });
        });

        // Smooth scroll to message on hash change
        if (window.location.hash) {
            setTimeout(() => {
                const target = document.querySelector(window.location.hash);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    target.classList.add('selected');
                    setTimeout(() => target.classList.remove('selected'), 2000);
                }
            }, 500);
        }

        // Click on message to highlight (only if not in focus mode)
        document.querySelectorAll('.message.default').forEach(msg => {
            msg.addEventListener('click', function(e) {
                if (e.target.tagName === 'A' || e.target.closest('a')) return;
                if (e.target.closest('.focus-actions')) return;
                if (focusedMessage) return; // Don't interfere with focus mode
                
                document.querySelectorAll('.message.selected').forEach(m => 
                    m.classList.remove('selected')
                );
                this.classList.add('selected');
                
                setTimeout(() => {
                    this.classList.remove('selected');
                }, 2000);
            });
        });
    }

    // Lazy load images for better performance
    function lazyLoadImages() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                        }
                        observer.unobserve(img);
                    }
                });
            }, { rootMargin: '50px' });

            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }
    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    console.log('🚀 Telegram Chat Export Enhancer loaded!');
})();
