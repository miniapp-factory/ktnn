"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Share } from "@/components/share";
import { url } from "@/lib/metadata";

const GRID_SIZE = 4;
const TILE_VALUES = [2, 4];

function getRandomTile() {
  return TILE_VALUES[Math.random() < 0.9 ? 0 : 1];
}

function cloneBoard(board: number[][]) {
  return board.map(row => [...row]);
}

export default function Game2048() {
  const [board, setBoard] = useState<number[][]>(Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0)));
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  // Initialize board with two tiles
  useEffect(() => {
    const init = () => {
      let newBoard = cloneBoard(board);
      addRandomTile(newBoard);
      addRandomTile(newBoard);
      setBoard(newBoard);
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addRandomTile = (b: number[][]) => {
    const empty: [number, number][] = [];
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (b[r][c] === 0) empty.push([r, c]);
      }
    }
    if (empty.length === 0) return;
    const [r, c] = empty[Math.floor(Math.random() * empty.length)];
    b[r][c] = getRandomTile();
  };

  const move = (dir: "up" | "down" | "left" | "right") => {
    if (gameOver) return;
    let moved = false;
    let newScore = score;
    const newBoard = cloneBoard(board);

    const traverse = (a: number, b: number, step: number) => {
      const line = [];
      for (let i = 0; i < GRID_SIZE; i++) {
        const val = newBoard[a][b];
        if (val !== 0) line.push(val);
        a += step;
        b += step;
      }
      const merged: number[] = [];
      for (let i = 0; i < line.length; i++) {
        if (i + 1 < line.length && line[i] === line[i + 1]) {
          merged.push(line[i] * 2);
          newScore += line[i] * 2;
          i++; // skip next
        } else {
          merged.push(line[i]);
        }
      }
      while (merged.length < GRID_SIZE) merged.push(0);
      // write back
      a = dir === "up" ? 0 : dir === "down" ? GRID_SIZE - 1 : 0;
      b = dir === "left" ? 0 : dir === "right" ? GRID_SIZE - 1 : 0;
      for (let i = 0; i < GRID_SIZE; i++) {
        if (newBoard[a][b] !== merged[i]) moved = true;
        newBoard[a][b] = merged[i];
        a += dir === "up" ? 1 : dir === "down" ? -1 : 0;
        b += dir === "left" ? 1 : dir === "right" ? -1 : 0;
      }
    };

    if (dir === "up" || dir === "down") {
      for (let c = 0; c < GRID_SIZE; c++) {
        traverse(dir === "up" ? 0 : GRID_SIZE - 1, c, dir === "up" ? 1 : -1);
      }
    } else {
      for (let r = 0; r < GRID_SIZE; r++) {
        traverse(r, dir === "left" ? 0 : GRID_SIZE - 1, dir === "left" ? 1 : -1);
      }
    }

    if (moved) {
      addRandomTile(newBoard);
      setBoard(newBoard);
      setScore(newScore);
      checkGameOver(newBoard);
    }
  };

  const checkGameOver = (b: number[][]) => {
    // win condition
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (b[r][c] === 2048) {
          setGameOver(true);
          return;
        }
      }
    }
    // no moves left
    const hasEmpty = b.some(row => row.includes(0));
    if (hasEmpty) return;
    const canMerge = b.some((row, r) =>
      row.some((val, c) => {
        if (c + 1 < GRID_SIZE && val === row[c + 1]) return true;
        if (r + 1 < GRID_SIZE && val === b[r + 1][c]) return true;
        return false;
      })
    );
    if (!canMerge) setGameOver(true);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-2xl font-bold">2048</div>
      <div className="text-xl">Score: {score}</div>
      <div className="grid grid-cols-4 gap-2">
        {board.flat().map((val, idx) => (
          <div
            key={idx}
            className={`flex items-center justify-center h-12 w-12 rounded-md text-center text-xl font-semibold ${
              val
                ? "bg-yellow-200 text-black"
                : "bg-gray-200 text-gray-500"
            }`}
          >
            {val || ""}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => move("up")}>↑</Button>
        <Button variant="outline" onClick={() => move("down")}>↓</Button>
        <Button variant="outline" onClick={() => move("left")}>←</Button>
        <Button variant="outline" onClick={() => move("right")}>→</Button>
      </div>
      {gameOver && (
        <div className="flex flex-col items-center gap-2">
          <div className="text-lg font-semibold">Game Over!</div>
          <Share text={`I scored ${score} in 2048! ${url}`} />
        </div>
      )}
    </div>
  );
}
