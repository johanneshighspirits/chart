import './style.css';

const app = document.getElementById('app')!;
const list = document.createElement('ul');
const channels = initChannels();

channels.forEach((name, i) => addChannel(name, i + 1));

const adder = document.createElement('div');
adder.innerHTML = '+';
adder.className = 'adder';

adder.addEventListener('click', () => {
  const params = new URLSearchParams(location.search);
  const channelLabels = params.get('labels')?.split(',') ?? [];
  const channelNumber = channelLabels.length + 1;
  channelLabels.push(`Channel ${channelNumber}`);
  setState({ labels: channelLabels });
  addChannel(`Channel ${channelNumber}`, channelNumber);
});

app.appendChild(list);
app.appendChild(adder);

function initChannels() {
  if (location.search) {
    const params = new URLSearchParams(location.search);
    const channels = params.get('channels');
    if (channels) {
      const newLabels = Array.from(
        { length: parseInt(channels, 10) },
        (_, nr) => `Channel ${nr + 1}`
      );
      setState({ labels: newLabels, channels: null });
      return newLabels;
    }
    const channelLabels = params.get('labels')?.split(',');
    return channelLabels ?? [];
  } else {
    return [];
  }
}

function addChannel(label: string, nr: number) {
  const listItem = document.createElement('li');

  const channelNumber = document.createElement('span');
  channelNumber.className = 'channel-number bordered';
  channelNumber.innerText = nr.toString();

  const channelText = document.createElement('span');
  channelText.className = 'channel-label bordered';
  channelText.innerText = label;
  channelText.contentEditable = getState().readonly ? 'false' : 'true';

  channelText.addEventListener('input', (event) => {
    const params = new URLSearchParams(location.search);
    const channelLabels = params.get('labels')?.split(',') ?? [];
    const updatedLabels = channelLabels.map((label, labelIdx) => {
      if (labelIdx === nr - 1) {
        return (event.target as HTMLElement).innerText;
      }
      return label;
    });
    setState({
      labels: updatedLabels,
    });
  });

  listItem.appendChild(channelNumber);
  listItem.appendChild(channelText);
  list.appendChild(listItem);
}

function getState(): Record<string, any> {
  const params = new URLSearchParams(location.search);
  const state = Object.fromEntries((params as any).entries());
  return {
    ...state,
    labels: state.labels?.split(',') ?? [],
  };
}

function setState(newState: Record<string, any>) {
  const state = getState();
  Object.entries(newState).forEach(([key, val]) => {
    if (val === null) {
      delete state[key];
    } else {
      state[key] = val;
    }
  });
  const stateAsParams = new URLSearchParams(state);
  window.history.replaceState(null, '', `?${stateAsParams.toString()}`);
}
