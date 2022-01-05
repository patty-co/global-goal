let currentPercentage = 0;
let displayPercentage = 0;

let displayPercentageEl = document.getElementById('displayPercentage');

const options = {
  options: { 
    debug: false
  },
  connection: {
    reconnect: true,
    secure: true,
    timeout: 180000,
    reconnectDecay: 1.4,
    reconnectInterval: 1000,
  },
  identity: {
    username: BOT_USERNAME,
    password: OAUTH_TOKEN
  },
  channels: CHANNEL_NAME
}

const client = new tmi.Client(options)
client.connect();

function addSub(method) {
  let subPlan = method.plan;
  let percentageIncrease = 0;

  switch(subPlan) {
    case '1000':
      percentageIncrease = (SUB_VALUE * 100 ) / GOAL_AMOUNT;
      break;
    case '2000':
      percentageIncrease = (T2_VALUE * 100 ) / GOAL_AMOUNT;
      break;
    case '3000':
      percentageIncrease = (T3_VALUE * 100 ) / GOAL_AMOUNT;
      break;
    case 'Prime':
      percentageIncrease = (SUB_VALUE * 100 ) / GOAL_AMOUNT;
      break;
  }

  currentPercentage += percentageIncrease;
  displayPercentage = Math.round(currentPercentage);
  displayPercentageEl.innerHTML = `${displayPercentage}`;
}

client.on('message', async (channel, userstate, message, self) => {
  
  if (self) {
    return;
  }

  if(userstate.username === DONATION_BOT_NAME) {
    if(message.includes(DONATION_UNIQUE_MESSAGE)) {
      const regexpCommand = new RegExp(/([0-9]+\.?[0-9]*|\.[0-9]+)/);
      let tip = message.match(regexpCommand);

      if(tip != undefined) {
        let percentageIncrease = (tip[0] * 100 ) / GOAL_AMOUNT;
        
        currentPercentage += percentageIncrease;
        displayPercentage = Math.round(currentPercentage);
        displayPercentageEl.innerHTML = `${displayPercentage}`;
      }
    }
  }
})

client.on('subscription', (channel, username, method, message, userstate) => {
    addSub(method);
})

client.on('cheer', (channel, userstate, message) => {
  let cheerAmount = userstate.bits;
  let euroCheer = cheerAmount * CHEER_VALUE;
  let percentageIncrease = (euroCheer * 100 ) / GOAL_AMOUNT;

  currentPercentage += percentageIncrease;
  displayPercentage = Math.round(currentPercentage);
  displayPercentageEl.innerHTML = `${displayPercentage}`;
})

client.on('giftpaidupgrade', (channel, username, sender, userstate) => {
  addSub(method);
})

client.on('resub', (channel, username, months, message, userstate, methods) => {
  addSub(methods);
})

client.on('subgift', (channel, username, streakMonths, recipient, methods, userstate) => {
  addSub(methods);
})
