import { enemyAttack, playerAttack } from "./attack.js";

let gameLog = ``;

const defaultActionButtonHTML = `
            <button class="js-attack-button default-buttons">Attack</button>
            <button class="js-skill-button default-buttons">Skill</button>
            <button class="js-item-button default-buttons">Item</button>
            <button class="js-exit-button default-buttons">Exit</button>
      `;

function setAudioLevel(){
  const bgm = document.getElementById('bgm');

// Set the volume (0.0 to 1.0)
bgm.volume = 0.03; // Example: sets volume to 50%
}

function addAudio() {
  return ` <audio id="bgm" controls autoplay loop style="position: absolute; left: -9999px;">
        <source src="audio/bgm.mp4" type="audio/mp4">
    </audio>`;
}

const playerCharacter1 = {
  name: 'Player',
  image: 'images/player.png',
  health: 100,
  inventory: [{name: 'small potion'}],
  equipedDice: [{
    name: 'Fire Dice',
    sides: 6,
    description: 'Has a 40% chance to apply burn'
  }, 
  {
    name: 'Water Dice',
    sides: 6,
    description: 'Has a 20% chance to stun the enemy'
  }, 
  {
    name: 'Earth Dice',
    sides: 6,
    description: 'Adds a x2 multiplier to your damage'
  }],
  skillCooldown: 0,
  roll: 6,
}

const enemyCharacter = {
  name: 'Enemy',
  image: 'images/enemy.png',
  health: 200,
  equipedDice: [{
    name: 'Goblin Dice',
    sides: 6,
    description: 'Attack 1.5x the roll'
  }],
  roll: 6,
  isBurned: false,
  isStunned: false
}

let queue = [];

function updateHealth() {

  if (enemyCharacter.health < 0) {
    enemyCharacter.health = 0;
  }
  if (playerCharacter1.health < 0) {
    playerCharacter1.health = 0;
  }

  document.getElementById("health-player").style.width = `${playerCharacter1.health}%`;
  document.getElementById("health-player").innerHTML = `${playerCharacter1.health}`;

  document.getElementById("health-enemy").style.width = `${enemyCharacter.health / 200 * 100}%`;
  document.getElementById("health-enemy").innerHTML = `${enemyCharacter.health}`;
}

function exitGame() {
  document.querySelector('.js-battle-scene').innerHTML = `
  <button class="play-game-button js-play-button">Play Game</button>
  `;

  document.querySelector('.js-play-button')
  .addEventListener('click', () => {
    start();
  });
}

function returnButton() {
  document.querySelector('.js-return-button')
  .addEventListener('click', () => {
    document.querySelector('.js-action-button').innerHTML = defaultActionButtonHTML;
    addButtonFunctionality();
  });
}

function addButtonFunctionality() {
  document.querySelector('.js-exit-button')
  .addEventListener('click', () => {
    exitGame();
  });

  document.querySelector('.js-attack-button')
    .addEventListener('click', () => {
      document.querySelector('.js-action-button').innerHTML = `
            <button class="fire-dice js-attack-dice" data-id="fire" title="${playerCharacter1.equipedDice[0].description}">Fire Dice🔥</button>
            <button class="water-dice js-attack-dice" data-id="water" title="${playerCharacter1.equipedDice[1].description}">Water Dice💧</button>
            <button class="earth-dice js-attack-dice" data-id="earth" title="${playerCharacter1.equipedDice[2].description}">Earth Dice🪨</button>
            <button class="js-return-button default-buttons">Return</button>
      `;

      returnButton();

      document.querySelectorAll('.js-attack-dice')
        .forEach((button) => {
          button.addEventListener('click', async (event) => {
            document.querySelector('.js-action-button').style.visibility = 'hidden';
            const buttonid = button.dataset.id;
            playerCharacter1.roll = roll();
            const attackType = event.currentTarget.dataset.id;

            if(playerCharacter1.skillCooldown === 1){
              playerCharacter1.skillCooldown = 0;
            }

            const playerAttackDamage = playerAttack(buttonid, playerCharacter1.roll);
            document.querySelector('.js-player-roll-img').classList.add('dicea');
            await wait(500);
            updateRoll();
            document.querySelector('.js-player-roll-img').classList.remove('dicea');
            triggerAttackAnimation(attackType);
            if(buttonid !== 'earth') {
              const chance = Math.floor(Math.random() * 100).toFixed(0);
              console.log(chance);
              if(buttonid === 'fire'){
                if(chance <= 40 && enemyCharacter.isBurned === false) {
                  console.log('apply burn');
                  enemyCharacter.isBurned = true;
                  gameLog += `\n Applied Burn to Enemy!`;
                  updateChatLog();
                  document.querySelector('.enemy-sprite').classList.add('burn');
                };
                gameLog += `\n Player used an ${buttonid} Dice and rolled a ${playerCharacter1.roll}! And did ${playerAttackDamage} dmg to the Enemy!`;
                updateChatLog();
                enemyCharacter.health = enemyCharacter.health - playerAttackDamage;
                showDamagePopup(playerAttackDamage, 'enemy');
                turnCount++;
                queue.push(queue.shift());
                gameLogic();
              } else if (buttonid === 'water'){
                if(chance <= 20 && enemyCharacter.isStunned === false) {
                  console.log('apply stun');
                  enemyCharacter.isStunned = true;
                  gameLog += `\n Applied Stun to Enemy!`;
                  updateChatLog();
                  document.querySelector('.enemy-sprite').classList.add('stun');
                }
                gameLog += `\n Player used an ${buttonid} Dice and rolled a ${playerCharacter1.roll}! And did ${playerAttackDamage} dmg to the Enemy!`;
                updateChatLog();
                enemyCharacter.health = enemyCharacter.health - playerAttackDamage;
                showDamagePopup(playerAttackDamage, 'enemy');
                turnCount++;
                queue.push(queue.shift());
                gameLogic();
              }
            } else {
              gameLog += `\n Player used an ${buttonid} Dice and rolled a ${playerCharacter1.roll}! And did ${playerAttackDamage} dmg to the Enemy!`;
              updateChatLog();
              enemyCharacter.health = enemyCharacter.health - playerAttackDamage;
              showDamagePopup(playerAttackDamage, 'enemy');
              turnCount++;
              queue.push(queue.shift());
              gameLogic();
            }
          });
        });

  })

  document.querySelector('.js-skill-button')
    .addEventListener('click', () => {
      document.querySelector('.js-action-button').innerHTML = `
      <button class="chain-skill skill js-chain-skill" title="Chain 2 Dice Together. Costs 10HP">Chain⛓️</button>
      <button class="js-return-button default-buttons">Return</button>
      `;

      returnButton();

      document.querySelector('.js-chain-skill')
        .addEventListener('click', () => {
          if(playerCharacter1.health <= 10){
            gameLog += `\n Can't use skill, you'll die.`;
            updateChatLog();
            return;
          };
          if(playerCharacter1.skillCooldown === 1){
            gameLog += `\n Can't use skill, it's on cooldown this turn.`;
            updateChatLog();
            return;
          };

          const chain = [];
          let chaincount = 0;

          gameLog += `\n Select 2 Dice to Chain;`;
          updateChatLog();

          document.querySelector('.js-action-button').innerHTML = `
            <button class="fire-dice js-attack-dice chain-dice" data-id="fire" title="${playerCharacter1.equipedDice[0].description}">Fire Dice🔥</button>
            <button class="water-dice js-attack-dice chain-dice" data-id="water" title="${playerCharacter1.equipedDice[1].description}">Water Dice💧</button>
            <button class="earth-dice js-attack-dice chain-dice" data-id="earth" title="${playerCharacter1.equipedDice[2].description}">Earth Dice🪨</button>
            <button class="js-return-button default-buttons">Return</button>
          `;
          returnButton();

          document.querySelectorAll('.chain-dice')
            .forEach((button) => {
              button.addEventListener('click', async () => {
                const buttonid = button.dataset.id;
                if(button.classList.contains('clicked')){
                  const index = chain.indexOf(buttonid);
                  button.classList.remove('clicked');
                  chain.splice(index, 1);
                  chaincount--;
                  return;
                }
                button.classList.add('clicked');
                chaincount+= 1;
                chain.push(buttonid);
                console.log(chain);

                if(chaincount === 2){
                  playerCharacter1.skillCooldown++
                  gameLog += `\n Inflicted 10 Damage to yourself!`;
                  gameLog += `\n You chained ${chain[0]} and ${chain[1]} dice together!`
                  updateChatLog();
                  playerCharacter1.health = playerCharacter1.health - 10;
                  showDamagePopup(10, 'player');
                  document.querySelector('.js-action-button').style.visibility = 'hidden';
                  processChain(chain);
                  await wait(5000);
                  turnCount++;
                  queue.push(queue.shift());
                  gameLogic();
                }
              })
            })

        })

    })
};

function rollSpeed() {
  const playerRoll = Math.floor(Math.random() * 6) + 1;
  const enemyRoll = Math.floor(Math.random() * 6) + 1;

  if (playerRoll >= enemyRoll) {
    queue[0] = 'Player';
    queue[1] = 'Enemy';
  } else {
    queue[0] = 'Enemy';
    queue[1] = 'Player';
  };

  gameLog += `Player rolled ${playerRoll} and Enemy rolled ${enemyRoll}! ${queue[0]} gets first turn!`;

  playerCharacter1.roll = playerRoll;
  enemyCharacter.roll = enemyRoll;
}

function updateRoll(){
  document.querySelector('.js-enemy-roll-img').src = `images/dice${enemyCharacter.roll}.png`;
  document.querySelector('.js-player-roll-img').src = `images/dice${playerCharacter1.roll}.png`;
}


function playGame() {
  const audioAppend = addAudio();
  document.querySelector('.js-battle-scene').innerHTML = `
  <div class="turn-order">
            <span class="turn-order-label">Turn Order:</span>
            <div class="turn js-turn-1">#1 ${queue[0]}</div>
            <div class="turn js-turn-2">#2 ${queue[1]}</div>
            <!-- Add more turns as needed -->
        </div>
        <div class="chat-log js-chat-log"></div>
        <div class="enemy-section">
            <div class="enemy-info">
                <h2>${enemyCharacter.name}</h2>
                <div class="health-bar">
                    <div class="health" id="health-enemy">${enemyCharacter.health}</div>
                </div>
                <div class="dice">
                    <!-- You can add an image of a dice here -->
                    <img class="js-enemy-roll-img" src="images/dice${enemyCharacter.roll}.png" alt="Dice">
                </div>
            </div>
            <div class="enemy-sprite">
                <!-- You can add an image of the enemy here -->
                <img src="${enemyCharacter.image}" alt="Enemy"  title="Base Damage = 5">
            </div>
            <div id="attack-animation"></div>
        </div>
        <div id="damage-popup-container"></div>
        <div class="player-section">
            <div class="player-sprite">
                <!-- You can add an image of the player here -->
                <img src="${playerCharacter1.image}" alt="Player" title="Base Damage = 5">
            </div>
            <div class="player-info">
                <h2>${playerCharacter1.name}</h2>
                <div class="health-bar" >
                    <div class="health" id="health-player">${playerCharacter1.health}</div>
                </div>
                <div class="dice">
                    <!-- You can add an image of a dice here -->
                    <img class="js-player-roll-img" src="images/dice${playerCharacter1.roll}.png" alt="Dice">
                </div>
            </div>
        </div>
        <div class="action-buttons js-action-button">
        </div>
` + audioAppend;
setAudioLevel();


updateChatLog();
gameLogic();
}

function start() {
  document.querySelector('.js-battle-scene').innerHTML = `
  <button class="play-speed-button js-speed-check" >Roll for Speed</button>
  `;
  gameLog = ``;

  document.querySelector('.js-speed-check')
    .addEventListener('click', () => {
      rollSpeed();
      playGame();
    });
}

document.querySelector('.js-play-button')
  .addEventListener('click', () => {
    start();
  });

  let turn;
  let turnNumber = 0;
  let turnCount = 0;
  

  async function gameLogic() {
    await wait(2000);
    turn = queue[turnNumber];
    updateHealth();

    if(playerCharacter1.health <= 0 || enemyCharacter.health <= 0){
      gameLog += `\n Game Over!`;
      updateChatLog();
      return;
    }

    gameLog += `\n ${queue[turnNumber]}'s turn!`;
    updateChatLog();
    await wait(1500);


    if(turnCount % 2 === 1){
      document.querySelector('.js-turn-1').innerHTML = `#1 ${queue[0]}`;
      document.querySelector('.js-turn-2').innerHTML = `#2 ${queue[1]}`;
    } else if (turnCount % 2 === 0){
      document.querySelector('.js-turn-1').innerHTML = `#1 ${queue[0]}`;
      document.querySelector('.js-turn-2').innerHTML = `#2 ${queue[1]}`;
    };

    if(turn === 'Player'){
      document.querySelector('.js-action-button').innerHTML = defaultActionButtonHTML;
      document.querySelector('.js-action-button').style.visibility = 'visible';
      addButtonFunctionality();
      
    } else if (turn === 'Enemy'){
      if(enemyCharacter.isBurned){
        enemyCharacter.health = enemyCharacter.health - 15;
        gameLog += `\n Goblin took Burn Damage(15)!`
        showDamagePopup(15, 'enemy');
        updateChatLog();
        await wait(250);
        const thawChance = roll();
        if(thawChance === 6){
          enemyCharacter.isBurned = false;
          gameLog += `\n Goblin is no longer burned!`
          updateChatLog();
          document.querySelector('.enemy-sprite').classList.remove('burn');
          await wait(2000);
        }
      };

      if (enemyCharacter.isStunned){
        gameLog += `\n Goblin is Stunned, skipping turn...`
        enemyCharacter.isStunned = false;
        updateChatLog();
        turnCount++;
        queue.push(queue.shift());
        await wait(3000);
        document.querySelector('.enemy-sprite').classList.remove('stun');
        gameLogic();
      }else{
        enemyCharacter.roll = roll();
        document.querySelector('.js-enemy-roll-img').classList.add('dicea');
        await wait(500);
        document.querySelector('.js-enemy-roll-img').classList.remove('dicea');
        const enemyAttackDamage = enemyAttack(enemyCharacter.roll);
        document.querySelector('.js-action-button').style.visibility = 'hidden';
        playerCharacter1.health = playerCharacter1.health - enemyAttackDamage;
        updateRoll();
        gameLog += `\n Goblin rolled a ${enemyCharacter.roll}! And did ${enemyAttackDamage} dmg to the Player!`;
        updateChatLog();
        document.querySelector('.enemy-sprite').classList.add('attack');
        showDamagePopup(enemyAttackDamage, 'player');
        await wait(250);
        document.querySelector('.enemy-sprite').classList.remove('attack');
        turnCount++;
        queue.push(queue.shift());
        gameLogic();
      };
    };
    
  }

function wait(time) {
  return new Promise(resolve => {
      setTimeout(resolve, time);
  });
}

function roll() {
  return Math.floor(Math.random() * 6) + 1;
}

function updateChatLog() {
  document.querySelector('.js-chat-log').innerText = gameLog;
}

function showDamagePopup(damage, character) {
  const popupContainer = document.getElementById('damage-popup-container');
  const popup = document.createElement('div');
  popup.className = 'damage-popup';
  popup.textContent = `-${damage}`;

  // Set position based on character
  if (character === 'player') {
    popup.style.left = '10%'; // Adjust as needed
  } else if (character === 'enemy') {
    popup.style.left = '80%'; // Adjust as needed
  }

  popupContainer.appendChild(popup);

  // Remove the popup after the animation
  setTimeout(() => {
    popupContainer.removeChild(popup);
  }, 1000);
}

function triggerAttackAnimation(attackType) {
  const animationElement = document.getElementById('attack-animation');

  // Remove any existing animation classes
  animationElement.className = '';
  animationElement.style.display = 'block';

  // Add the appropriate animation class
  switch (attackType) {
    case 'fire':
      animationElement.classList.add('fire-attack');
      break;
    case 'water':
      animationElement.classList.add('water-attack');
      break;
    case 'earth':
      animationElement.classList.add('earth-attack');
      break;
    default:
      break;
  }

  // Hide the animation element after the animation is complete
  setTimeout(() => {
    animationElement.style.display = 'none';
  }, 1000); // Match this duration with the animation duration
}

async function processChain(chain) {
  for (const value of chain) {
    playerCharacter1.roll = roll();
    const playerAttackDamage = playerAttack(value, playerCharacter1.roll);
    document.querySelector('.js-player-roll-img').classList.add('dicea');
    await wait(500); // Ensure the wait function is a promise-based delay
    updateRoll();
    document.querySelector('.js-player-roll-img').classList.remove('dicea');
    triggerAttackAnimation(value);
    
    if (value !== 'earth') {
      const chance = Math.floor(Math.random() * 100).toFixed(0);
      console.log(chance);
      if (value === 'fire') {
        if (chance <= 40 && enemyCharacter.isBurned === false) {
          console.log('apply burn');
          enemyCharacter.isBurned = true;
          gameLog += `\n Applied Burn to Enemy!`;
          updateChatLog();
          document.querySelector('.enemy-sprite').classList.add('burn');
        }
        gameLog += `\n Player used a ${value} Dice and rolled a ${playerCharacter1.roll}! And did ${playerAttackDamage} dmg to the Enemy!`;
        updateChatLog();
        enemyCharacter.health -= playerAttackDamage;
        showDamagePopup(playerAttackDamage, 'enemy');
      } else if (value === 'water') {
        if (chance <= 20 && enemyCharacter.isStunned === false) {
          console.log('apply stun');
          enemyCharacter.isStunned = true;
          gameLog += `\n Applied Stun to Enemy!`;
          updateChatLog();
          document.querySelector('.enemy-sprite').classList.add('stun');
        }
        gameLog += `\n Player used a ${value} Dice and rolled a ${playerCharacter1.roll}! And did ${playerAttackDamage} dmg to the Enemy!`;
        updateChatLog();
        enemyCharacter.health -= playerAttackDamage;
        showDamagePopup(playerAttackDamage, 'enemy');
      }
    } else {
      gameLog += `\n Player used an ${value} Dice and rolled a ${playerCharacter1.roll}! And did ${playerAttackDamage} dmg to the Enemy!`;
      updateChatLog();
      enemyCharacter.health -= playerAttackDamage;
      showDamagePopup(playerAttackDamage, 'enemy');
    }
    
    // Await a short delay to let animations complete before the next iteration
    await wait(1000);
  }
}