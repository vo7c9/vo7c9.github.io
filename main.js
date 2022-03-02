const startBut = document.getElementById('begin');
//const buttondown = document.getElementById('freqdown');
//const buttonup = document.getElementById('frequp');
const nDepth = document.getElementById("modDepth");
const filterFreq = document.getElementById("lPfreq");
const delFB = document.getElementById("delFB");

const AudioContext = window.AudioContext || window.webkitAudiocontext;
const ctx = new AudioContext();

//////////////////////////////////////Oscillator
const triOsc = ctx.createOscillator();
const split = ctx.createChannelSplitter(2);
let freqdest = 0;
let initfreq = 500;

triOsc.type = 'triOscangle';
triOsc.frequency.value = initfreq;
triOsc.connect(split);
triOsc.start();



////////////////////////////////////////////////////ERODE
///////////////////////////////////////Noise Source1
const bufferSize = ctx.sampleRate * 4;
const buffer1 = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
let data1 = buffer1.getChannelData(0); // get data

// fill the buffer with noise
for (let i = 0; i < bufferSize; i++) {
    data1[i] = Math.random() * 2 - 1;
}

let noise1 = ctx.createBufferSource();
noise1.buffer = buffer1;
noise1.loop = true;
noise1.start();

///////////////////////////////////////Noise Source2
//const bufferSize = ctx.sampleRate * 4;
const buffer2 = ctx.createBuffer(1, bufferSize, ctx.sampleRate);

let data2 = buffer2.getChannelData(0); // get data

// fill the buffer with noise
for (let i = 0; i < bufferSize; i++) {
    data2[i] = Math.random() * 2 - 1;
}

let noise2 = ctx.createBufferSource();
noise2.buffer = buffer2;
noise2.loop = true;
noise2.start();
/////////////////////////////////////
//////////////////////////////////////LP Filter1
const lP1 = ctx.createBiquadFilter();
const lP1Gain = ctx.createGain();

lP1Gain.gain.value = 0;
lP1.type = "lowpass";
lP1.frequency.value = 100;
noise1.connect(lP1, 0);
lP1.connect(lP1Gain);/////Gain sortie LP

//////////////////////////////////////LP Filter2
const lP2 = ctx.createBiquadFilter();
const lP2Gain = ctx.createGain();

lP2Gain.gain.value = 0;
lP2.type = "lowpass";
lP2.frequency.value = 100;
noise2.connect(lP2, 0);
lP2.connect(lP2Gain);/////Gain sortie LP
/////////////////////////////////////
/////////////////////////////////////Delay1
const del1 = ctx.createDelay();
const del1Mod = ctx.createGain();
const del1FB = ctx.createGain();
del1FB.gain.value = 0;
del1Mod.gain.value = 1;

let del1InitTime = 0.1;///////////////////Delay de base
let del1Time = ctx.createConstantSource();
del1Time.offset.value = del1InitTime;
del1Time.connect(del1Mod);

lP1Gain.connect(del1Mod);//////////////Bruit Filtré

del1Mod.connect(del1.delayTime);

split.connect(del1);//Entrée triOsc
del1.connect(del1FB);//Boucle de réinjection
del1FB.connect(del1);//Entrée FB

/////////////////////////////////////Delay2
const del2 = ctx.createDelay();
const del2Mod = ctx.createGain();
const del2FB = ctx.createGain();
del2FB.gain.value = 0;
del2Mod.gain.value = 1;

let del2InitTime = 0.1;///////////////////Delay de base
let del2Time = ctx.createConstantSource();
del2Time.offset.value = del2InitTime;
del2Time.connect(del2Mod);

lP2Gain.connect(del2Mod);//////////////Bruit Filtré

del2Mod.connect(del2.delayTime);

split.connect(del2);//Entrée triOsc
del2.connect(del2FB);//Boucle de réinjection
del2FB.connect(del2);//Entrée FB




//////////////////////////////////////Master Gain




///////////////////////////////////////Routing

const panL = ctx.createStereoPanner();
const panR = ctx.createStereoPanner();
panR.pan.value = 1;
panL.pan.value = -1;

del1.connect(panL);
del2.connect(panR);

panL.connect(ctx.destination);
panR.connect(ctx.destination);




////////////////////////////////////////////////user input
startBut.addEventListener('click', function() {

    // check if context is in suspended state (autoplay policy)
    if (ctx.state === 'suspended') {
        ctx.resume();
    }

}, false);

nDepth.oninput = function() {
  lP1Gain.gain.linearRampToValueAtTime(Math.pow(this.value, 3), ctx.currentTime + 0.05);
  lP2Gain.gain.linearRampToValueAtTime(Math.pow(this.value, 3), ctx.currentTime + 0.05);
}

filterFreq.oninput = function() {
  lP1.frequency.linearRampToValueAtTime(this.value, ctx.currentTime + 0.05);
  lP2.frequency.linearRampToValueAtTime(this.value, ctx.currentTime + 0.05);
}

delFB.oninput = function() {
  del1FB.gain.linearRampToValueAtTime(this.value, ctx.currentTime + 0.05);
  del2FB.gain.linearRampToValueAtTime(this.value, ctx.currentTime + 0.05);
}
