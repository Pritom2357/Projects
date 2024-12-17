import React, { useState, useEffect, useRef } from 'react';

const GRID_SIZE = 25;

function GameOfLife() {
  const [grid, setGrid] = useState(createGrid());
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);

  function createGrid() {
    return Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0));
  }

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setGrid((prevGrid) => evolveGrid(prevGrid));
      }, 200);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  function evolveGrid(currentGrid) {
    const newGrid = currentGrid.map((row) => [...row]);
    for (let x = 0; x < GRID_SIZE; x++) {
      for (let y = 0; y < GRID_SIZE; y++) {
        let neighbors = 0;
        for (let i = -1; i <= 1; i++) {
          for (let j = -1; j <= 1; j++) {
            if (i === 0 && j === 0) continue;
            const nx = (x + i + GRID_SIZE) % GRID_SIZE;
            const ny = (y + j + GRID_SIZE) % GRID_SIZE;
            neighbors += currentGrid[nx][ny];
          }
        }
        if (currentGrid[x][y] === 1) {
          if (neighbors < 2 || neighbors > 3) newGrid[x][y] = 0;
        } else if (neighbors === 3) {
          newGrid[x][y] = 1;
        }
      }
    }
    return newGrid;
  }

  const toggleCell = (x, y) => {
    setGrid((prevGrid) => {
      const newGrid = prevGrid.map((row) => [...row]);
      newGrid[x][y] = newGrid[x][y] === 0 ? 1 : 0;
      return newGrid;
    });
  };

  const randomizeGrid = () => {
    setGrid(() =>
      Array(GRID_SIZE)
        .fill(null)
        .map(() =>
          Array(GRID_SIZE)
            .fill(null)
            .map(() => Math.round(Math.random()))
        )
    );
  };

  return (
    <div className="App flex flex-col items-center font-sans p-4">
      <h1 className="text-3xl font-bold mb-4">Game of Life</h1>
      <div
        className="grid gap-1 border border-gray-800 mb-4"
        style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}
      >
        {grid.flatMap((row, x) =>
          row.map((cell, y) => (
            <div
              key={`${x}-${y}`}
              className={`w-6 h-6 border border-gray-400 cursor-pointer ${
                cell === 1 ? 'bg-gray-800' : 'bg-gray-200'
              }`}
              onClick={() => toggleCell(x, y)}
            ></div>
          ))
        )}
      </div>
      <div className="controls flex gap-4">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => setIsRunning(!isRunning)}
        >
          {isRunning ? 'Stop' : 'Start'}
        </button>
        <button
          className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => setGrid(createGrid())}
        >
          Clear
        </button>
        <button
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          onClick={randomizeGrid}
        >
          Random
        </button>
      </div>
    </div>
  );
}

export default GameOfLife;