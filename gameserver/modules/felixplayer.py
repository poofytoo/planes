import json
import random

# YOUR CODE GOES HERE
# returns one of 'shoot', 'charge', 'up', 'down'
def compute(gameRound, enemyRows, myRow, radars, myAmmo, myLastMove):
  candidates = {'shoot': 1, 'charge': 1, 'up': 1, 'down': 1}
  if radars[myRow] == 'ALERT':
    candidates['shoot'] = 0
    candidates['charge'] = 0
  if myAmmo == 0:
    candidates['shoot'] = 0
  if myRow == 0:
    candidates['up'] = 0
  if myRow == 4:
    candidates['down'] = 0
  possible = [move for move in candidates if candidates[move] == 1]
  return random.sample(possible, 1)[0]

def wrapper():
  data = raw_input()
  js = json.loads(data)
  radars = []
  for s in range(10):
    radars.append(js['radar' + str(s)])
  output = compute(js['gameRound'], js['enemyRows'], js['myRow'], radars, js['ammo'], js['lastMove'])
  print output

wrapper()
