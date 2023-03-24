import bot from './assets/bot.svg';
import user from './assets/user.svg';

const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');

let loadInterval;

function loader(elememt) {
  elememt.textContent = '';

  loadInterval = setInterval(() => {
    elememt.textContent += '.';

    if (elememt.textContent === '....') {
      elememt.textContent = '';
    }
  }, 300)
}

function typeText(elememt, text) {
  let index = 0;

  let interval = setInterval(() => {
    if(index < text.length) {
      elememt.innerHTML += text.charAt(index);
      index++;
    } else {
      clearInterval(interval);
    }
  }, 10);
}

function generateUniqueID() {
  const timeStamp = Date.now();

  function createIdStr(length) {
    let idStr = ""
    let alphaNumStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    for ( let i = 0; i < length; i++ ) {
        idStr += alphaNumStr.charAt(Math.floor(Math.random() * alphaNumStr.length))
   }

   return idStr
  }

  return `id-${Math.floor(Math.random() * 1000)}-${timeStamp}-${createIdStr(16)}`;
}

function chatStripe (isAi, value, uniqueId) {
  return (
    `
      <div class="wrapper ${isAi && 'ai'}">
        <div class="chat">
          <div class="profile">
            <img src="${isAi ? bot : user}" alt="${isAi ? 'bot' : 'user'}" />
          </div>
          <div class="message" id=${uniqueId}>${value}</div>
        </div>
    </div>
    `
  )
}

const handleSubmit = async (e) => {
  e.preventDefault();

  const data = new FormData(form);
  
  //user's chatstripe
  chatContainer.innerHTML += chatStripe(false, data.get('prompt'));

  form.reset();

  //bot's chatstripe
  const uniqueId = generateUniqueID();
  chatContainer.innerHTML += chatStripe(true, " ", uniqueId);

  chatContainer.scrollTop = chatContainer.scrollHeight;

  const messageDiv = document.getElementById(uniqueId);

  loader(messageDiv);

  // fetch data from server -> bot's response

  const response = await fetch('http://localhost:5000', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: data.get('prompt'),
    }),
  });

  clearInterval(loadInterval);
  messageDiv.innerHTML = ' ';

  if (response.ok) {
    const data = await response.json();
    const parsedData = data.bot.trim();

    typeText(messageDiv, parsedData);
  } else {
    const err = await response.text();

    messageDiv.innerHTML = "Something went wrong!";

    alert(err);
  }

}

form.addEventListener('submit', handleSubmit);
form.addEventListener('keyup', (e) => {
  if (e.keyCode === 13) {
    handleSubmit(e);
  }
});