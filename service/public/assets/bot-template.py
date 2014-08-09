import json

############################################################
#          IMPORTANT: TEST FILE BEFORE UPLOADING           #
#                                                          #
# run this python file and hit [Enter] to simulate rounds. #
############################################################

# shoot       costs 1 energy
# supershoot  costs 5 energy
# shield      costs 3 energy
# all else    costs 0 energy

def compute(gameRound, enemyRow, myRow, radars, myAmmo, myLastMove):
  # YOUR CODE GOES HERE
  #
  # returns one of 'shoot', 'charge', 'up', 'down'
  return 'up'
  


















# You should not edit anything below this line

def wrapper():
  data = raw_input()
  js = json.loads(data)
  radars = []
  for s in range(5):
    radars.append(js['radar' + str(s)])
  output = compute(js['gameRound'], js['enemyRow'], js['myRow'], radars, js['ammo'], js['lastMove'])
  return output

def test():
  zTestInput = pickle.loads(zlib.decompress(base64.b64decode('eNpNzj0OwyAMBeDdF6FTBST9GzskUoZ2CCdAwqKVAkSkTcTta1CUZvP7bEvvYEYOiqFHl/qwMBgFdDVMig16+jzCjEQSngRRGx0lxYoe1L1taCyXZVFROoH9Ayc470EQXPZQE1xXsNphH77ekN2g49lcajxGm3IpvtnaUmygXm8c8p+QxY4/HlM7xQ==')))
  print 'Output:  [{:^10s}]'.format(wrapper(json.dumps(zTestInput)))
  return "\nHey looks like it didn't explode! Now go to http://theplanesgame.com and upload your bot!"

wrapper()
