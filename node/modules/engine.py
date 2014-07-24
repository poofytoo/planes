# Simulates "Planes" Game

import sys
import subprocess
import json
import random

class Engine:
  FRAMES_PER_SECOND = 48
  TURNS_PER_SECOND = 2
  FRAMES_PER_TURN = FRAMES_PER_SECOND / TURNS_PER_SECOND

  MAX_TIME_IN_SECONDS = 120
  MAX_FRAMES = MAX_TIME_IN_SECONDS * FRAMES_PER_SECOND

  NUM_ROWS = 5
  NUM_COLS = 6

  X_WIDTH = 800
  x_STEP = X_WIDTH / float(TURNS_PER_SECOND) / NUM_COLS

  DIRECTIONS = [-1, 1]

  botMoves = [None, None]
  botRows = [0, 4]
  botAmmo = [0, 0]

  exploded = [False, False]

  gameOver = False

  bullets = {}
  frameDict = {}

  frameCounter = 0
  bulletCounter = 0

  def __init__(self, gameId, bot1binary, bot2binary):
    # Switch randomly to start
    if random.random() < .5:
      self.botRows = self.botRows[::-1]
    self.gameId = gameId
    self.bot1binary = bot1binary
    self.bot2binary = bot2binary

  def addBullet(self, row, direction):
    if direction > 0:
      self.bullets[bulletCounter] = (direction, row, 0, 0)
    else:
      self.bullets[bulletCounter] = (direction, row, NUM_COLS - 1, X_WIDTH)

  def handleMove(self, currentRow, currentAmmo, move, direction):
    if move == "up":
      currentRow = (current - 1 + NUM_ROWS) % NUM_ROWS
    elif move == "down":
      currentRow = (current + 1 + NUM_ROWS) % NUM_ROWS
    elif move == "charge":
      currentAmmo += 1
    else:
      currentAmmo -= 1
      self.addBullet(currentRow, direction)
    return (currentRow, ammo)

  def animationTick(self):
    newBullets = {}
    for bulletId in self.bullets:
      bullet = self.bullets[bulletId]
      direction = bullet[0]
      column = bullet[1]
      xpos = bullet[2] + direction * self.X_STEP
      # Kill bullets that fall out of play
      if column >= 0 and column < 6:
        newBullets[bulletId] = (direction, column, xpos)
    self.bullets = newBullets
    
  def checkEndConditions(self):
    for bulletId in self.bullets:
      bullet = self.bullets[bulletId]
      # same row as a plane
      if bullet[1] == self.botRows[0]:
        if bullet[0] == -1 and bullet[2] == 0:
          self.botRows[0] = 'EXPLODED'
          self.gameOver = True
      if bullet[1] == self.botRows[1]:
        if bullet[0] == 1 and bullet[2] == NUM_COLS - 1:
          self.botRows[1] = 'EXPLODED'
          self.gameOver = True
      if self.frameCounter > MAX_FRAMES:
        self.gameOver = True

  def gameTick(self):
    # Has anyone died, or has time expired?
    self.checkEndConditions()

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
      self.botRows[i] = self.handleMove(
          self.botRows[i], self.botAmmo[i], self.botMove[i], self.DIRECTIONS[i])

  def runBotCommand(self, botBinary):
    if botBinary.endswith(".jar"):
      return "timeout 1s java -jar " + botBinary
    elif botBinary.endswith(".py"):
      return "timeout 1s python " + botBinary
    return "timeout 1s ./" + botBinary

  def getBotOutputs(self):
    pass

  def runGame(self):
    while not self.gameOver:
      if self.frameCounter % self.FRAMES_PER_TURN:
        self.getBotOutputs()
        self.gameTick()
      self.animationTick()
      self.frameCounter += 1

  def dumpGameState(self):
    pass

  def writeToGameFile(self):
    pass

def main(gameId, bot1binary, bot2binary):
  engine = Engine(gameId, bot1binary, bot2binary)

if __name__ == "__main__":
  args = sys.argv
  gameId = args[1] 
  bot1binary = args[2]
  bot2binary = args[3]
  main(gameId, bot1binary, bot2binary)
