# Simulates "Planes" Game

import sys
import subprocess
import json
import random

class Engine:
  FRAMES_PER_SECOND = 48
  TURNS_PER_SECOND = 2
  FRAMES_PER_TURN = FRAMES_PER_SECOND / TURNS_PER_SECOND

  MAX_TIME_IN_SECONDS = 60
  MAX_FRAMES = MAX_TIME_IN_SECONDS * FRAMES_PER_SECOND

  NUM_ROWS = 50
  NUM_COLS = 12

  X_FULL_WIDTH = 800
  X_END = 750
  X_START = 50
  X_CUT_WIDTH = 750
  X_STEP = X_CUT_WIDTH / float(FRAMES_PER_TURN) / NUM_COLS

  DIRECTIONS = [1, -1]

  botMoves = [None, None]
  botRows = [0, 49]
  botAmmo = [0, 0]
  botCols = [0, NUM_COLS - 1]
  shotStatus = ['ok', 'ok']

  otherBot = [1, 0]

  exploded = [False, False]

  gameOver = ""

  bullets = {}
  frameDict = {}

  frameCounter = 0
  bulletCounter = 0
  roundCounter = 0

  frameList = []

  def __init__(self, gameId, bot1binary, bot2binary):
    # Switch randomly to start
    if random.random() < .5:
      self.botRows = self.botRows[::-1]
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

  def handleMove(self, currentRow, currentAmmo, move, direction):
    if move == "up":
      currentRow = (currentRow - 1 + self.NUM_ROWS) % self.NUM_ROWS
    elif move == "down":
      currentRow = (currentRow + 1 + self.NUM_ROWS) % self.NUM_ROWS
    elif move == "charge":
      currentAmmo += 1
    elif currentAmmo > 0:
      currentAmmo -= 1
      self.addBullet(currentRow, direction)
    else:
      return (currentRow, currentAmmo, "dud")
    return (currentRow, currentAmmo, "ok")

  def animationTick(self):
    newBullets = {}
    for bulletId in self.bullets:
      bullet = self.bullets[bulletId]
      direction, row, column = bullet[:3]
      xpos = bullet[3] + direction * self.X_STEP
      newBullets[bulletId] = (direction, row, column, xpos)
    self.bullets = newBullets
    
  def checkEndConditions(self):
    for bulletId in self.bullets:
      bullet = self.bullets[bulletId]
      # same row as a plane
      if bullet[1] == self.botRows[0]:
        if bullet[0] == -1 and bullet[2] == 0:
          self.botRows[0] = 'EXPLODED'
          self.gameOver = "BOT2"
      if bullet[1] == self.botRows[1]:
        if bullet[0] == 1 and bullet[2] == self.NUM_COLS - 1:
          self.botRows[1] = 'EXPLODED'
          self.gameOver = "BOT1"
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
      (self.botRows[i], self.botAmmo[i], self.shotStatus[i]) = self.handleMove(
          self.botRows[i], self.botAmmo[i], self.botMoves[i], self.DIRECTIONS[i])

  def getRadarStatus(self, botNum, row):
    status = "SAFE"
    for bulletId in self.bullets:
      bullet = self.bullets[bulletId]
      # Bullet in row and coming towards you
      if bullet[1] == row and bullet[0] != self.DIRECTIONS[botNum]:
        status = "WARNING"
    return status

  # Schema {
  # Inputs: (gameRound, enemyRow, myRow, radar (0-5) warning or alert, ammo, lastMove)
  def getBotInput(self, botNum):
    dataDump = {}
    other = self.otherBot[botNum]
    dataDump['gameRound'] = self.roundCounter
    dataDump['enemyRow'] = self.botRows[other]
    dataDump['myRow'] = self.botRows[botNum]
    for row in range(self.NUM_ROWS):
      dataDump['radar' + str(row)] = self.getRadarStatus(botNum, row)
    dataDump['ammo'] = self.botAmmo[botNum]
    dataDump['lastMove'] = self.botMoves[botNum]
    return json.dumps(dataDump)

  def getBotCommand(self, botBinary):
    if botBinary.endswith(".jar"):
      return "java -jar " + botBinary
    elif botBinary.endswith(".py"):
      return "python " + botBinary
    return "./" + botBinary

  def parseMove(self, botNum, botOutput):
    if "up" in botOutput:
      self.botMoves[botNum] = "up"
    elif "down" in botOutput:
      self.botMoves[botNum] = "down"
    elif "shoot" in botOutput:
      self.botMoves[botNum] = "shoot"
    else:
      self.botMoves[botNum] = "charge"

  def getBotOutputs(self):
    bot1command = self.getBotCommand(self.bot1binary)
    bot2command = self.getBotCommand(self.bot2binary)
    p1 = subprocess.Popen("sudo timeout 1s " + bot1command, shell=True, stdin=subprocess.PIPE, stdout=subprocess.PIPE)
    p2 = subprocess.Popen("sudo timeout 1s " + bot2command, shell=True, stdin=subprocess.PIPE, stdout=subprocess.PIPE)

    input1 = self.getBotInput(0)
    input2 = self.getBotInput(1)
    bot1output = p1.communicate(input=input1)[0]
    bot2output = p2.communicate(input=input2)[0]

    self.parseMove(0, bot1output)
    self.parseMove(1, bot2output)

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

  def dumpGameState(self, isActionFrame):
    frameObject = {}

    frameObject['roundNumber'] = self.roundCounter

    for bot in range(2):
      botId = str(bot + 1)
      # Plane rows
      frameObject['p' + botId] = self.botRows[bot]
      # Ammo counts
      frameObject['b' + botId] = self.botAmmo[bot]

      if isActionFrame:
        frameObject['action' + botId] = self.botMoves[bot]
        # If the shot wasn't successful, return DUD
        if self.botMoves[bot] == 'shoot' and self.shotStatus[bot] == 'dud':
          frameObject['action' + botId] = 'dud'
      else:
        frameObject['action' + botId] = 'NONE'

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
