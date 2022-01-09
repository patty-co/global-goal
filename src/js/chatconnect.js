let currentPercentage = 0;
let displayPercentage = 0;

let displayPercentageEl = document.getElementById('displayPercentage');
let progressGoalEl = document.getElementById('progressGoal');
let condensedProgressGoal = document.getElementById('condensedProgressGoal');

if(progressGoalEl) {
  progressGoalEl.max = GOAL_AMOUNT;
  progressGoalEl.value = displayPercentage;
} else if(condensedProgressGoal) {
  condensedProgressGoal.max = GOAL_AMOUNT;
  condensedProgressGoal.value = displayPercentage;
}

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

function updateHtml() {
  if(displayPercentageEl) {
    displayPercentageEl.innerHTML = `${displayPercentage}`;
  } else if(progressGoalEl) {
    progressGoalEl.value = displayPercentage;
    let data = progressGoalEl.getAttribute("data-text");
    progressGoalEl.setAttribute("data-text", `${displayPercentage}${data.charAt(data.length - 1)}`)
  } else if(displaycondensedProgressGoalPercentageEl) {
    progressGoalEl.value = displayPercentage;
    let data = progressGoalEl.getAttribute("data-text");
    let newData = data[i].replace(/\(?\d+(?:\.\d+)? ?%\)? */g, `${displayPercentage}%`);
    progressGoalEl.setAttribute("data-text", newData)

    
  }
}

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
  updateHtml();
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

        updateHtml();
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
  updateHtml();
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
