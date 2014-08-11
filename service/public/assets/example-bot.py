# Feel free to add, but don't delete.
import json
import base64
import pickle
import zlib
import sys
import random

############################################################
#          IMPORTANT: TEST FILE BEFORE UPLOADING           #
#                                                          #
# run this python file and hit [Enter] to simulate rounds. #
############################################################

# shoot       costs 1 energy
# supershoot  costs 5 energy
# shield      costs 8 energy
# all else    costs 0 energy

def compute(gameRound, enemyRow, myRow, radars, myEnergy, myShield, myLastMove):
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
    if radars[myRow] == 'WARNING':
      return 'down'
    else:
      return 'charge'
  


















# You should not edit anything below this line

def wrapper(data):
  if not data:
    return test()
  js = json.loads(data)
  radars = []
  for s in range(5):
    radars.append(js['radar' + str(s)])
  output = compute(js['gameRound'], js['enemyRow'], js['myRow'], radars, js['myEnergy'], js['myShield'], js['lastMove'])
  return output

def test():
  zTestInput = pickle.loads(zlib.decompress(base64.b64decode('eNpNzj0OwyAMBeDdF6FTBST9GzskUoZ2CCdAwqKVAkSkTcTta1CUZvP7bEvvYEYOiqFHl/qwMBgFdDVMig16+jzCjEQSngRRGx0lxYoe1L1taCyXZVFROoH9Ayc470EQXPZQE1xXsNphH77ekN2g49lcajxGm3IpvtnaUmygXm8c8p+QxY4/HlM7xQ==')))
  print 'Output:  [{:^10s}]'.format(wrapper(json.dumps(zTestInput)))
  return "\nHey looks like it didn't explode! Now go to http://theplanesgame.com and upload your bot!"

print wrapper(raw_input())
