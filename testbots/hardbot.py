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
  r = random.random()
  # danger-detection
  if (radars[myRow] != 'SAFE'):
    if radars[(myRow+1)%5] == 'SAFE':
      return 'down'
    elif radars[(myRow-1)%5] == 'SAFE':
      return 'up'
    else:
    # oh god we're not safe anywhere
      if myEnergy > 3 and myShield < 1:
        return 'shield'
      elif myShield > 0:
        return 'up'
      else:
        k = random.random()
        if k < 0.2:
          return 'charge'
        else:
          return 'up'
        
  # rando-action
  if r < 0.1:
    return 'up'
  elif r < 0.2:
    return 'down'
  elif r < 0.5:
    return 'charge'
  elif r < 0.8 and myEnergy > 4:
    return 'supershoot'
  elif r < 0.9 and myEnergy > 2:
    return 'shield'
  elif myEnergy > 1:
    return 'shoot'
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
  zTestInput = pickle.loads(zlib.decompress(base64.b64decode('eJyFmLtSI0kQRX39CGNt1M2spznGzAbGYICxtmJRiI0ARIh5BH+/3WoJZedtlSyhBInTlaezbteX57ew+vL4htXDzeZ18/Jxv/tzs3qT1W1cvT/cPK/ff/7Y/d4MJV3dDYX9+nG9l+FtHD7w8PX7t+HHtDr9Qod3ebU9F8JQKLaAoVBtIQ6Fdixs1y+b+92v18ehhrC6DWPx5ePb62a//Rhr+KxNmJDPwsPTf5vnwwf1UFuPFxVX2+kvtjrg/vu03m/HS8H534+XghnyeA0o/iJQ/VWg+cuQcKhsR3SMrzi+HhkMmWBG9n6CF5mRiXoyiZ5MkieTTGTlTCZXyOqc7NfbZv/+tNv9HL+mzeg0eDqFp1PxdKqeTuOZTvt0mgzd1vVRqY9KfVTqo1Ifo+ljPPLIMk9EhyeK54nqeWL0PDERTz7zpCOPXuAps+497v68jl9Q51zNc6XguRI8VxLPlfTMlR0X5lzJ3olb51FKxENDJNEUSTRGUjvzlD5PDu7+mwTPmIFlamCmBmZqYKYGZtPA6oTyYKUjVK7E0zxPCZ6nwPMUOfO0/kIV7fCU6HlKIp5MPIV4qhmc4QgULwA1C+TMrjSRKk2kShOp0kSqZiIBDkjmQHUaSZiAnEGVRlKlkVRpJFUaSc1uLeJa5oAaLJBrWSOlGyndSOlGSjejNLS/Qq1YIHfzN3K6kdMIJDUCWY1gtEbsMyFoZ5UQyGwEUhuB3EYguRGs3af5nS5htc5aAeQ3QIIDZDhAigPW8dP4DhewkHqrtRCgFhLUQoTiDIVZiDpNcVzAEvRWS8h1CMkOIdshpDvE+l6vYZXeagkZD2HllZVXVl6t8qdRLhewdFJeFicVlJVXVl5ZeWXl1Sgv4cpqabNYLgEjsvKRlY+sfGTlo1FefEL3WDFZLN/EIZM93Pzz9f7u9u7vw/viGCszNmKc564D4zF4TYxypaNjJpNpI+DNEGM+I7BEDxBI9ASBRI8QSPYZQh2YerDpKSIu93QMagSWKYMiUwhFphSKbGKo+LzuwXK0YP4eGKMbg1EYRaY0ikxxFNnkUUlONw9WQichY8xwBFaEwIoS2DykHcCOKW0Cy9fAchesLIGx/IXlryx/tfL74e/BqnSiKeqS/JXlryx/Zfmrld9HeAKrvfFfl+RvLH9j+RvL36z8Pst7sBZn26W7K9uS/I3lbyx/Y/mbkV9PW0BwYDieOYTQWTEJC/JLIPklkPwSSH4JRn71mwCB5c4mIGFBfgkkvwSSX0DyC4z86ie/B4P0wLAgv4CPjsBnR+DDIxj5VS849glW7Zbkz7NARw8ipL4IqS9C6osY9TVeMUziDGs+xUToBEKExBch8UVIfBErfrqCpaGzgcs88B2wlLVX1l5Ze7Xa+7gfDdZf/wPKbKf6')))
  for zI in range(len(zTestInput)):
    print 'Round {:2d}    output:  [{:^10s}]'.format(zI, wrapper(json.dumps(zTestInput[zI])))
  return "\nHey looks like it didn't explode! Now go to http://theplanesgame.com and upload your bot!"

print wrapper(raw_input())
