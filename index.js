document.addEventListener('load', () => {
	window.navigator
})

// DOM elements

const body = document.querySelector('body');
const player = document.querySelector('.player');
const controls = player.querySelector('.player-controls');
const video = player.querySelector('.viewer');
const progress = player.querySelector('.progress');
const progressBar = player.querySelector('.progress-filled');
const toggle = player.querySelector('.toggle');
const skipButtons = player.querySelectorAll('[data-skip]');
const ranges = player.querySelectorAll('.player-slider');
const volume = player.querySelector('.volume');
const speedBtn = player.querySelector('.speed');
const timeDone = player.querySelector('.meta .time-done');
const totalTime = player.querySelector('.meta .total-time');
const name = player.querySelector('.meta .name');
const fullScreen = player.querySelector('.fullScreen');
const input = document.querySelector('input[type=file]');
const message = document.querySelector('.message');

const vol = ranges[0];
const speed = ranges[1];
const change = new Event('change');

let fileName = 'test-video.mp4';

// functions

function togglePlay() {
	const action = video.paused ? 'play' : 'pause';
	video[action]();
}

function updateButton() {
	toggle.innerHTML = video.paused ? `<i class="fa fa-play" aria-hidden="true"></i>` : `<i class="fa fa-pause" aria-hidden="true"></i>`;
}

function skip(time) {
	video.currentTime += parseFloat(time);
}

function handleUpdate() {
	video[this.name] = this.value;
}

let lastVol = 1;

function mute() {
	if (vol.value == 0) {
		vol.value = lastVol;
	} else {
		lastVol = vol.value;
		vol.value = 0;
	}
	vol.dispatchEvent(change);
}

function clock(seconds) {
	const hrs = parseInt(seconds / 3600) > 0 ? parseInt(seconds / 3600) : 0;
	const mins = parseInt(seconds / 60) > 0 ? parseInt(seconds / 60) % 60 : 0;
	const secs = parseInt(seconds % 60);

	return [hrs, mins, secs];
}

function updateTimer() {
	const duration = clock(video.duration);
	const currentTime = clock(video.currentTime);

	totalTime.textContent = `${duration[0]}:${duration[1]}:${duration[2]}`;
	timeDone.textContent = `${currentTime[0]}:${currentTime[1]}:${currentTime[2]}`;
}

function handleProgress() {
	const percent = (video.currentTime / video.duration) * 100;
	progressBar.style.flexBasis = `${percent}%`;

	updateTimer();
}

function scrub(e) {
	const scrubTime = (e.offsetX / progress.offsetWidth) * video.duration;
	video.currentTime = scrubTime;

	updateTimer();
}

function goFullScreen() {
	if (document.webkitFullscreenElement) {
		document.webkitExitFullscreen();
	} else {
		player.webkitRequestFullscreen();
	}
}

function full() {
	if (document.webkitFullscreenElement) {
		player.style.setProperty('max-width', '100%');
		player.style.setProperty('width', '100%');
		player.style.setProperty('border', '0');
		player.classList.remove('hover');
		controls.classList.add('hover');
		fullScreen.innerHTML = `<i class="fa fa-compress" aria-hidden="true"></i>`;
	} else {
		player.removeAttribute('style');
		controls.classList.remove('hover');
		player.classList.add('hover');
		fullScreen.innerHTML = `<i class="fa fa-arrows-alt" aria-hidden="true"></i>`;
	}
}

// event listeners

document.addEventListener('keydown', (e) => {
	// spacebar = 32, esc = 27, -> = 39, <- = 37, ^ = 38, down = 40, + = shift + 187/107, - = 189/109, m = 77
	if ([32, 39, 37, 38, 40, 187, 107, 189, 109, 77, 70].includes(e.keyCode)) {
		e.preventDefault();
	}

	switch (e.keyCode) {
		case 32:
			togglePlay();
			break;
		case 39:
			skip(10);
			break;
		case 37:
			skip(-10);
			break;
		case 38:
			vol.stepUp();
			vol.dispatchEvent(change);
			break;
		case 40:
			vol.stepDown();
			vol.dispatchEvent(change);
			break;
		case 77:
			mute();
			break;
		case 70:
			goFullScreen();
			break;
		case 187:
		case 107:
			speed.stepUp();
			speed.dispatchEvent(change);
			break;
		case 189:
		case 109:
			speed.stepDown();
			speed.dispatchEvent(change);
			break;
	}
});

document.addEventListener('webkitfullscreenchange', full);

let lastMove = 0;

setInterval(() => {
	lastMove++;
	if (document.webkitFullscreenElement && lastMove > 500) {
		video.style.cursor = 'none';
	} else {
		video.style.cursor = 'unset';
	}
}, 10);

document.addEventListener('mousemove', () => lastMove = 0);

video.addEventListener('click', togglePlay);
video.addEventListener('play', updateButton);
video.addEventListener('pause', updateButton);
video.addEventListener('timeupdate', handleProgress);
video.addEventListener('volumechange', function () {
	if (this.volume === 0) {
		volume.innerHTML = `<i class="fa fa-volume-off" aria-hidden="true">`;
	} else if (this.volume > 0.5) {
		volume.innerHTML = `<i class="fa fa-volume-up" aria-hidden="true">`;
	} else {
		volume.innerHTML = `<i class="fa fa-volume-down" aria-hidden="true">`;
	}
});
video.addEventListener('canplay', () => {
	updateTimer();
	name.textContent = fileName;
});

let mouseDown = false;

progress.addEventListener('click', scrub);
progress.addEventListener('mousemove', (e) => mouseDown && scrub(e));
progress.addEventListener('mousedown', () => mouseDown = true);
progress.addEventListener('mouseup', () => mouseDown = false);

toggle.addEventListener('click', togglePlay);

skipButtons.forEach(button => {
	button.addEventListener("click", function () {
		skip(this.dataset.skip);
	});
});

ranges.forEach(range => range.addEventListener('change', handleUpdate));
ranges.forEach(range => range.addEventListener('mousemove', handleUpdate));

volume.addEventListener('click', mute);

speedBtn.addEventListener('click', () => {
	speed.value = 1;
	speed.dispatchEvent(change);
});

fullScreen.addEventListener('click', goFullScreen);

input.addEventListener('change', function(e) {
	const file = this.files[0];
	const type = file.type;
	if (video.canPlayType(type)) {
		const fileUrl = URL.createObjectURL(file);
		video.src = fileUrl;
		message.textContent = '';
		fileName = file.name;
	} else {
		message.textContent = `Cannot play ${type} files!`;
	}
});

// modal related

const modal = document.querySelector('.modal');
const info = document.querySelector('.info');
const closeModal = document.querySelector('.close');

info.addEventListener('click', () => modal.style.display = "block" );
closeModal.addEventListener('click', () => modal.style.display = "none" );
window.addEventListener('click', e => e.target == modal && (modal.style.display = "none"));