import json

# YOUR CODE GOES HERE
# returns one of 'shoot', 'charge', 'up', 'down'
def compute(gameRound, enemyRow, myRow, radars, myAmmo, myLastMove):
  if (gameRound%12 < 6):
    if (radars[myRow] == 'WARNING'):
      if (radars[(myRow+1)%5] != 'WARNING'):
        return 'down'
      elif (radars[(myRow-1)%5] != 'WARNING'):
        return 'up'
      else: 
        return 'shoot'
    else:
      return 'charge'   
  else:
    if (myLastMove == 'shoot'):
      if (radars[(myRow+1)%5] != 'WARNING'):
        return 'down'
      elif (radars[(myRow-1)%5] != 'WARNING'):
        return 'up'
      else: 
        return 'shoot'
    else:
      return 'shoot'

def wrapper():
  data = raw_input()
  js = json.loads(data)
  radars = []
  for s in range(5):
    radars.append(js['radar' + str(s)])
  output = compute(js['gameRound'], js['enemyRow'], js['myRow'], radars, js['ammo'], js['lastMove'])
  print output

wrapper()
