def compute(gameRound, enemyRow, myRow, radars, myAmmo, myLastMove):
  # This bot charges, shoots, then moves down
  if gameRound % 3 == 0:
    return 'charge'
  elif gameRound % 3 == 1:
    return 'shoot'
  else:
    return 'down'