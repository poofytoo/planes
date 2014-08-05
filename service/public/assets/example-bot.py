import json

def compute(gameRound, enemyRow, myRow, radars, myAmmo, myLastMove):
  # This is a simple bot that charges, shoots, and maybe moves down
  # Feel free to edit this file and use it!
  
  # if the gameround is 0, 3, 6... charge.
  if gameRound % 3 == 0:
    return 'charge'
    
  # if the gameround is 1, 4, 7... then shoot!
  elif gameRound % 3 == 1:
    return 'shoot'
  
  else:
    # if current row is dangerous, move down!
    if radars[myRow] == 'WARNING'
      return 'down'
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
