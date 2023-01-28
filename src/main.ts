import QRCode from 'qrcode';
import './style.css';

type State = {
  title: string;
  channels: number;
  labels: string[];
  mics: string[];
  readonly: boolean;
  qr: boolean;
};

const initialState: State = {
  title: 'Chart',
  channels: 2,
  labels: ['Channel 1', 'Channel 2'],
  mics: ['🎙️', '🎤'],
  readonly: false,
  qr: true,
};

let state: State;

const app = document.getElementById('app')!;
const header = document.createElement('header');
app.appendChild(header);
const main = document.createElement('main');
app.appendChild(main);

const titleHeading = document.createElement('h1');
titleHeading.innerText = 'Chart';
checkContentEditable(titleHeading);
header.appendChild(titleHeading);
header.addEventListener('input', (event) => {
  setState({ title: (event.target as HTMLElement).innerText.trim() });
});
header.addEventListener('focusout', (event) => {
  (event.target as HTMLElement).innerText = (
    event.target as HTMLElement
  ).innerText.trim();
});

const list = document.createElement('ul');

render();

const adder = document.createElement('div');
adder.innerHTML = '+';
adder.className = 'adder';

adder.addEventListener('click', () => {
  const { channels, labels, mics } = getState();
  const channelNumber = channels + 1;
  labels.push(`Channel ${channelNumber}`);
  mics.push(channelNumber % 2 === 0 ? '🎤' : '🎙️');
  setState({ labels: labels, mics, channels: labels.length });
  render();
});

main.appendChild(list);
main.appendChild(adder);

const qr = document.createElement('img');
qr.id = 'qr';
qr.className = 'qr';
main.appendChild(qr);

function render() {
  const { channels, labels, mics, title, qr } = getState();
  if (title) {
    displayTitle(title);
  }
  if (qr) {
    displayQR();
  }
  Array.from({ length: channels }, (_, x) => x).forEach((i) => {
    addChannel(
      { label: labels[i] ?? `Channel ${i + 1}`, mic: mics[i] ?? '🎙️' },
      i + 1
    );
  });
}

function addChannel(
  { label, mic }: { label: string; mic: string },
  nr: number
) {
  const listItem = document.createElement('li');
  const id = `ch-${nr}`;
  listItem.id = id;

  const channelNumber = document.createElement('span');
  channelNumber.className = 'channel-number bordered';
  channelNumber.innerText = nr.toString();

  const channelLabel = document.createElement('span');
  channelLabel.className = 'channel-label bordered';
  channelLabel.innerText = label;
  checkContentEditable(channelLabel);

  channelLabel.addEventListener('input', (event) => {
    const { labels } = getState();
    const updatedLabels = labels.map((label, labelIdx) => {
      if (labelIdx === nr - 1) {
        return (event.target as HTMLElement).innerText;
      }
      return label;
    });
    setState({
      labels: updatedLabels,
    });
  });

  const channelMic = document.createElement('span');
  channelMic.className = 'channel-label bordered';
  channelMic.innerText = mic;
  checkContentEditable(channelMic);

  channelMic.addEventListener('input', (event) => {
    const { mics } = getState();
    const updatedMics = mics.map((mic, micIdx) => {
      if (micIdx === nr - 1) {
        return (event.target as HTMLElement).innerText;
      }
      return mic;
    });
    setState({
      mics: updatedMics,
    });
  });

  listItem.appendChild(channelNumber);
  listItem.appendChild(channelLabel);
  listItem.appendChild(channelMic);
  const existingNode = list.querySelector(`#${id}`);
  if (existingNode) {
    existingNode.replaceWith(listItem);
  } else {
    list.appendChild(listItem);
  }
}

function getState(): State {
  if (state) {
    return state;
  } else if (location.search) {
    const params = new URLSearchParams(location.search);
    const newState: any = {
      ...initialState,
    };
    params.forEach((val, key) => {
      if (['labels', 'mics'].includes(key)) {
        newState[key] = val.split(',') ?? [];
      } else if (['qr', 'readonly'].includes(key)) {
        newState[key] = val === 'true';
      } else if (['channels'].includes(key)) {
        newState[key] = parseInt(val, 10);
      } else {
        newState[key] = val;
      }
    });
    return newState as State;
  } else {
    return initialState;
  }
}

function setState(newState: Partial<State>) {
  const state = getState() as Record<string, any>;
  Object.entries(newState).forEach(([key, val]) => {
    state[key] = val;
  });
  const stateAsParams = new URLSearchParams(state);
  window.history.replaceState(null, '', `?${stateAsParams.toString()}`);
  if (state.qr) {
    displayQR();
  }
}

async function displayQR() {
  try {
    const dataURL = await QRCode.toDataURL(location.href, {
      color: {
        light: '#e3c475',
        dark: '#101612',
      },
    });
    const qr: HTMLImageElement = document.getElementById(
      'qr'
    )! as HTMLImageElement;
    qr.src = dataURL;
  } catch (err) {
    console.error(err);
  }
}

function displayTitle(title: string) {
  const heading = document.querySelector('h1');
  if (heading!.innerText.trim() !== title.trim()) {
    heading!.innerText = title;
  }
}

function checkContentEditable(element: HTMLElement) {
  element.contentEditable = getState().readonly ? 'false' : 'true';
}
