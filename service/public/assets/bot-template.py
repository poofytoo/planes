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
# shield      costs 3 energy
# all else    costs 0 energy

def compute(gameRound, enemyRow, myRow, radars, myEnergy, myShield, myLastMove):
  #
  # YOUR CODE GOES HERE
  #
  # returns one of 'up', 'down', 'charge', 'shoot', 'supershoot', or 'shield'
  return 'up'
  


















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
