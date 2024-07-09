export function enemyAttack(roll) {
  const enemyRoll = roll;

  const damage = Math.ceil(enemyRoll * 5);
  return damage;
}

export function playerAttack(diceType, roll) {
  let damage = Math.ceil(roll * 5);

  if (diceType === 'earth'){
    damage = damage * 2;
  };
  return damage;
}