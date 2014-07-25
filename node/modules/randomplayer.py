import random

r = random.random()

if r < .25:
  print 'up'
elif r < .5:
  print 'down'
elif r < .75:
  print 'charge'
else:
  print 'shoot'
