
const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = 'F8_PLAYER';

const heading = $('#header h2');
const cdThumb = $('.header--avatar');
const audio = $('#audio');
const cd = $('.header--avatar');
const playBtn = $('.control--play');
const progress = $('.progress');
const nextBtn = $('.control--next');
const prevBtn = $('.cotrol--previous');
const reapBtn = $('.control--repeat');
const randBtn = $('.control--random');

const app = {
    currentIndexPrevious: 0,
    currentIndex: 0,
    isPlaying: false,
    isRepeat: false,
    isRandom: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [
        {
            name: 'Nơi này có anh',
            singer: 'Sơn Tùng MTP',
            path: './audio/audio1.mp3',
            image: './imgs/img1.jpg'
        },
        {
            name: 'Có hẹn với thanh xuân',
            singer: 'MonStar',
            path: './audio/audio2.mp3',
            image: './imgs/img2.jpg'
        },
        {
            name: 'Nếu ta ngược lối',
            singer: 'Đình Dũng',
            path: './audio/audio3.mp3',
            image: './imgs/img3.jpg'
        },
        {
            name: 'Thức giấc',
            singer: 'DaLAB',
            path: './audio/audio4.mp3',
            image: './imgs/img4.jpg'
        },
        {
            name: 'Sài Gòn đau lòng quá',
            singer: 'Hoàng Duyên x Hứa Kim Tuyền',
            path: './audio/audio5.mp3',
            image: './imgs/img5.jpg'
        },
        {
            name: 'Hẹn yêu',
            singer: 'Gino',
            path: './audio/audio6.mp3',
            image: './imgs/img6.jpg'
        }
    ],

    setConfig: function (key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
    },

    render: function () {
        const htmls = this.songs.map(function (song, index) {
            return `
                <div class="playlist__item" id="song${index}">
                    <div class="item__avatar"
                        style="background: url('${song.image}') no-repeat center / contain;">
                    </div>
                    <div class="item__content">
                        <div class="item__content--name">${song.name}</div>
                        <div class="item__content--author">${song.singer}</div>
                    </div>
                    <div class="item__option"><i class="fas fa-ellipsis-h"></i></div>
                </div>
            `;
        });
        $('#playlist').innerHTML = htmls.join('');
    },

    defaultProperties: function () {
        Object.defineProperty(this, 'currentSong', {
            get: function () {
                return this.songs[this.currentIndex];
            }
        });
    },

    handleEvents: function () {
        const _this = this;
        const cdWidth = cd.offsetWidth;

        const cdThumbAnimate = cdThumb.animate([
            { transform: 'rotate(360deg)' }
            ], {
            duration: 10000,
            iterations: Infinity
        });

        cdThumbAnimate.pause();

        const playBtnAnimate = playBtn.animate([
            { transform: 'scale(1.3)' }
            ], {
            duration: 500,
            iterations: Infinity
        });

        playBtnAnimate.pause();

        document.onscroll = function () {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const newCdWidth = cdWidth - scrollTop;
            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0;
            cd.style.opacity = newCdWidth / cdWidth;
        };

        // playBtn_Click
        playBtn.onclick = function () {
            if (_this.isPlaying) {
                audio.pause();
            }
            else {
                audio.play();
            }
        };

        audio.onplay = function () {
            _this.isPlaying = true;
            playBtn.classList.remove('fa-play');
            cdThumbAnimate.play();
            playBtnAnimate.play();
        };

        audio.onpause = function () {
            _this.isPlaying = false;
            playBtn.classList.add('fa-play');
            cdThumbAnimate.pause();
            playBtnAnimate.pause();
        };

        audio.ontimeupdate = function () {
            var percent = (audio.currentTime / audio.duration) * 100;
            progress.value = percent;
        };

        progress.oninput = function (e) {
            audio.currentTime = audio.duration * e.target.value / 100;
        };

        // nextBtn_click
        nextBtn.onclick = function () {
            _this.nextSong();
            audio.play();
            _this.scrollToActiveSong();
        };

        // prevBtn_click
        prevBtn.onclick = function () {
            _this.prevSong();
            audio.play();
            _this.scrollToActiveSong();
        };

        // reapBtn_click
        reapBtn.onclick = function () {
            _this.isRepeat = !_this.isRepeat;
            _this.setConfig('isRepeat', _this.isRepeat);
            reapBtn.classList.toggle('control--active', _this.isRepeat);
        }

        // randBtn_click
        randBtn.onclick = function () {
            _this.isRandom = !_this.isRandom;
            _this.setConfig('isRandom', _this.isRandom);
            randBtn.classList.toggle('control--active', _this.isRandom);
        };

        // Xử lý next song khi audio ended
        audio.onended = function () {
            if (_this.isRepeat) {
                audio.currentTime = 0;
                audio.play();
            }
            else {
                _this.nextSong();
                audio.play();
            }
        };

        // Lắng nghe hành vi khi click vào playlist
        const playList = $$('.playlist__item');
        playList.forEach(function (song, index) {
            song.onclick = function (e) {
                if (e.target.closest('.item__option')) {
                    // option button
                }
                else if (index !== _this.currentIndex) {
                    _this.currentIndex = index;
                    _this.renderPlaylist();
                    _this.loadCurrentSong();
                    audio.play();
                }
            };
        });
    },

    scrollToActiveSong: function () {
        setTimeout(() => {
            if (this.currentIndex === 0) {
                $('#song' + this.currentIndex).scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }
            else {
                $('#song' + this.currentIndex).scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest'
                });
            }
        }, 200);
    },

    nextSong: function () {
        if (this.isRandom) {
            this.playRandomSong();
        }
        else {
            this.currentIndex++;
            if (this.currentIndex >= this.songs.length) {
                this.currentIndex = 0;
            }
        }
        this.loadCurrentSong();
        this.renderPlaylist();
    },

    prevSong: function () {
        if (this.isRandom) {
            this.playRandomSong();
        }
        else {
            this.currentIndex--;
            if (this.currentIndex < 0) {
                this.currentIndex = this.songs.length - 1;
            }
        }
        this.loadCurrentSong();
        this.renderPlaylist();
    },

    loadConfig: function () {
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;
    },

    loadCurrentSong: function () {
        heading.textContent = this.currentSong.name;
        cdThumb.setAttribute('src', `${this.currentSong.image}`);
        audio.src = this.currentSong.path;
    },

    renderPlaylist: function () {
        $('#song' + this.currentIndexPrevious).classList.remove('active');
        $('#song' + this.currentIndex).classList.add('active');
        this.currentIndexPrevious = this.currentIndex;
    },

    playRandomSong: function () {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * this.songs.length);
        }
        while (newIndex === this.currentIndex);
        this.currentIndex = newIndex;
    },

    start: function () {
        // Gán cấu hình từ config vào app.
        this.loadConfig();

        // Set default
        this.defaultProperties();

        // Render tất cả bài hát lên app
        this.render();

        // Xử lý event
        this.handleEvents();

        // Load bài hát đang phát
        this.loadCurrentSong();

        // Render bài hát dưới playlist
        this.renderPlaylist();

        // Hiển thị trạng thái ban đầu của button Repeat và Random
        reapBtn.classList.toggle('control--active', this.isRepeat);
        randBtn.classList.toggle('control--active', this.isRandom);
    }
};

app.start();