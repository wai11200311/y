AFRAME.registerComponent('warnai-sabuk', {
    schema: { type: 'string', default: '#FFFFFF' },
    init: function () {
        this.el.addEventListener('model-loaded', () => {
            this.update();
        });
    },
    update: function () {
        var mesh = this.el.getObject3D('mesh');
        var warna = this.data;
        
        if (!mesh) return;

        mesh.traverse(function (node) {
            if (node.isMesh && node.material) {
                node.material.map = null; 
                node.material.color.set(warna);
                node.material.needsUpdate = true;
            }
        });
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const audio = document.querySelector('#audioSejarah');
    const backsound = document.querySelector('#audioBacksound');
    const panel = document.querySelector('#panel-sabuk');
    const visualSabuk = document.querySelector('#visualSabuk');
    const judul = document.querySelector('#judul-sabuk');
    const arti = document.querySelector('#arti-sabuk');
    const marker = document.querySelector('#marker');
    
    const karakter = document.querySelector('#karakterUtama'); 
    const temple1 = document.querySelector('#temple1');
    const efekPartikel = document.querySelector('#efekPartikel');
    
    let data = [];
    let idx = 0;
    let markerVisible = false;
    let isAppStarted = false;
    let isAudioFinished = false;
    let sabukInterval;
    
    let sequenceState = 0; 

    if(backsound) backsound.volume = 0.15; 

    fetch('materi.json').then(r => r.json()).then(d => { data = d; });

    audio.addEventListener('timeupdate', () => {
        if (!markerVisible || isNaN(audio.duration) || audio.duration === 0) return;
        
        let batas = audio.duration / 2;
        
        if (audio.currentTime >= batas && sequenceState === 0) {
            sequenceState = 1;
            if(karakter) karakter.emit('sembunyi'); 
            setTimeout(() => { 
                if(karakter) karakter.setAttribute('visible', 'false');
                if(temple1) {
                    temple1.setAttribute('visible', 'true');
                    temple1.emit('muncul'); 
                }
            }, 1000); 
        }
    });

    function setDurasiPutaran() {
        if (!audio || isNaN(audio.duration)) return;
        let durasiAudio = audio.duration * 1000; 
        
        // --- DI UBAH JADI -90 AGAR BERDIRI TEGAK SAAT MARKER VERTIKAL ---
        let animasiBaru = `property: rotation; from: -90 0 0; to: -90 360 0; loop: true; dur: ${durasiAudio}; easing: linear`;
        
        if(karakter) karakter.setAttribute('animation', animasiBaru);
        if(temple1) temple1.setAttribute('animation', animasiBaru);
    }
    
    if (audio.readyState >= 1) {
        setDurasiPutaran();
    } else {
        audio.addEventListener('loadedmetadata', setDurasiPutaran);
    }

    document.querySelector('#tombol-mulai').addEventListener('click', () => {
        document.querySelector('#layar-mulai').classList.add('tersembunyi');
        isAppStarted = true;
        if(markerVisible && !isAudioFinished) {
            audio.play();
            if(backsound) backsound.play();
        }
    });

    marker.addEventListener('markerFound', () => {
        markerVisible = true;
        if (isAppStarted && !isAudioFinished && audio.paused) {
            audio.play();
            if(backsound) backsound.play();
        }
        
        if (isAudioFinished) {
            panel.classList.remove('tersembunyi');
            visualSabuk.setAttribute('visible', 'true');
            visualSabuk.setAttribute('scale', '1 1 1');
            
            if(karakter) {
                karakter.setAttribute('scale', '0 0 0'); 
                karakter.setAttribute('visible', 'false');
            }
            if(temple1) {
                temple1.setAttribute('scale', '0 0 0');
                temple1.setAttribute('visible', 'false');
            }
            if(efekPartikel) efekPartikel.setAttribute('visible', 'false');
        }
    });
    
    marker.addEventListener('markerLost', () => {
        markerVisible = false;
        if (!isAudioFinished) {
            audio.pause();
            if(backsound) backsound.pause();
        }
        panel.classList.add('tersembunyi');
        visualSabuk.setAttribute('visible', 'false');
    });

    audio.onended = () => {
        isAudioFinished = true;
        if(backsound) backsound.pause(); 
        
        if (markerVisible) {
            if(efekPartikel) efekPartikel.setAttribute('visible', 'false');
            
            if(karakter) karakter.emit('sembunyi');
            if(temple1) temple1.emit('sembunyi');
            
            setTimeout(() => {
                if(karakter) {
                    karakter.setAttribute('scale', '0 0 0');
                    karakter.setAttribute('visible', 'false');
                }
                if(temple1) {
                    temple1.setAttribute('scale', '0 0 0');
                    temple1.setAttribute('visible', 'false');
                }
                mulaiSiklusSabuk();
            }, 1000);
        }
    };

    function mulaiSiklusSabuk() {
        panel.classList.remove('tersembunyi');
        visualSabuk.setAttribute('visible', 'true');
        visualSabuk.emit('munculSabuk');
        
        updateSabuk();
        if (sabukInterval) clearInterval(sabukInterval);
        sabukInterval = setInterval(() => {
            idx = (idx + 1) % data.length;
            updateSabuk();
        }, 5000); 
    }

    function updateSabuk() {
        if (data.length === 0) return;
        const s = data[idx];
        judul.innerText = s.sabuk;
        arti.innerText = s.arti;
        visualSabuk.setAttribute('warnai-sabuk', s.warna);
    }
});

