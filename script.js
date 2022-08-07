/* eslint-disable no-alert */
/**************
 *   SLICE 1
 **************/

function updateCoffeeView(coffeeQty) {
  document.getElementById('coffee_counter').innerText = coffeeQty;
}

function clickCoffee(data) {
  if (superCaffeine(data)) {
    let additionalCoffee = Math.floor(data.totalCPS/100) + 1
    document.getElementById('super_caffeine').innerText = `You're SUPER caffeinated! Now making ${additionalCoffee} coffee(s) per click!`;
    data.coffee += additionalCoffee;
  } else {
    data.coffee++;
  }
  updateCoffeeView(data.coffee);
  renderProducers(data);
}

/**************
 *   SLICE 2
 **************/

function unlockProducers(producers, coffeeCount) {
  producers.forEach(producer => {
    if (coffeeCount >= producer.price/2) {
      producer.unlocked = true;
    }
  })
}

function getUnlockedProducers(data) {
  unlockProducers(data.producers, data.coffee);
  return data.producers.filter(producer => producer.unlocked);
}

function makeDisplayNameFromId(id) {
  const name = id.split('_');
  return name.map(word => word[0].toUpperCase() + word.substring(1)).join(' ');
}

// You shouldn't need to edit this function-- its tests should pass once you've written makeDisplayNameFromId
function makeProducerDiv(producer) {
  const containerDiv = document.createElement('div');
  containerDiv.className = 'producer';
  const displayName = makeDisplayNameFromId(producer.id);
  const currentCost = producer.price;
  const html = `
  <div class="producer-column">
    <div class="producer-title">${displayName}</div>
    <button type="button" id="buy_${producer.id}">Buy</button>
  </div>
  <div class="producer-column">
    <div>Quantity: ${producer.qty}</div>
    <div>Coffee/second: ${producer.cps}</div>
    <div>Cost: ${currentCost} coffee</div>
  </div>
  `;
  containerDiv.innerHTML = html;
  return containerDiv;
}

function deleteAllChildNodes(parent) {
  while(parent.hasChildNodes()) {
    parent.removeChild(parent.lastChild);
  }
}

function renderProducers(data) {
  const producerContainer = document.getElementById('producer_container');
  deleteAllChildNodes(producerContainer);
  getUnlockedProducers(data).forEach(producer => {
    producerContainer.appendChild(makeProducerDiv(producer));
  })
}

/**************
 *   SLICE 3
 **************/

function getProducerById(data, producerId) {
  return data.producers.filter(producer => producer.id === producerId ? true : false)[0];
}

function canAffordProducer(data, producerId) {
  return data.coffee >= getProducerById(data, producerId).price;
}

function updateCPSView(cps) {
  document.getElementById('cps').innerText = cps;
}

function updatePrice(oldPrice) {
  return Math.floor(oldPrice * 1.25);
}

function attemptToBuyProducer(data, producerId) {
  const producer = getProducerById(data, producerId);
  const affordable = canAffordProducer(data, producerId);
  if (affordable) {
    producer.qty++;
    data.coffee -= producer.price;
    producer.price = updatePrice(producer.price);
    data.totalCPS += producer.cps;
  }
  return affordable;
}

function buyButtonClick(event, data) {
  if (event.target.tagName === 'BUTTON') {
    const id = event.target.id.slice(4);
    if (canAffordProducer(data, id)) {
      attemptToBuyProducer(data, id);
      renderProducers(data);
      updateCoffeeView(data.coffee);
      updateCPSView(data.totalCPS);

    } else {
      window.alert("Not enough coffee!");
    }
  }
}


function autoSave(data) {
  window.localStorage.setItem('data', JSON.stringify(data));
}

function tick(data) {
  data.coffee += data.totalCPS;
  updateCoffeeView(data.coffee);

  renderProducers(data);
  autoSave(data);
}

// one time upgrade!
// if at least 10 producers are unlocked,
// each click will yield 
function superCaffeine(data) {
  if (getUnlockedProducers(data).length >= 8) {
    const superCoffee = document.getElementById('super_caffeine');
    superCoffee.style.display = 'block';
    return true;
  } else {
    return false;
  }
}

/*************************
 *  Start your engines!
 *************************/

// You don't need to edit any of the code below
// But it is worth reading so you know what it does!

// So far we've just defined some functions; we haven't actually
// called any of them. Now it's time to get things moving.

// We'll begin with a check to see if we're in a web browser; if we're just running this code in node for purposes of testing, we don't want to 'start the engines'.

// How does this check work? Node gives us access to a global variable /// called `process`, but this variable is undefined in the browser. So,
// we can see if we're in node by checking to see if `process` exists.
function runGame(data) {
  tick(data);
  updateCPSView(data.totalCPS);
    
  // Add an event listener to the giant coffee emoji
  const bigCoffee = document.getElementById('big_coffee');
  bigCoffee.addEventListener('click', () => clickCoffee(data));

  // Add an event listener to the container that holds all of the producers
  // Pass in the browser event and our data object to the event listener
  const producerContainer = document.getElementById('producer_container');
  producerContainer.addEventListener('click', event => {
    buyButtonClick(event, data);
  });

  // Call the tick function passing in the data object once per second
  setInterval(() => tick(data), 1000);
}

if (typeof process === 'undefined') {
  // Get starting data from the window object
  // (This comes from data.js)

  let data;

  // divs on the page that reveal/hide the splash screen/game screen
  const splashPage = document.getElementById('splash');
  const gamePage = document.querySelector('.column-container');

  // buttons to choose whether to load old data or start a new game
  const newGameButton = document.getElementById('new_game');
  const restoreGameButton = document.getElementById('restore_game');
  newGameButton.addEventListener('click', ()=> {
    data = window.data;
    console.log('new game started');
    runGame(data);

    // splash page disappears, game page begins >:)
    newGameButton.style.display = 'none';
    restoreGameButton.style.display = 'none';
    splashPage.style.display = 'none';
    gamePage.style.display = 'flex';
  })
  restoreGameButton.addEventListener('click', ()=> {
    if (window.localStorage.getItem('data')) {
      data = JSON.parse(localStorage.getItem('data'));
    } else {
      window.alert('There was no old data to restore!\nWe\'ve initialized a new game for you');
    }
    console.log('old game restored');
    // separated running the game into a separate function so that data does not tick until we have made a selection
    // game only begins running again after user has chosen to restore/reset
    runGame(data);

    // splash page disappears, game page begins >:)
    newGameButton.style.display = 'none';
    restoreGameButton.style.display = 'none';
    splashPage.style.display = 'none';
    gamePage.style.display = 'flex';
  })
}
// Meanwhile, if we aren't in a browser and are instead in node
// we'll need to exports the code written here so we can import and
// Don't worry if it's not clear exactly what's going on here;
// We just need this to run the tests in Mocha.
else if (process) {
  module.exports = {
    updateCoffeeView,
    clickCoffee,
    unlockProducers,
    getUnlockedProducers,
    makeDisplayNameFromId,
    makeProducerDiv,
    deleteAllChildNodes,
    renderProducers,
    updateCPSView,
    getProducerById,
    canAffordProducer,
    updatePrice,
    attemptToBuyProducer,
    buyButtonClick,
    tick
  };
}
