import json
def compute(gameRound, enemyRow, myRow, radars, myAmmo, myLastMove):
    #row: top most row = 0, bottom most row = 4
    #radar: ['SAFE','SAFE','SAFE','SAFE','SAFE'] (top to bottom) other values: 'ALERT', 'WARNING'
    #return none
    #choose from 'shoot', 'charge', 'up', or 'down'
          
    leftWeight=0
    rightWeight=0
    if(radars[myRow-1]=='SAFE'):
        leftWeight+=3
    elif(radars[myRow-1]=='WARNING'):
        leftWeight+=1
    if((radars[myRow-2]=='WARNING')or(radars[myRow-2]=='SAFE')):
        leftWeight+=1

    tempRow=myRow
    if(myRow==4):
        tempRow=-1
    elif(myRow==3):
        tempRow=-2
    if(radars[tempRow+1]=='SAFE'):
        rightWeight+=3
    elif(radars[tempRow+1]=='WARNING'):
        rightWeight+=1
    if((radars[tempRow+2]=='WARNING')or(radars[tempRow+2]=='SAFE')):
        rightWeight+=1

    if(radars[myRow] == 'ALERT'):
        if(rightWeight>leftWeight):
            return 'down'
        else:
            return 'up'

    elif(radars[myRow] == 'WARNING'):
        if(myAmmo>0):
            return 'shoot'
        else:
            if((radars[myRow-1]=='ALERT')or(radars[tempRow+1]=='ALERT')):
                return 'charge'
            if(rightWeight>leftWeight):
                return 'down'
            else:
                return 'up'
    else:
        if(myAmmo>4):
            if((radars[myRow-1]=='ALERT')or(radars[tempRow+1]=='ALERT')):
                return 'charge'
            if(rightWeight<leftWeight):
                return 'down'
            else:
                return 'up'
        else:
            return 'charge'

def wrapper():
  data = raw_input()
  js = json.loads(data)
  radars = []
  for s in range(5):
    radars.append(js['radar' + str(s)])
  output = compute(js['gameRound'], js['enemyRow'], js['myRow'], radars, js['ammo'], js['lastMove'])
  print output

wrapper()

