'use strict';

let ledCharacteristic = null;
let poweredOn = false;
var bleService = '0000ffe0-0000-1000-8000-00805f9b34fb';
var bleCharacteristic = '0000ffe1-0000-1000-8000-00805f9b34fb';

function onConnected() {
    document.querySelector('.connect-button').classList.add('hidden');
    document.querySelector('.color-buttons').classList.remove('hidden');
    document.querySelector('.mic-button').classList.remove('hidden');
    document.querySelector('.power-button').classList.remove('hidden');
    poweredOn = true;
}

function onDisconnected() {
    document.querySelector('.connect-button').classList.remove('hidden');
    document.querySelector('.color-buttons').classList.add('hidden');
    document.querySelector('.mic-button').classList.add('hidden');
    document.querySelector('.power-button').classList.add('hidden');
}

function connect() {
    console.log('Requesting Bluetooth Device...');
    navigator.bluetooth.requestDevice(
        {
            filters: [{ services: ['0000ffe0-0000-1000-8000-00805f9b34fb'] }]
        })
        .then(device => {
            console.log('> Found ' + device.name);
            console.log('Connecting to GATT Server...');
            device.addEventListener('gattserverdisconnected', onDisconnected)
            return device.gatt.connect();
        })
        .then(server => {
            console.log('Getting Service 0xffe5 - Light control...');
            return server.getPrimaryService(bleService);
        })
        .then(service => {
            console.log('Getting Characteristic 0xffe9 - Light control...');
            return service.getCharacteristic(bleCharacteristic);
        })
        .then(characteristic => {
            console.log('All ready!');
            ledCharacteristic = characteristic;
            onConnected();
        })
        .catch(error => {
            console.log('Argh! ' + error);
        });
}

function powerOn() {
  let data = new Uint8Array([0xcc, 0x23, 0x33]);
  return ledCharacteristic.writeValue(data)
      .catch(err => console.log('Error when powering on! ', err))
      .then(() => {
          poweredOn = true;
          toggleButtons();
      });
}

function powerOff() {
  let data = new Uint8Array([0xcc, 0x24, 0x33]);
  return ledCharacteristic.writeValue(data)
      .catch(err => console.log('Error when switching off! ', err))
      .then(() => {
          poweredOn = false;
          toggleButtons();
      });
}

function togglePower() {
    if (poweredOn) {
        powerOff();
    } else {
        powerOn();
    }
}

function toggleButtons() {
    Array.from(document.querySelectorAll('.color-buttons button')).forEach(function(colorButton) {
      colorButton.disabled = !poweredOn;
    });
    document.querySelector('.mic-button button').disabled = !poweredOn;
}

function setColor(red, green, blue) {
    let data = new Uint8Array([0x56, red, green, blue, 0x00, 0xf0, 0xaa]);
    return ledCharacteristic.writeValue(data)
        .catch(err => console.log('Error when writing value! ', err));
}

function red() {
    return setColor(255, 0, 0)
        .then(() => console.log('Color Red'));
}

function green() {
    return setColor(0, 255, 0)
        .then(() => console.log('Color Green'));
}

function blue() {
    return setColor(0, 0, 255)
        .then(() => console.log('Color Blue'));
}

function listen() {
    annyang.start({ continuous: true });
}
function str2ab(str)
    {
        var buf = new ArrayBuffer(str.length);
        var bufView = new Uint8Array(buf);
        for (var i = 0, l = str.length; i < l; i++) {
            bufView[i] = str.charCodeAt(i);
        }
        return buf;
    }
function cally(){
    ledCharacteristic.writeValue(str2ab('y'+"\n"))
    console.log("You called y ");
}
function calln(){
    ledCharacteristic.writeValue(str2ab('n'+"\n"))
    console.log("You called n ");
}
function calls(){
    ledCharacteristic.writeValue(str2ab('s'+"\n"))
    console.log("You called s");
}
// Voice commands
annyang.addCommands({
    'n' : calln,
    'y' : cally,
    's' : calls,
    'red': red,
    'green': green,
    'blue': blue,
    'yellow': () => setColor(127, 127, 0),
    'orange': () => setColor(127, 35, 0),
    'purple': () => setColor(127, 0, 127),
    'pink': () => setColor(180, 12, 44),
    'cyan': () => setColor(0, 127, 127),
    'white': () => setColor(127, 127, 127),
    'turn on': powerOn,
    'turn off': powerOff
});
