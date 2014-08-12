# Simulates "Planes" Game

import sys
import subprocess
import json
import random

def createBot(row, col):
  return {'move': None, 'row': row, 'ammo': 0, 'col': col, 'shotStatus': 'ok'}

class Engine:
  FRAMES_PER_SECOND = 48
  TURNS_PER_SECOND = 2
  FRAMES_PER_TURN = FRAMES_PER_SECOND / TURNS_PER_SECOND

  MAX_TIME_IN_SECONDS = 60
  MAX_FRAMES = MAX_TIME_IN_SECONDS * FRAMES_PER_SECOND

  NUM_PLANES = 4
  NUM_ROWS = 10
  NUM_COLS = 12

  X_FULL_WIDTH = 800
  X_END = 750
  X_START = 50
  X_CUT_WIDTH = 750
  X_STEP = X_CUT_WIDTH / float(FRAMES_PER_TURN) / NUM_COLS

  DIRECTIONS = [1, -1]
  MOVES = ["shoot", "charge", "up", "down"]

  bots = [[createBot(random.randint(0, NUM_ROWS - 1), 0) for i in range(NUM_PLANES)],
      [createBot(random.randint(0, NUM_ROWS - 1), NUM_COLS - 1) for i in range(NUM_PLANES)]]

  gameOver = ""

  bullets = {}
  frameDict = {}

  frameCounter = 0
  bulletCounter = 0
  roundCounter = 0

  frameList = []

  def __init__(self, gameId, bot1binary, bot2binary):
    self.gameId = gameId
    self.bot1binary = bot1binary
    self.bot2binary = bot2binary

  # (direction, row, column, xpos)
  def addBullet(self, row, direction):
    if direction > 0:
      self.bullets[self.bulletCounter] = (direction, row, 0, self.X_START)
    else:
      self.bullets[self.bulletCounter] = (direction, row, self.NUM_COLS - 1, self.X_END)
    self.bulletCounter += 1

  def handleMove(self, bot, direction):
    if bot['move'] == "up":
      bot['row'] = (bot['row'] - 1 + self.NUM_ROWS) % self.NUM_ROWS
    elif bot['move'] == "down":
      bot['row'] = (bot['row'] + 1 + self.NUM_ROWS) % self.NUM_ROWS
    elif bot['move'] == "charge":
      bot['ammo'] += 1
    elif bot['ammo'] > 0:
      bot['ammo'] -= 1
      self.addBullet(bot['row'], direction)
    else:
      return (bot['row'], bot['ammo'], "dud")
    return (bot['row'], bot['ammo'], "ok")

  def animationTick(self):
    newBullets = {}
    for bulletId in self.bullets:
      bullet = self.bullets[bulletId]
      direction, row, column = bullet[:3]
      xpos = bullet[3] + direction * self.X_STEP
      newBullets[bulletId] = (direction, row, column, xpos)
    self.bullets = newBullets

  def checkEndConditions(self):
    # remove all exploded bots
    self.bots[0] = filter(lambda bot: bot['row'] != 'EXPLODED', self.bots[0])
    self.bots[1] = filter(lambda bot: bot['row'] != 'EXPLODED', self.bots[1])

    # check if all bots on a side have been destroyed
    if not self.bots[0]:
      self.gameOver += 'BOT2'
    if not self.bots[1]:
      self.gameOver += 'BOT1'

    for bulletId in self.bullets:
      bullet = self.bullets[bulletId]
      # same row as a left plane
      if bullet[0] == -1 and bullet[2] == 0:
        for bot in self.bots[0]:
          if bot['row'] == bullet[1]:
            bot['row'] = 'EXPLODED'
      # same row as a right plane
      if bullet[0] == 1 and bullet[2] == self.NUM_COLS - 1:
        for bot in self.bots[1]:
          if bot['row'] == bullet[1]:
            bot['row'] = 'EXPLODED'

    if self.frameCounter > self.MAX_FRAMES:
      self.gameOver = "TIMEOUT"
    if "BOT2" in self.gameOver and "BOT1" in self.gameOver:
        self.gameOver = "DRAW"
    return self.gameOver

  def gameTick(self):
    # Has anyone died, or has time expired?
    if self.checkEndConditions():
      return

    # Move bullets first
    newBullets = {}
    for bulletId in self.bullets:
      bullet = self.bullets[bulletId]
      direction = bullet[0]
      row = bullet[1]
      column = bullet[2] + direction
      xpos = bullet[3]
      # Kill bullets that fall out of play
      if column >= 0 and column < self.NUM_COLS:
        newBullets[bulletId] = (direction, row, column, xpos)
    self.bullets = newBullets

    # Handle bot movement
    for i in range(2):
      for bot in self.bots[i]:
        if bot['row'] != 'EXPLODED':
          self.handleMove(bot, self.DIRECTIONS[i])

  def getRadarStatus(self, botNum, row):
    status = "SAFE"
    for bulletId in self.bullets:
      bullet = self.bullets[bulletId]
      # Bullet in row and coming towards you
      if bullet[1] == row and bullet[0] != self.DIRECTIONS[botNum]:
        status = "WARNING"
    return status

  def getBotRows(self, botNum):
    return [bot['row'] for bot in self.bots[botNum]]

  # Schema {
  # Inputs: (gameRound, enemyRow, myRow, radar (0-5) warning or alert, ammo, lastMove)
  def getBotInput(self, bot):
    dataDump = {}
    botNum = 0 if bot['col'] == 0 else 1
    dataDump['myRow'] = bot['row']
    dataDump['myRows'] = self.getBotRows(botNum)
    dataDump['enemyRows'] = self.getBotRows(1 - botNum)
    dataDump['gameRound'] = self.roundCounter
    for row in range(self.NUM_ROWS):
      dataDump['radar' + str(row)] = self.getRadarStatus(botNum, row)
    dataDump['ammo'] = bot['ammo']
    dataDump['lastMove'] = bot['move']
    return json.dumps(dataDump)

  def getBotCommand(self, botBinary):
    if botBinary.endswith(".jar"):
      return "java -jar " + botBinary
    elif botBinary.endswith(".py"):
      return "python " + botBinary
    return "./" + botBinary

  def parseMove(self, bot, botOutput):
    for move in self.MOVES:
      if move in botOutput:
        bot['move'] = move
        return
    bot['move'] = "charge"

  def getBotOutputs(self):
    bot1command = self.getBotCommand(self.bot1binary)
    bot2command = self.getBotCommand(self.bot2binary)

    for bot in self.bots[0]:
      if bot['row'] == 'EXPLODED':
        continue
      p1 = subprocess.Popen("sudo timeout 1s " + bot1command, shell=True, stdin=subprocess.PIPE, stdout=subprocess.PIPE)
      input1 = self.getBotInput(bot)
      bot1output = p1.communicate(input=input1)[0]
      self.parseMove(bot, bot1output)
    for bot in self.bots[1]:
      if bot['row'] == 'EXPLODED':
        continue
      p2 = subprocess.Popen("sudo timeout 1s " + bot2command, shell=True, stdin=subprocess.PIPE, stdout=subprocess.PIPE)
      input2 = self.getBotInput(bot)
      bot2output = p2.communicate(input=input2)[0]
      self.parseMove(bot, bot2output)

  def runGame(self):
    while not self.gameOver:
      if self.frameCounter % self.FRAMES_PER_TURN == 0:
        self.getBotOutputs()
        self.gameTick()
        self.roundCounter += 1
        self.frameList.append(self.dumpGameState(True))
      else:
        self.frameList.append(self.dumpGameState(False))
      self.animationTick()
      self.frameCounter += 1

    print self.writeToGameFile()

  def getCommonAction(self, botNum):
    actions = [bot['move'] for bot in self.bots[botNum]]
    action_counts = [(actions.count(move), -i, move)
        for (i, move) in enumerate(self.MOVES)]
    return max(action_counts)[2] if actions else 'NONE'

  def dumpGameState(self, isActionFrame):
    frameObject = {}

    frameObject['roundNumber'] = self.roundCounter

    for botNum in range(2):
      botId = str(botNum + 1)
      # Plane rows
      frameObject['p' + botId] = [
          {'move': bot['move'], 'row': bot['row']} for bot in self.bots[botNum]]
      # Plane counts
      frameObject['b' + botId] = len(
          filter(lambda bot: bot['row'] != 'EXPLODED', self.bots[botNum]))

      frameObject['action' + botId] = self.getCommonAction(botNum)

    bulletList = []
    for bulletId in self.bullets:
      bullet = self.bullets[bulletId]
      bulletObject = {'x': bullet[3], 'y': bullet[1], 'd': bullet[0], 't': 'r'}
      bulletList.append(bulletObject)

    frameObject['bullets'] = bulletList

    return frameObject

  def writeToGameFile(self):
    gameObject = {}
    for i in range(len(self.frameList)):
      gameObject[i] = self.frameList[i]

    gameObject['result'] = self.gameOver
    return json.dumps(gameObject)

def main(gameId, bot1binary, bot2binary):
  engine = Engine(gameId, bot1binary, bot2binary)
  engine.runGame()

if __name__ == "__main__":
  args = sys.argv
  if len(args) != 4:
    print 'USAGE: python engine.py [gameId] [binary1] [binary2]'
    print 'EX: python engine.py 0 test.py test.py'
  else:
    gameId = args[1] 
    bot1binary = args[2]
    bot2binary = args[3]
    main(gameId, bot1binary, bot2binary)
