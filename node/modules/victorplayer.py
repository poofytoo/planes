import json

# YOUR CODE GOES HERE
# returns one of 'shoot', 'charge', 'up', 'down'
def compute(gameRound, enemyRow, myRow, radars, myAmmo, myLastMove):
  if (gameRound%32 < 16):
    if (radars[myRow] == 'ALERT'):
      if (radars[(myRow+1)%5] != 'ALERT'):
        return 'down'
      elif (radars[(myRow-1)%5] != 'ALERT'):
        return 'up'
      else: 
        return 'shoot'
    else:
      return 'charge'   
  else:
    if (myLastMove == 'shoot'):
      if (radars[(myRow+1)%5] != 'ALERT'):
        return 'down'
      elif (radars[(myRow-1)%5] != 'ALERT'):
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
