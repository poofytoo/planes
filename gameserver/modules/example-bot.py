import json

def compute(gameRound, enemyRow, myRow, radars, myAmmo, myLastMove):
  # This bot charges, shoots, then moves down
  if gameRound % 3 == 0:
    return 'charge'
  elif gameRound % 3 == 1:
    return 'shoot'
  else:
    return 'charge'

# You should not edit anything below this line

def wrapper():
  data = raw_input()
  js = json.loads(data)
  radars = []
  for s in range(5):
    radars.append(js['radar' + str(s)])
  output = compute(js['gameRound'], js['enemyRow'], js['myRow'], radars, js['ammo'], js['lastMove'])
  print output

wrapper()
