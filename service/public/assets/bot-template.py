import json

def compute(gameRound, enemyRow, myRow, radars, myAmmo, myLastMove):
  # YOUR CODE GOES HERE
  #
  # returns one of 'shoot', 'charge', 'up', 'down'
  pass

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
